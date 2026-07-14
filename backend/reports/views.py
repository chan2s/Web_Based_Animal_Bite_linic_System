from datetime import date, timedelta, datetime
from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from patients.models import Patient
from cases.models import AnimalBiteCase
from vaccinations.models import VaccinationRecord, VaccinationSchedule
from inventory.models import Vaccine, VaccineBatch


def get_date_range(period, date_obj=None):
    """Get start and end dates for a given period."""
    if date_obj is None:
        date_obj = date.today()
    
    if period == 'daily':
        return date_obj, date_obj
    elif period == 'weekly':
        start = date_obj - timedelta(days=date_obj.weekday())
        end = start + timedelta(days=6)
        return start, end
    elif period == 'monthly':
        start = date_obj.replace(day=1)
        if date_obj.month == 12:
            end = date_obj.replace(year=date_obj.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end = date_obj.replace(month=date_obj.month + 1, day=1) - timedelta(days=1)
        return start, end
    elif period == 'yearly':
        start = date_obj.replace(month=1, day=1)
        end = date_obj.replace(month=12, day=31)
        return start, end
    elif period == 'custom':
        return None, None
    
    return date_obj, date_obj


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_report_view(request):
    """Generate patient report for a period."""
    period = request.query_params.get('period', 'monthly')
    start_date_str = request.query_params.get('start_date', '')
    end_date_str = request.query_params.get('end_date', '')
    
    start_date, end_date = get_date_range(period)
    
    if period == 'custom' and start_date_str and end_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    patients_in_range = Patient.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    )
    
    gender_distribution = patients_in_range.values('gender').annotate(
        count=Count('id')
    )
    
    barangay_distribution = patients_in_range.values('barangay').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    return Response({
        'period': {
            'type': period,
            'start_date': start_date,
            'end_date': end_date,
        },
        'total_patients': patients_in_range.count(),
        'new_patients': patients_in_range.count(),
        'total_active_patients': Patient.objects.filter(is_active=True).count(),
        'gender_distribution': gender_distribution,
        'top_barangays': barangay_distribution,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def case_report_view(request):
    """Generate bite case report for a period."""
    period = request.query_params.get('period', 'monthly')
    start_date_str = request.query_params.get('start_date', '')
    end_date_str = request.query_params.get('end_date', '')
    
    start_date, end_date = get_date_range(period)
    
    if period == 'custom' and start_date_str and end_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    cases_in_range = AnimalBiteCase.objects.filter(
        incident_date__date__gte=start_date,
        incident_date__date__lte=end_date
    )
    
    category_distribution = cases_in_range.values('bite_category').annotate(
        count=Count('id')
    )
    
    animal_distribution = cases_in_range.values('animal_type').annotate(
        count=Count('id')
    )
    
    status_distribution = cases_in_range.values('case_status').annotate(
        count=Count('id')
    )
    
    severity_distribution = cases_in_range.values('severity').annotate(
        count=Count('id')
    )
    
    return Response({
        'period': {
            'type': period,
            'start_date': start_date,
            'end_date': end_date,
        },
        'total_cases': cases_in_range.count(),
        'category_distribution': category_distribution,
        'animal_distribution': animal_distribution,
        'status_distribution': status_distribution,
        'severity_distribution': severity_distribution,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vaccination_report_view(request):
    """Generate vaccination report for a period."""
    period = request.query_params.get('period', 'monthly')
    start_date_str = request.query_params.get('start_date', '')
    end_date_str = request.query_params.get('end_date', '')
    
    start_date, end_date = get_date_range(period)
    
    if period == 'custom' and start_date_str and end_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    vaccinations = VaccinationRecord.objects.filter(
        administered_date__gte=start_date,
        administered_date__lte=end_date
    )
    
    result_distribution = vaccinations.values('result').annotate(
        count=Count('id')
    )
    
    dose_distribution = vaccinations.values('dose_type').annotate(
        count=Count('id')
    )
    
    missed = VaccinationRecord.objects.filter(
        result='missed',
        scheduled_date__gte=start_date,
        scheduled_date__lte=end_date
    ).count()
    
    administered_count = vaccinations.filter(result='administered').count()
    completion_rate = (administered_count / max(vaccinations.count(), 1)) * 100
    
    return Response({
        'period': {
            'type': period,
            'start_date': start_date,
            'end_date': end_date,
        },
        'total_vaccinations': vaccinations.count(),
        'administered': administered_count,
        'missed': missed,
        'completion_rate': round(completion_rate, 2),
        'result_distribution': result_distribution,
        'dose_distribution': dose_distribution,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def inventory_report_view(request):
    """Generate inventory report."""
    vaccines = Vaccine.objects.filter(is_active=True)
    
    report_data = []
    for vaccine in vaccines:
        batches_in = VaccineBatch.objects.filter(
            vaccine=vaccine, transaction_type='in'
        ).count()
        
        total_in = VaccineBatch.objects.filter(
            vaccine=vaccine, transaction_type='in'
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        total_out = VaccineBatch.objects.filter(
            vaccine=vaccine, transaction_type='out'
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        near_expiry = VaccineBatch.objects.filter(
            vaccine=vaccine,
            transaction_type='in',
            expiration_date__lte=timezone.now().date() + timedelta(days=30),
            expiration_date__gte=timezone.now().date()
        ).count()
        
        expired = VaccineBatch.objects.filter(
            vaccine=vaccine,
            transaction_type='in',
            expiration_date__lt=timezone.now().date()
        ).count()
        
        report_data.append({
            'vaccine_name': str(vaccine),
            'current_stock': vaccine.current_stock,
            'batches_received': batches_in,
            'total_received': total_in,
            'total_administered': total_out,
            'near_expiry_batches': near_expiry,
            'expired_batches': expired,
        })
    
    return Response(report_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def summary_report_view(request):
    """Generate overall summary report."""
    today = date.today()
    month_start = today.replace(day=1)
    
    return Response({
        'total_patients': Patient.objects.filter(is_active=True).count(),
        'total_cases': AnimalBiteCase.objects.filter(is_active=True).count(),
        'open_cases': AnimalBiteCase.objects.filter(case_status='open').count(),
        'ongoing_cases': AnimalBiteCase.objects.filter(case_status='ongoing').count(),
        'completed_cases': AnimalBiteCase.objects.filter(case_status='completed').count(),
        'patients_this_month': Patient.objects.filter(
            created_at__date__gte=month_start
        ).count(),
        'cases_this_month': AnimalBiteCase.objects.filter(
            incident_date__date__gte=month_start
        ).count(),
        'vaccinations_today': VaccinationRecord.objects.filter(
            administered_date=today
        ).count(),
        'missed_vaccinations': VaccinationRecord.objects.filter(
            result='missed'
        ).count(),
        'scheduled_followups': VaccinationSchedule.objects.filter(
            is_completed=False,
            scheduled_date__gte=today
        ).count(),
        'low_stock_items': Vaccine.objects.filter(
            is_active=True,
        ).count(),  # Will be filtered further by alert threshold
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def daily_report_view(request):
    """Generate daily report for today."""
    today = date.today()
    
    return Response({
        'date': today,
        'new_patients': Patient.objects.filter(created_at__date=today).count(),
        'new_cases': AnimalBiteCase.objects.filter(incident_date__date=today).count(),
        'new_vaccinations': VaccinationRecord.objects.filter(
            administered_date=today
        ).count(),
        'scheduled_vaccinations': VaccinationSchedule.objects.filter(
            scheduled_date=today,
            is_completed=False
        ).count(),
        'ongoing_cases': AnimalBiteCase.objects.filter(case_status='ongoing').count(),
    })
