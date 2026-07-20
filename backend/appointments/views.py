from datetime import date, timedelta
from django.db import transaction
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Appointment, ConsultationReport, Notification, ClinicConfiguration
from .serializers import (
    AppointmentCreateSerializer, AppointmentSerializer,
    AppointmentListSerializer, AppointmentStaffUpdateSerializer,
    ConsultationReportSerializer, ConsultationReportListSerializer,
    NotificationSerializer, ClinicConfigurationSerializer
)
from .services import (
    get_available_slots, check_slot_availability, get_clinic_info,
    create_notification, create_vaccination_schedule, deduct_vaccine_stock
)
from accounts.permissions import IsAdminOrDoctorOrNurse, _get_role
from audit_logs.models import log_activity


# ─── Public / Availability Endpoints ─────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_slots_view(request):
    """Get available time slots for a given date."""
    date_str = request.query_params.get('date', '')

    if not date_str:
        return Response(
            {'error': 'Date parameter is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    available_slots = get_available_slots(target_date)
    clinic_info = get_clinic_info()

    return Response({
        'date': date_str,
        'slots': available_slots,
        'clinic_info': clinic_info,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_slot_view(request):
    """Check if a specific slot is available for booking."""
    date_str = request.query_params.get('date', '')
    time_slot = request.query_params.get('time', '')

    if not date_str or not time_slot:
        return Response(
            {'error': 'Both date and time parameters are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    result = check_slot_availability(target_date, time_slot)
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def clinic_info_view(request):
    """Get clinic scheduling information."""
    info = get_clinic_info()
    return Response(info)


# ─── Appointment CRUD Endpoints ─────────────────────────────────────

class AppointmentListCreateView(generics.ListCreateAPIView):
    """List user's appointments or create a new appointment."""

    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'appointment_date', 'reason']
    search_fields = ['patient_name', 'appointment_number', 'patient_phone']
    ordering_fields = ['appointment_date', 'time_slot', 'created_at']
    ordering = ['-appointment_date', 'time_slot']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AppointmentCreateSerializer
        return AppointmentListSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role in ['admin', 'doctor', 'veterinarian', 'nurse']:
            return Appointment.objects.select_related('booked_by', 'patient', 'consultation').all()
        return Appointment.objects.filter(booked_by=user).select_related('booked_by', 'patient', 'consultation')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or cancel an appointment."""

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        user = self.request.user
        is_staff = hasattr(user, 'profile') and user.profile.role in ['admin', 'doctor', 'veterinarian', 'nurse']
        if self.request.method in ['PUT', 'PATCH'] and is_staff:
            return AppointmentStaffUpdateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role in ['admin', 'doctor', 'veterinarian', 'nurse']:
            return Appointment.objects.select_related('booked_by', 'patient', 'consultation').all()
        return Appointment.objects.filter(booked_by=user).select_related('booked_by', 'patient', 'consultation')

    def perform_update(self, serializer):
        user = self.request.user
        is_staff = hasattr(user, 'profile') and user.profile.role in ['admin', 'doctor', 'veterinarian', 'nurse']

        # Track status changes for audit
        old_status = self.get_object().status if self.get_object() else None
        new_status = serializer.validated_data.get('status')

        # If user cancels their own appointment
        if not is_staff and new_status == 'cancelled':
            instance = self.get_object()
            if not instance.can_cancel:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(
                    "Cannot cancel appointment within the cutoff period."
                )
            serializer.save()
        elif is_staff:
            serializer.save(handled_by=user)
        else:
            serializer.save()

        # Audit log for status changes
        if new_status and new_status != old_status:
            instance = serializer.instance
            log_activity(
                user=user,
                action='update',
                module='appointments',
                description=f"Appointment {instance.appointment_number} status changed: {old_status} → {new_status}",
                model_name='Appointment',
                object_id=instance.id,
                object_repr=str(instance),
                request=self.request,
                changes={'old_status': old_status, 'new_status': new_status},
            )


# ─── Staff Management Endpoints ─────────────────────────────────────

class AppointmentStaffListView(generics.ListAPIView):
    """Staff view to list all appointments with full details."""

    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrDoctorOrNurse]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'appointment_date', 'reason']
    search_fields = ['patient_name', 'appointment_number', 'patient_phone', 'booked_by__username']
    ordering_fields = ['appointment_date', 'time_slot', 'created_at']
    ordering = ['-appointment_date', 'time_slot']

    def get_queryset(self):
        return Appointment.objects.select_related('booked_by', 'handled_by', 'patient', 'consultation').all()


# ─── Workflow Action Endpoints ──────────────────────────────────────

def _get_appointment_or_404(pk):
    """Helper to get an appointment or return 404."""
    try:
        return Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return None


def _is_clinical_staff(user):
    """Check if user has clinical staff role."""
    return hasattr(user, 'profile') and user.profile.role in ['admin', 'doctor', 'veterinarian', 'nurse']


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_appointment_view(request, pk):
    """Approve a pending appointment."""
    # Staff and clinical roles only
    role = _get_role(request)
    if role not in ['admin', 'staff', 'nurse', 'doctor', 'veterinarian']:
        return Response({'error': 'You do not have permission to approve appointments.'}, status=status.HTTP_403_FORBIDDEN)

    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    if appointment.status != 'pending':
        return Response({'error': f'Cannot approve appointment with status "{appointment.status}".'}, status=status.HTTP_400_BAD_REQUEST)

    appointment.status = 'approved'
    appointment.handled_by = request.user
    appointment.save()

    # Notify the patient
    create_notification(
        recipient=appointment.booked_by,
        notification_type='appointment_approved',
        title='Appointment Approved',
        message=f'Your appointment {appointment.appointment_number} on {appointment.appointment_date} has been approved.',
        appointment=appointment,
    )

    log_activity(user=request.user, action='update', module='appointments',
                 description=f"Approved appointment {appointment.appointment_number}",
                 model_name='Appointment', object_id=appointment.id, object_repr=str(appointment),
                 request=request)

    return Response(AppointmentSerializer(appointment).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def reject_appointment_view(request, pk):
    """Reject a pending appointment."""
    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    if appointment.status != 'pending':
        return Response({'error': f'Cannot reject appointment with status "{appointment.status}".'}, status=status.HTTP_400_BAD_REQUEST)

    reason = request.data.get('reason', '')
    appointment.status = 'rejected'
    appointment.staff_notes = reason
    appointment.handled_by = request.user
    appointment.save()

    create_notification(
        recipient=appointment.booked_by,
        notification_type='appointment_rejected',
        title='Appointment Rejected',
        message=f'Your appointment {appointment.appointment_number} has been rejected. Reason: {reason or "Not specified"}',
        appointment=appointment,
    )

    log_activity(user=request.user, action='update', module='appointments',
                 description=f"Rejected appointment {appointment.appointment_number}",
                 model_name='Appointment', object_id=appointment.id, object_repr=str(appointment),
                 request=request)

    return Response(AppointmentSerializer(appointment).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def check_in_view(request, pk):
    """Mark an appointment as checked in (patient arrived)."""
    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Staff/staff must have at least non-patient role to check in
    role = _get_role(request)
    if role not in ['admin', 'staff', 'nurse', 'doctor', 'veterinarian']:
        return Response({'error': 'You do not have permission to check in patients.'}, status=status.HTTP_403_FORBIDDEN)

    if appointment.status not in ['approved']:
        return Response({'error': f'Cannot check in appointment with status "{appointment.status}".'}, status=status.HTTP_400_BAD_REQUEST)

    appointment.status = 'checked_in'
    appointment.checked_in_at = timezone.now()
    appointment.handled_by = request.user
    appointment.save()

    # Notify veterinarians
    vets = User.objects.filter(
        profile__role__in=['veterinarian', 'doctor', 'admin']
    )
    for vet in vets:
        create_notification(
            recipient=vet,
            notification_type='checked_in',
            title='Patient Checked In',
            message=f'{appointment.patient_name} has checked in for appointment {appointment.appointment_number}.',
            appointment=appointment,
        )

    log_activity(user=request.user, action='update', module='appointments',
                 description=f"Checked in patient {appointment.patient_name} for {appointment.appointment_number}",
                 model_name='Appointment', object_id=appointment.id, object_repr=str(appointment),
                 request=request)

    return Response(AppointmentSerializer(appointment).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def start_consultation_view(request, pk):
    """Start consultation for a checked-in appointment (veterinarian)."""
    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    if appointment.status not in ['checked_in', 'approved']:
        return Response({'error': f'Cannot start consultation for appointment with status "{appointment.status}".'}, status=status.HTTP_400_BAD_REQUEST)

    veterinarian = request.data.get('veterinarian_id')

    vet_user = None
    if veterinarian:
        try:
            vet_user = User.objects.get(pk=veterinarian)
        except User.DoesNotExist:
            pass

    now = timezone.now()
    appointment.status = 'under_consultation'
    appointment.consultation_started_at = now
    appointment.assigned_veterinarian = vet_user or request.user
    appointment.save()

    log_activity(user=request.user, action='update', module='appointments',
                 description=f"Started consultation for {appointment.appointment_number} by {request.user.username}",
                 model_name='Appointment', object_id=appointment.id, object_repr=str(appointment),
                 request=request)

    return Response(AppointmentSerializer(appointment).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def save_consultation_report_view(request, pk):
    """Save or update the consultation report for an appointment (veterinarian)."""
    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    if appointment.status not in ['under_consultation', 'checked_in', 'approved']:
        return Response({'error': f'Cannot save consultation for status "{appointment.status}".'}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data
    patient_id = data.get('patient', appointment.patient.id if appointment.patient else None)

    # Try to find an existing report, or create a new one
    existing_report = ConsultationReport.objects.filter(appointment=appointment).first()

    report_defaults = {
        'patient_id': patient_id,
        'case_id': data.get('case', None),
        'weight_kg': data.get('weight_kg'),
        'temperature_celsius': data.get('temperature_celsius'),
        'clinical_findings': data.get('clinical_findings', ''),
        'symptoms': data.get('symptoms', ''),
        'symptom_severity': data.get('symptom_severity', 'none'),
        'diagnosis': data.get('diagnosis', ''),
        'treatment_plan': data.get('treatment_plan', ''),
        'rabies_risk_assessment': data.get('rabies_risk_assessment', ''),
        'notes': data.get('notes', ''),
        'recorded_by': request.user,
    }

    if existing_report:
        for field, value in report_defaults.items():
            setattr(existing_report, field, value)
        existing_report.save()
        report = existing_report
        created = False
    else:
        report = ConsultationReport.objects.create(
            appointment=appointment,
            **report_defaults
        )
        created = True

    appointment.status = 'under_consultation'
    appointment.save()

    log_activity(user=request.user, action='create' if created else 'update',
                 module='appointments',
                 description=f"Consultation report {'saved' if created else 'updated'} for {appointment.appointment_number}",
                 model_name='ConsultationReport', object_id=report.id, object_repr=str(report),
                 request=request)

    serializer = ConsultationReportSerializer(report, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def start_vaccination_view(request, pk):
    """Transition appointment to vaccination stage."""
    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    if appointment.status not in ['under_consultation']:
        return Response({'error': f'Cannot start vaccination for status "{appointment.status}".'}, status=status.HTTP_400_BAD_REQUEST)

    appointment.status = 'vaccination_ongoing'
    appointment.vaccination_started_at = timezone.now()
    appointment.save()

    log_activity(user=request.user, action='update', module='appointments',
                 description=f"Started vaccination for {appointment.appointment_number}",
                 model_name='Appointment', object_id=appointment.id, object_repr=str(appointment),
                 request=request)

    return Response(AppointmentSerializer(appointment).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def administer_vaccination_view(request, pk):
    """
    Record a vaccination administered during an appointment.
    Creates the actual VaccinationRecord, auto-schedules next dose,
    and deducts vaccine inventory.
    """
    from vaccinations.models import VaccinationRecord
    from vaccinations.serializers import VaccinationRecordSerializer as VaxOutputSerializer
    from patients.models import Patient
    from inventory.models import Vaccine

    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    if appointment.status != 'vaccination_ongoing':
        return Response({
            'error': f'Cannot administer vaccination for status "{appointment.status}". Must be "vaccination_ongoing".'
        }, status=status.HTTP_400_BAD_REQUEST)

    data = request.data

    # Resolve patient and vaccine
    patient_id = data.get('patient') or (appointment.patient.id if appointment.patient else None)
    if not patient_id:
        return Response({'error': 'No patient linked to this appointment. Select a patient first.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        patient = Patient.objects.get(pk=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)

    vaccine_id = data.get('vaccine')
    vaccine = None
    if vaccine_id:
        try:
            vaccine = Vaccine.objects.get(pk=vaccine_id)
        except Vaccine.DoesNotExist:
            return Response({'error': 'Vaccine not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Wrap all operations in a transaction to prevent partial updates
    with transaction.atomic():
        # Create the vaccination record
        vax_record = VaccinationRecord.objects.create(
            patient=patient,
            appointment=appointment,
            case_id=data.get('case'),
            vaccine=vaccine,
            dose_type=data.get('dose_type', 'first'),
            dose_number=data.get('dose_number', 1),
            scheduled_date=data.get('scheduled_date', date.today()),
            administered_date=data.get('administered_date', date.today()),
            administration_route=data.get('administration_route', 'im'),
            injection_site=data.get('injection_site', ''),
            batch_number=data.get('batch_number', ''),
            dosage_amount=data.get('dosage_amount', ''),
            manufacturer=data.get('manufacturer', ''),
            result='administered',
            notes=data.get('notes', ''),
            administered_by=request.user,
        )

        # Auto-schedule next dose
        created_schedule = create_vaccination_schedule(vax_record, appointment)

        # Auto-deduct vaccine inventory
        deducted_batch = deduct_vaccine_stock(vax_record)

        # Update appointment
        appointment.vaccination_started_at = appointment.vaccination_started_at or timezone.now()

        # If observation requested, move there; otherwise auto-complete
        send_to_observation = data.get('send_to_observation', False)
        if send_to_observation:
            appointment.status = 'observation'
            appointment.observation_started_at = timezone.now()
            obs_minutes = data.get('observation_minutes', 30)
            appointment.observation_end = timezone.now() + timezone.timedelta(minutes=int(obs_minutes))
            appointment.observation_condition = data.get('observation_condition', '')
            appointment.observation_notes = data.get('observation_notes', '')
        else:
            appointment.status = 'completed'
            appointment.completed_at = timezone.now()
            appointment.released_by = request.user
        appointment.save()

    # Notify patient (notification creation is outside the transaction;
    # a duplicate notification on retry is harmless)
    create_notification(
        recipient=appointment.booked_by,
        notification_type='vaccination_complete',
        title='Vaccination Complete',
        message=f'Vaccination (Dose {vax_record.dose_number}) administered to {patient.get_full_name()}.',
        appointment=appointment,
    )

    log_activity(user=request.user, action='create', module='vaccinations',
                 description=f"Vaccination recorded for {patient.get_full_name()} — Dose {vax_record.dose_number} ({vax_record.get_dose_type_display()})",
                 model_name='VaccinationRecord', object_id=vax_record.id, object_repr=str(vax_record),
                 request=request)

    # Serialize and return
    vax_serializer = VaxOutputSerializer(vax_record)

    return Response({
        'message': 'Vaccination recorded successfully.',
        'vaccination_record': vax_serializer.data,
        'next_schedule_created': created_schedule is not None,
        'inventory_deducted': deducted_batch is not None,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def start_observation_view(request, pk):
    """Send appointment to observation stage."""
    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    if appointment.status not in ['vaccination_ongoing', 'under_consultation']:
        return Response({'error': f'Cannot start observation for status "{appointment.status}".'}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    appointment.status = 'observation'
    appointment.observation_started_at = now
    appointment.observation_condition = request.data.get('condition', '')
    appointment.observation_notes = request.data.get('notes', '')

    # Default observation end is 30 minutes from now
    obs_minutes = request.data.get('observation_minutes', 30)
    appointment.observation_end = now + timezone.timedelta(minutes=int(obs_minutes))

    appointment.released_by = request.user
    appointment.save()

    log_activity(user=request.user, action='update', module='appointments',
                 description=f"Sent {appointment.appointment_number} to observation",
                 model_name='Appointment', object_id=appointment.id, object_repr=str(appointment),
                 request=request)

    return Response(AppointmentSerializer(appointment).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def complete_treatment_view(request, pk):
    """Complete the appointment and all associated treatment.

    Auto-creates a VaccinationRecord if the appointment is being completed
    from 'vaccination_ongoing' status and no record exists yet.
    """
    from vaccinations.models import VaccinationRecord
    from vaccinations.serializers import VaccinationRecordSerializer as VaxOutputSerializer

    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    if appointment.status not in ['vaccination_ongoing', 'observation', 'under_consultation']:
        return Response({'error': f'Cannot complete appointment with status "{appointment.status}".'}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    auto_created_record = None

    # Wrap operations in a transaction to prevent partial updates
    with transaction.atomic():
        # Safety net: if completing from vaccination_ongoing and no VaccinationRecord
        # exists for this appointment, auto-create one
        if appointment.status == 'vaccination_ongoing':
            existing_records = VaccinationRecord.objects.filter(appointment=appointment)
            if not existing_records.exists():
                if appointment.patient:
                    auto_created_record = VaccinationRecord.objects.create(
                        patient=appointment.patient,
                        appointment=appointment,
                        dose_number=1,
                        dose_type='first',
                        scheduled_date=appointment.appointment_date,
                        administered_date=date.today(),
                        result='administered',
                        administered_by=request.user,
                        notes='Auto-created on appointment completion.',
                    )
                    # Auto-schedule next dose
                    create_vaccination_schedule(auto_created_record, appointment)
                    # Auto-deduct inventory (only if vaccine was set)
                    deduct_vaccine_stock(auto_created_record)

        appointment.status = 'completed'
        appointment.completed_at = now
        appointment.released_by = request.user
        appointment.save()

    # Notify patient (outside transaction — harmless if duplicated on retry)
    create_notification(
        recipient=appointment.booked_by,
        notification_type='treatment_completed',
        title='Treatment Completed',
        message=f'Your treatment for appointment {appointment.appointment_number} has been completed.',
        appointment=appointment,
    )

    log_activity(user=request.user, action='update', module='appointments',
                 description=f"Completed appointment {appointment.appointment_number}",
                 model_name='Appointment', object_id=appointment.id, object_repr=str(appointment),
                 request=request)

    response_data = AppointmentSerializer(appointment).data

    # Include vaccination record info in response when auto-created
    if auto_created_record:
        vax_serializer = VaxOutputSerializer(auto_created_record)
        response_data['vaccination_record'] = vax_serializer.data
        response_data['auto_created_record'] = True

    return Response(response_data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def no_show_view(request, pk):
    """Mark appointment as no-show."""
    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Staff or clinical roles only
    role = _get_role(request)
    if role not in ['admin', 'staff', 'nurse', 'doctor', 'veterinarian']:
        return Response({'error': 'You do not have permission to mark no-show.'}, status=status.HTTP_403_FORBIDDEN)

    appointment.status = 'no_show'
    appointment.staff_notes = request.data.get('reason', appointment.staff_notes)
    appointment.save()

    log_activity(user=request.user, action='update', module='appointments',
                 description=f"Marked {appointment.appointment_number} as no-show",
                 model_name='Appointment', object_id=appointment.id, object_repr=str(appointment),
                 request=request)

    return Response({'message': 'Appointment marked as no-show.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_appointment_view(request, pk):
    """Cancel an appointment (user or staff)."""
    appointment = _get_appointment_or_404(pk)
    if not appointment:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    is_staff = _is_clinical_staff(user)

    # Check permissions
    if appointment.booked_by != user and not is_staff:
        return Response({'error': 'You can only cancel your own appointments.'}, status=status.HTTP_403_FORBIDDEN)

    # Check cancellation policy
    if not is_staff and not appointment.can_cancel:
        return Response(
            {'error': 'Cannot cancel appointment within the cutoff period. Please contact the clinic.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    appointment.status = 'cancelled'
    appointment.staff_notes = request.data.get('reason', appointment.staff_notes)
    appointment.save()

    log_activity(user=request.user, action='update', module='appointments',
                 description=f"Cancelled appointment {appointment.appointment_number}",
                 model_name='Appointment', object_id=appointment.id, object_repr=str(appointment),
                 request=request)

    return Response({'message': 'Appointment cancelled successfully.'})


# ─── Veterinarian Queue Endpoint ────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def veterinarian_queue_view(request):
    """Get the veterinarian's queue of patients waiting for consultation."""
    user = request.user
    is_vet = hasattr(user, 'profile') and user.profile.role in ['veterinarian', 'doctor', 'admin']

    if not is_vet:
        return Response({'error': 'Only veterinarians can access the queue.'}, status=status.HTTP_403_FORBIDDEN)

    today = date.today()

    # Patients waiting for consultation
    waiting = Appointment.objects.filter(
        appointment_date=today,
        status__in=['checked_in', 'approved']
    ).select_related('booked_by', 'patient').order_by('checked_in_at', 'appointment_date', 'time_slot')

    # Current consultation
    current = Appointment.objects.filter(
        assigned_veterinarian=user,
        status='under_consultation'
    ).select_related('booked_by', 'patient', 'consultation').first()

    return Response({
        'waiting_count': waiting.count(),
        'waiting': AppointmentListSerializer(waiting, many=True).data,
        'current_consultation': AppointmentSerializer(current).data if current else None,
    })


# ─── Consultation Report Endpoints ──────────────────────────────────

class ConsultationReportListView(generics.ListAPIView):
    """List consultation reports."""

    serializer_class = ConsultationReportListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrDoctorOrNurse]

    def get_queryset(self):
        return ConsultationReport.objects.select_related('patient', 'recorded_by').all().order_by('-created_at')


class ConsultationReportDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a consultation report."""

    queryset = ConsultationReport.objects.select_related('patient', 'case', 'recorded_by').all()
    serializer_class = ConsultationReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrDoctorOrNurse]


# ─── Notification Endpoints ─────────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_notifications_view(request):
    """Get the current user's notifications."""
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'

    qs = Notification.objects.filter(recipient=request.user)
    if unread_only:
        qs = qs.filter(is_read=False)

    total = qs.count()
    unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()

    start = (page - 1) * page_size
    end = start + page_size
    notifications = qs[start:end]

    return Response({
        'count': total,
        'unread_count': unread_count,
        'results': NotificationSerializer(notifications, many=True).data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read_view(request, pk):
    """Mark a single notification as read."""
    try:
        notification = Notification.objects.get(pk=pk, recipient=request.user)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)

    notification.is_read = True
    notification.save()
    return Response({'message': 'Notification marked as read.'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read_view(request):
    """Mark all notifications as read for the current user."""
    updated = Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'message': f'{updated} notifications marked as read.'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_notification_count_view(request):
    """Get the count of unread notifications."""
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'unread_count': count})


# ─── User's Appointments Endpoints ──────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_upcoming_appointments_view(request):
    """Get the current user's upcoming appointments."""
    today = date.today()
    appointments = Appointment.objects.filter(
        booked_by=request.user,
        appointment_date__gte=today,
        status__in=['pending', 'approved', 'checked_in', 'under_consultation', 'vaccination_ongoing', 'observation']
    ).order_by('appointment_date', 'time_slot')

    return Response(AppointmentListSerializer(appointments, many=True).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_appointment_history_view(request):
    """Get the current user's appointment history."""
    appointments = Appointment.objects.filter(
        booked_by=request.user
    ).order_by('-appointment_date', '-time_slot')[:50]

    return Response(AppointmentListSerializer(appointments, many=True).data)


# ─── Clinic Configuration Endpoints ─────────────────────────────────

class ClinicConfigurationView(generics.RetrieveUpdateAPIView):
    """Get or update clinic configuration."""

    queryset = ClinicConfiguration.objects.all()
    serializer_class = ClinicConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        from .services import get_clinic_config
        return get_clinic_config()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            from accounts.permissions import IsAdmin
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]
