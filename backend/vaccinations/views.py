from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import date
from .models import VaccinationRecord, VaccinationSchedule
from .serializers import (
    VaccinationRecordSerializer, VaccinationRecordListSerializer,
    VaccinationScheduleSerializer
)
from inventory.models import Vaccine
from accounts.permissions import CanDeleteRecord
from audit_logs.models import log_activity


class VaccinationRecordListCreateView(generics.ListCreateAPIView):
    """List all vaccination records or create a new one."""
    
    queryset = VaccinationRecord.objects.select_related('patient', 'vaccine', 'administered_by').all()
    permission_classes = [permissions.IsAuthenticated]
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
    
    def perform_create(self, serializer):
        serializer.save(administered_by=self.request.user)


class VaccinationRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a vaccination record."""
    
    queryset = VaccinationRecord.objects.select_related('patient', 'vaccine', 'administered_by').all()
    serializer_class = VaccinationRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [permissions.IsAuthenticated(), CanDeleteRecord()]
        return [permissions.IsAuthenticated()]
    
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
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_completed']
    ordering = ['scheduled_date']
    
    def perform_create(self, serializer):
        serializer.save()


class VaccinationScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a vaccination schedule."""
    
    queryset = VaccinationSchedule.objects.select_related('patient', 'case').all()
    serializer_class = VaccinationScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
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
@permission_classes([permissions.IsAuthenticated])
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
