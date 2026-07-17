from datetime import date, timedelta
from django.db.models import Count, Sum
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from patients.models import Patient
from cases.models import AnimalBiteCase
from vaccinations.models import VaccinationRecord, VaccinationSchedule
from inventory.models import Vaccine, LowStockAlert
from appointments.models import Appointment
from accounts.permissions import _get_role, STAFF_ROLES, CLINICAL_ROLES
from audit_logs.models import AuditLog, log_activity


# ── Shared helpers ──

def _role_dashboard_data(request, role):
    """Return role-filtered dashboard data."""
    today = date.today()
    month_start = today.replace(day=1)
    data = {'role': role}

    if role == 'admin':
        # ── Admin: full system oversight ──
        total_patients = Patient.objects.filter(is_active=True).count()
        todays_patients = Patient.objects.filter(created_at__date=today).count()
        total_staff = User.objects.filter(
            profile__role__in=['admin', 'doctor', 'veterinarian', 'nurse', 'staff']
        ).count()
        total_vets = User.objects.filter(profile__role='veterinarian').count()
        total_admins = User.objects.filter(profile__role='admin').count()
        todays_appts = Appointment.objects.filter(appointment_date=today).count()
        open_cases = AnimalBiteCase.objects.filter(case_status='open').count()
        completed_cases = AnimalBiteCase.objects.filter(case_status='completed').count()
        total_vaccines = Vaccine.objects.filter(is_active=True).count()

        low_stock = []
        for alert in LowStockAlert.objects.filter(is_enabled=True):
            stock = alert.vaccine.current_stock
            if stock <= alert.threshold:
                low_stock.append({'id': alert.vaccine.id, 'name': str(alert.vaccine), 'stock': stock, 'threshold': alert.threshold})

        monthly_stats = []
        for i in range(5, -1, -1):
            m = today.month - i
            y = today.year
            if m <= 0:
                m += 12
                y -= 1
            ms = date(y, m, 1)
            me = date(y + 1, 1, 1) - timedelta(days=1) if m == 12 else date(y, m + 1, 1) - timedelta(days=1)
            monthly_stats.append({
                'month': f"{y}-{m:02d}",
                'label': date(y, m, 1).strftime('%B %Y'),
                'patients': Patient.objects.filter(created_at__date__gte=ms, created_at__date__lte=me).count(),
                'cases': AnimalBiteCase.objects.filter(incident_date__date__gte=ms, incident_date__date__lte=me).count(),
                'vaccinations': VaccinationRecord.objects.filter(administered_date__gte=ms, administered_date__lte=me, result='administered').count(),
            })

        recent_activities = AuditLog.objects.select_related('user').all().order_by('-created_at')[:10]

        data.update({
            'overview': {
                'total_patients': total_patients,
                'todays_patients': todays_patients,
                'total_staff': total_staff,
                'total_veterinarians': total_vets,
                'total_admins': total_admins,
                'todays_appointments': todays_appts,
                'open_cases': open_cases,
                'completed_cases': completed_cases,
                'total_vaccines': total_vaccines,
                'low_stock_count': len(low_stock),
            },
            'low_stock_items': low_stock,
            'monthly_statistics': monthly_stats,
            'recent_activities': [
                {'id': a.id, 'user': a.username, 'action': a.action, 'module': a.module, 'description': a.description, 'timestamp': a.created_at}
                for a in recent_activities
            ],
        })

    elif role == 'staff':
        # ── Staff: operational focus ──
        todays_patients = Patient.objects.filter(created_at__date=today).count()
        todays_appts = Appointment.objects.filter(appointment_date=today).count()
        todays_vax = VaccinationRecord.objects.filter(administered_date=today).count()
        upcoming = VaccinationSchedule.objects.filter(is_completed=False, scheduled_date__gte=today).count()
        low_stock = sum(1 for a in LowStockAlert.objects.filter(is_enabled=True) if a.vaccine.current_stock <= a.threshold)

        data.update({
            'overview': {
                'todays_patients': todays_patients,
                'todays_appointments': todays_appts,
                'vaccinations_today': todays_vax,
                'upcoming_followups': upcoming,
                'low_stock_count': low_stock,
            },
        })

    elif role == 'veterinarian':
        # ── Veterinarian: medical case focus ──
        total_cases = AnimalBiteCase.objects.filter(is_active=True).count()
        active_cases = AnimalBiteCase.objects.filter(case_status__in=['open', 'ongoing']).count()
        completed = AnimalBiteCase.objects.filter(case_status='completed').count()
        todays_consultations = Appointment.objects.filter(appointment_date=today, reason='new_bite').count()
        vax_completed = VaccinationRecord.objects.filter(administered_date=today, result='administered').count()

        data.update({
            'overview': {
                'assigned_patients': Patient.objects.filter(is_active=True).count(),
                'active_cases': active_cases,
                'total_cases': total_cases,
                'completed_cases': completed,
                'today_consultations': todays_consultations,
                'vaccinations_completed': vax_completed,
            },
        })

    elif role == 'patient':
        # ── Patient: self-service focus ──
        try:
            user = request.user
            upcoming_appt = Appointment.objects.filter(
                booked_by=user, appointment_date__gte=today, status__in=['pending', 'approved']
            ).order_by('appointment_date', 'time_slot').first()
            vax_records = VaccinationRecord.objects.filter(
                patient__registered_by=user
            ).order_by('-scheduled_date')[:5]
            next_schedule = VaccinationSchedule.objects.filter(
                patient__registered_by=user, is_completed=False, scheduled_date__gte=today
            ).order_by('scheduled_date').first()
        except Exception:
            upcoming_appt = None
            vax_records = []
            next_schedule = None

        data.update({
            'upcoming_appointment': {
                'id': upcoming_appt.id if upcoming_appt else None,
                'appointment_number': upcoming_appt.appointment_number if upcoming_appt else None,
                'date': upcoming_appt.appointment_date if upcoming_appt else None,
                'time_slot': upcoming_appt.time_slot if upcoming_appt else None,
                'status': upcoming_appt.status if upcoming_appt else None,
            } if upcoming_appt else None,
            'vaccination_progress': [
                {'id': v.id, 'dose': f"Dose {v.dose_number}", 'date': v.administered_date, 'result': v.result}
                for v in vax_records
            ],
            'next_vaccination': {
                'id': next_schedule.id if next_schedule else None,
                'dose': f"Dose {next_schedule.dose_number}" if next_schedule else None,
                'date': next_schedule.scheduled_date if next_schedule else None,
            } if next_schedule else None,
        })

    return data


# ── Role-specific dashboard endpoints ──

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_dashboard_view(request):
    """Admin dashboard — full system oversight."""
    role = _get_role(request)
    if role != 'admin':
        log_activity(user=request.user, action='view', module='dashboard',
                     description=f"Unauthorized access attempt to admin dashboard by {request.user.username}",
                     request=request)
        return Response({'detail': 'You do not have permission to access this dashboard.'}, status=status.HTTP_403_FORBIDDEN)
    return Response(_role_dashboard_data(request, 'admin'))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def staff_dashboard_view(request):
    """Staff dashboard — operational focus."""
    role = _get_role(request)
    if role not in ['staff', 'admin']:
        return Response({'detail': 'You do not have permission to access this dashboard.'}, status=status.HTTP_403_FORBIDDEN)
    return Response(_role_dashboard_data(request, 'staff'))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def veterinarian_dashboard_view(request):
    """Veterinarian dashboard — medical case focus."""
    role = _get_role(request)
    if role not in ['veterinarian', 'doctor', 'admin']:
        return Response({'detail': 'You do not have permission to access this dashboard.'}, status=status.HTTP_403_FORBIDDEN)
    return Response(_role_dashboard_data(request, 'veterinarian'))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_dashboard_view(request):
    """Patient dashboard — self-service focus."""
    role = _get_role(request)
    if role != 'patient':
        return Response({'detail': 'You do not have permission to access this dashboard.'}, status=status.HTTP_403_FORBIDDEN)
    return Response(_role_dashboard_data(request, 'patient'))
