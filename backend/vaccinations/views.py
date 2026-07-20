from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from datetime import date
from .models import VaccinationRecord, VaccinationSchedule
from .serializers import (
    VaccinationRecordSerializer, VaccinationRecordListSerializer,
    VaccinationScheduleSerializer
)
from inventory.models import Vaccine, VaccineBatch
from accounts.permissions import CanDeleteRecord, IsStaffUser
from audit_logs.models import log_activity


class VaccinationRecordListCreateView(generics.ListCreateAPIView):
    """List all vaccination records or create a new one."""
    
    queryset = VaccinationRecord.objects.select_related('patient', 'vaccine', 'administered_by').all()
    permission_classes = [permissions.IsAuthenticated, IsStaffUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['result', 'dose_type', 'dose_number']
    search_fields = ['patient__first_name', 'patient__last_name', 
                     'patient__patient_id_display', 'batch_number']
    ordering_fields = ['scheduled_date', 'administered_date', 'created_at']
    ordering = ['-scheduled_date']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return VaccinationRecordListSerializer
        return VaccinationRecordSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a vaccination record with:
        - Duplicate prevention (same patient + dose_number)
        - Transaction atomicity
        - Inventory deduction
        - Audit logging
        - Auto-appointment linking
        - Clear field-level error messages
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=False)
        
        # If validation failed, return ALL field errors in a readable format
        if serializer.errors:
            errors = {}
            for field, messages in serializer.errors.items():
                errors[field] = [str(m) for m in messages]
            return Response(
                {'error': 'Validation failed.', 'field_errors': errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        patient = data.get('patient')
        dose_number = data.get('dose_number', 1)
        
        # Duplicate check: same patient + same dose number
        if patient and dose_number:
            duplicate = VaccinationRecord.objects.filter(
                patient=patient,
                dose_number=dose_number
            ).exclude(result='cancelled').first()
            if duplicate:
                return Response(
                    {'error': f'Dose {dose_number} has already been recorded for {patient.get_full_name()} on {duplicate.administered_date or duplicate.scheduled_date}. Cannot create duplicate.'},
                    status=status.HTTP_409_CONFLICT
                )
        
        # Auto-link to an active appointment for this patient
        appointment = data.get('appointment')
        if not appointment and patient:
            from appointments.models import Appointment
            active_appt = Appointment.objects.filter(
                patient=patient,
                status__in=['approved', 'checked_in', 'under_consultation', 'vaccination_ongoing']
            ).order_by('-appointment_date', '-time_slot').first()
            if active_appt:
                appointment = active_appt
        
        # Deduct vaccine inventory if a vaccine is selected
        vaccine = data.get('vaccine')
        batch_number = data.get('batch_number', '')
        
        # Check stock availability before proceeding
        if vaccine and vaccine.current_stock < 1:
            return Response(
                {'error': f'Insufficient stock for {vaccine.name}. Current stock: {vaccine.current_stock}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                record = VaccinationRecord.objects.create(
                    patient=patient,
                    appointment=appointment,
                    case_id=data.get('case'),
                    vaccine=vaccine,
                    dose_type=data.get('dose_type', 'first'),
                    dose_number=dose_number,
                    scheduled_date=data.get('scheduled_date', date.today()),
                    administered_date=data.get('administered_date'),
                    administration_route=data.get('administration_route', 'im'),
                    injection_site=data.get('injection_site', ''),
                    batch_number=batch_number,
                    dosage_amount=data.get('dosage_amount', ''),
                    manufacturer=data.get('manufacturer', ''),
                    result=data.get('result', 'administered'),
                    notes=data.get('notes', ''),
                    adverse_reaction=data.get('adverse_reaction', ''),
                    administered_by=request.user,
                )
                
                # Auto-deduct inventory stock
                if vaccine:
                    VaccineBatch.objects.create(
                        vaccine=vaccine,
                        batch_number=batch_number or 'AUTO',
                        transaction_type='out',
                        quantity=1,
                        reference_record=record,
                        notes=f"Auto-deducted for vaccination record #{record.id}",
                        recorded_by=request.user,
                    )
                
                # If appointment was linked, mark it as completed
                if appointment and appointment.status in ['approved', 'checked_in', 'under_consultation', 'vaccination_ongoing']:
                    appointment.status = 'completed'
                    appointment.completed_at = timezone.now()
                    appointment.released_by = request.user
                    appointment.save(update_fields=['status', 'completed_at', 'released_by', 'updated_at'])
                
        except Exception as e:
            return Response(
                {'error': f'Database error while saving: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Audit log
        log_activity(
            user=request.user,
            action='create',
            module='vaccinations',
            description=f"Recorded vaccination for {patient.get_full_name()} — Dose {dose_number}",
            model_name='VaccinationRecord',
            object_id=record.id,
            object_repr=str(record),
            request=request,
        )
        
        output_serializer = self.get_serializer(record)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class VaccinationRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a vaccination record."""
    
    queryset = VaccinationRecord.objects.select_related('patient', 'vaccine', 'administered_by').all()
    serializer_class = VaccinationRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [permissions.IsAuthenticated(), CanDeleteRecord()]
        return [permissions.IsAuthenticated(), IsStaffUser()]
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        log_activity(
            user=self.request.user,
            action='delete',
            module='vaccinations',
            description=f"Deleted vaccination record for {instance.patient.get_full_name()}",
            model_name='VaccinationRecord',
            object_id=instance.id,
            object_repr=str(instance),
            request=self.request,
        )


class VaccinationScheduleListCreateView(generics.ListCreateAPIView):
    """List all vaccination schedules or create new ones."""
    
    queryset = VaccinationSchedule.objects.select_related('patient', 'case').all()
    serializer_class = VaccinationScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_completed']
    ordering = ['scheduled_date']
    
    def perform_create(self, serializer):
        serializer.save()


class VaccinationScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a vaccination schedule."""
    
    queryset = VaccinationSchedule.objects.select_related('patient', 'case').all()
    serializer_class = VaccinationScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffUser]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsStaffUser])
def missed_vaccinations_view(request):
    """Get list of missed/scheduled vaccinations for today and overdue."""
    today = date.today()
    
    missed = VaccinationRecord.objects.filter(
        result='missed'
    ).select_related('patient', 'vaccine').order_by('-scheduled_date')[:50]
    
    upcoming = VaccinationSchedule.objects.filter(
        is_completed=False,
        scheduled_date__gte=today
    ).select_related('patient', 'case').order_by('scheduled_date')[:20]
    
    return Response({
        'missed': VaccinationRecordListSerializer(missed, many=True).data,
        'upcoming': VaccinationScheduleSerializer(upcoming, many=True).data,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsStaffUser])
def today_vaccinations_view(request):
    """Get today's scheduled vaccinations."""
    today = date.today()
    
    today_schedule = VaccinationSchedule.objects.filter(
        is_completed=False,
        scheduled_date=today
    ).select_related('patient', 'case').order_by('dose_number')
    
    return Response(
        VaccinationScheduleSerializer(today_schedule, many=True).data
    )
