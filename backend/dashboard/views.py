from datetime import date, timedelta, datetime
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from patients.models import Patient
from cases.models import AnimalBiteCase
from vaccinations.models import VaccinationRecord, VaccinationSchedule
from inventory.models import Vaccine, LowStockAlert


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats_view(request):
    """Get main dashboard statistics."""
    today = date.today()
    month_start = today.replace(day=1)
    
    # Patient counts
    total_patients = Patient.objects.filter(is_active=True).count()
    todays_patients = Patient.objects.filter(created_at__date=today).count()
    patients_this_month = Patient.objects.filter(created_at__date__gte=month_start).count()
    
    # Case counts
    total_cases = AnimalBiteCase.objects.filter(is_active=True).count()
    todays_cases = AnimalBiteCase.objects.filter(incident_date__date=today).count()
    open_cases = AnimalBiteCase.objects.filter(case_status='open').count()
    ongoing_cases = AnimalBiteCase.objects.filter(case_status='ongoing').count()
    completed_cases = AnimalBiteCase.objects.filter(case_status='completed').count()
    
    # Case distribution by category
    category_distribution = AnimalBiteCase.objects.values('bite_category').annotate(
        count=Count('id')
    ).order_by('bite_category')
    
    # Vaccination stats
    todays_scheduled = VaccinationSchedule.objects.filter(
        scheduled_date=today, is_completed=False
    ).count()
    
    todays_vaccinations = VaccinationRecord.objects.filter(
        administered_date=today
    ).count()
    
    upcoming_followups = VaccinationSchedule.objects.filter(
        is_completed=False,
        scheduled_date__gte=today
    ).order_by('scheduled_date')[:10]
    
    # Vaccine inventory
    total_vaccines = Vaccine.objects.filter(is_active=True).count()
    
    low_stock_items = []
    for alert in LowStockAlert.objects.filter(is_enabled=True):
        stock = alert.vaccine.current_stock
        if stock <= alert.threshold:
            low_stock_items.append({
                'id': alert.vaccine.id,
                'name': str(alert.vaccine),
                'stock': stock,
                'threshold': alert.threshold,
            })
    
    # Monthly statistics (last 6 months)
    monthly_stats = []
    for i in range(5, -1, -1):
        month = today.month - i
        year = today.year
        if month <= 0:
            month += 12
            year -= 1
        
        month_start_date = date(year, month, 1)
        if month == 12:
            month_end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            month_end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        monthly_patients = Patient.objects.filter(
            created_at__date__gte=month_start_date,
            created_at__date__lte=month_end_date
        ).count()
        
        monthly_cases = AnimalBiteCase.objects.filter(
            incident_date__date__gte=month_start_date,
            incident_date__date__lte=month_end_date
        ).count()
        
        monthly_vaccinations = VaccinationRecord.objects.filter(
            administered_date__gte=month_start_date,
            administered_date__lte=month_end_date
        ).filter(result='administered').count()
        
        monthly_stats.append({
            'month': f"{year}-{month:02d}",
            'label': date(year, month, 1).strftime('%B %Y'),
            'patients': monthly_patients,
            'cases': monthly_cases,
            'vaccinations': monthly_vaccinations,
        })
    
    # Recent activity
    from audit_logs.models import AuditLog
    recent_activities = AuditLog.objects.select_related('user').all().order_by('-created_at')[:10]
    
    return Response({
        'overview': {
            'total_patients': total_patients,
            'todays_patients': todays_patients,
            'patients_this_month': patients_this_month,
            'total_cases': total_cases,
            'todays_cases': todays_cases,
            'open_cases': open_cases,
            'ongoing_cases': ongoing_cases,
            'completed_cases': completed_cases,
            'todays_scheduled_vaccinations': todays_scheduled,
            'todays_vaccinations': todays_vaccinations,
            'upcoming_followups': upcoming_followups.count(),
            'total_vaccines': total_vaccines,
            'low_stock_count': len(low_stock_items),
        },
        'category_distribution': list(category_distribution),
        'low_stock_items': low_stock_items,
        'upcoming_followups': [
            {
                'id': s.id,
                'patient_name': s.patient.get_full_name(),
                'dose': f"Dose {s.dose_number} ({s.get_dose_type_display()})",
                'date': s.scheduled_date,
                'case_number': s.case.case_number if s.case else None,
            }
            for s in upcoming_followups
        ],
        'monthly_statistics': monthly_stats,
        'recent_activities': [
            {
                'id': a.id,
                'user': a.username,
                'action': a.action,
                'module': a.module,
                'description': a.description,
                'timestamp': a.created_at,
            }
            for a in recent_activities
        ],
    })
