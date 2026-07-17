from datetime import date
from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Appointment, ClinicConfiguration
from .serializers import (
    AppointmentCreateSerializer, AppointmentSerializer,
    AppointmentListSerializer, AppointmentStaffUpdateSerializer,
    ClinicConfigurationSerializer
)
from .services import (
    get_available_slots, check_slot_availability, get_clinic_info
)
from accounts.permissions import IsAdminOrDoctorOrNurse


# ─── Public Availability Endpoints ───────────────────────────────────
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
        # Staff can see all appointments; users see only their own
        if hasattr(user, 'profile') and user.profile.role in ['admin', 'doctor', 'veterinarian', 'nurse']:
            return Appointment.objects.select_related('booked_by').all()
        return Appointment.objects.filter(booked_by=user).select_related('booked_by')
    
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
            return Appointment.objects.select_related('booked_by').all()
        return Appointment.objects.filter(booked_by=user).select_related('booked_by')
    
    def perform_update(self, serializer):
        user = self.request.user
        is_staff = hasattr(user, 'profile') and user.profile.role in ['admin', 'doctor', 'veterinarian', 'nurse']
        
        # If user cancels their own appointment
        if not is_staff and serializer.validated_data.get('status') == 'cancelled':
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


# ─── Staff-only Management Endpoints ────────────────────────────────
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
        return Appointment.objects.select_related('booked_by', 'handled_by').all()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def approve_appointment_view(request, pk):
    """Approve a pending appointment."""
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    appointment.status = 'approved'
    appointment.handled_by = request.user
    appointment.save()
    
    return Response(AppointmentSerializer(appointment).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def reject_appointment_view(request, pk):
    """Reject a pending appointment."""
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    reason = request.data.get('reason', '')
    appointment.status = 'rejected'
    appointment.staff_notes = reason
    appointment.handled_by = request.user
    appointment.save()
    
    return Response(AppointmentSerializer(appointment).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrDoctorOrNurse])
def complete_appointment_view(request, pk):
    """Mark an appointment as completed."""
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    appointment.status = 'completed'
    appointment.handled_by = request.user
    appointment.save()
    
    return Response(AppointmentSerializer(appointment).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_appointment_view(request, pk):
    """Cancel an appointment (user or staff)."""
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    user = request.user
    is_staff = hasattr(user, 'profile') and user.profile.role in ['admin', 'doctor', 'veterinarian', 'nurse']
    
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
    
    return Response({'message': 'Appointment cancelled successfully.'})


# ─── User's Appointments Endpoints ──────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_upcoming_appointments_view(request):
    """Get the current user's upcoming appointments."""
    today = date.today()
    appointments = Appointment.objects.filter(
        booked_by=request.user,
        appointment_date__gte=today,
        status__in=['pending', 'approved']
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


# ─── Clinic Configuration Endpoints (Admin only) ────────────────────
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
