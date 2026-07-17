from datetime import date, datetime, timedelta, time as time_type
from django.db.models import Count, Q
from django.utils import timezone
from .models import Appointment, ClinicConfiguration


def get_clinic_config():
    """Get the clinic configuration singleton."""
    config, created = ClinicConfiguration.objects.get_or_create(
        pk=1,
        defaults={
            'opening_time': time_type(8, 0),
            'closing_time': time_type(17, 0),
            'appointment_duration_minutes': 30,
            'max_appointments_per_day': 50,
            'max_patients_per_slot': 1,
            'operating_days': '12345',
        }
    )
    return config


def generate_time_slots_for_date(target_date):
    """Generate all time slots for a given date based on clinic config."""
    config = get_clinic_config()
    
    # Check if date is in the past
    if target_date < date.today():
        return []
    
    # Check if clinic is operating on this day
    if not config.is_operating_day(target_date):
        return []
    
    slots = []
    current = datetime.combine(target_date, config.opening_time)
    closing = datetime.combine(target_date, config.closing_time)
    duration = timedelta(minutes=config.appointment_duration_minutes)
    
    while current + duration <= closing:
        slots.append(current.strftime('%H:%M'))
        current += duration
    
    return slots


def get_available_slots(target_date, exclude_appointment_id=None):
    """Get available time slots for a given date.
    
    Returns a list of dicts with slot time, availability status, and count.
    """
    config = get_clinic_config()
    
    # Generate all possible slots
    all_slots = generate_time_slots_for_date(target_date)
    
    if not all_slots:
        return []
    
    # Count bookings per slot
    booking_query = Appointment.objects.filter(
        appointment_date=target_date,
        status__in=['pending', 'approved']
    )
    
    if exclude_appointment_id:
        booking_query = booking_query.exclude(id=exclude_appointment_id)
    
    slot_counts = booking_query.values('time_slot').annotate(
        count=Count('id')
    ).order_by('time_slot')
    
    # Build counts dict
    counts = {item['time_slot']: item['count'] for item in slot_counts}
    
    # Check total day capacity
    total_booked = Appointment.objects.filter(
        appointment_date=target_date,
        status__in=['pending', 'approved']
    ).count()
    
    if exclude_appointment_id:
        # For rescheduling: exclude the current appointment being rescheduled
        # (The count check below already handles this conceptually)
        pass
    
    day_full = total_booked >= config.max_appointments_per_day
    
    # Build available slots
    available_slots = []
    for slot_time in all_slots:
        booked_count = counts.get(slot_time, 0)
        is_available = booked_count < config.max_patients_per_slot and not day_full
        
        available_slots.append({
            'time': slot_time,
            'available': is_available,
            'booked_count': booked_count,
            'max_per_slot': config.max_patients_per_slot,
        })
    
    return available_slots


def check_slot_availability(target_date, time_slot, exclude_appointment_id=None):
    """Check if a specific slot is available for booking.
    
    Returns a dict with:
        available: bool
        message: str (reason if not available)
        details: dict with additional info
    """
    config = get_clinic_config()
    
    # Validate date is not in the past
    if target_date < date.today():
        return {
            'available': False,
            'message': 'Cannot book appointments in the past.',
            'details': {'code': 'past_date'}
        }
    
    # Validate clinic is operating
    if not config.is_operating_day(target_date):
        return {
            'available': False,
            'message': 'The clinic is closed on this day.',
            'details': {'code': 'closed_day'}
        }
    
    # Validate time slot is valid
    all_slots = generate_time_slots_for_date(target_date)
    if time_slot not in all_slots:
        return {
            'available': False,
            'message': f'{time_slot} is not a valid time slot.',
            'details': {'code': 'invalid_slot'}
        }
    
    # Check total daily capacity
    total_booked = Appointment.objects.filter(
        appointment_date=target_date,
        status__in=['pending', 'approved']
    ).exclude(id=exclude_appointment_id).count()
    
    if total_booked >= config.max_appointments_per_day:
        return {
            'available': False,
            'message': f'The clinic has reached maximum capacity for {target_date}. Please choose another date.',
            'details': {'code': 'day_full'}
        }
    
    # Check slot capacity
    slot_booked = Appointment.objects.filter(
        appointment_date=target_date,
        time_slot=time_slot,
        status__in=['pending', 'approved']
    ).exclude(id=exclude_appointment_id).count()
    
    if slot_booked >= config.max_patients_per_slot:
        return {
            'available': False,
            'message': 'This appointment slot is no longer available. Please choose another date or time.',
            'details': {'code': 'slot_full'}
        }
    
    return {
        'available': True,
        'message': 'Slot is available.',
        'details': {
            'code': 'available',
            'appointment_date': str(target_date),
            'time_slot': time_slot,
            'booked_before': slot_booked,
            'max_per_slot': config.max_patients_per_slot,
        }
    }


def check_duplicate_booking(user, target_date, time_slot, exclude_id=None):
    """Check if user already has a booking at this date/time."""
    query = Appointment.objects.filter(
        booked_by=user,
        appointment_date=target_date,
        time_slot=time_slot,
        status__in=['pending', 'approved']
    )
    if exclude_id:
        query = query.exclude(id=exclude_id)
    return query.exists()


# ─── Auto Dose Scheduling ────────────────────────────────────────────

def create_vaccination_schedule(vaccination_record, appointment=None):
    """Auto-create the next dose schedule after a vaccination.
    
    Standard Rabies PEP schedule: Day 0, 3, 7, 14, 28
    """
    from vaccinations.models import VaccinationSchedule
    
    dose_number = vaccination_record.dose_number
    administered_date = vaccination_record.administered_date
    case = vaccination_record.case
    patient = vaccination_record.patient

    # Standard PEP schedule offsets in days
    SCHEDULE_OFFSETS = {
        1: {'next_dose': 2, 'offset_days': 3},    # After Dose 1 → Dose 2 at Day 3
        2: {'next_dose': 3, 'offset_days': 4},    # After Dose 2 → Dose 3 at Day 7
        3: {'next_dose': 4, 'offset_days': 7},    # After Dose 3 → Dose 4 at Day 14
        4: {'next_dose': 5, 'offset_days': 14},   # After Dose 4 → Dose 5 at Day 28
    }

    if dose_number not in SCHEDULE_OFFSETS:
        return None  # No more doses needed

    next_info = SCHEDULE_OFFSETS[dose_number]
    next_date = administered_date + timedelta(days=next_info['offset_days'])

    # Determine dose type
    dose_types = {1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth'}
    dose_type = dose_types.get(next_info['next_dose'], 'booster')

    schedule = VaccinationSchedule.objects.create(
        case=case,
        patient=patient,
        dose_number=next_info['next_dose'],
        dose_type=dose_type,
        scheduled_date=next_date,
        notes=f"Auto-scheduled from appointment {appointment.appointment_number if appointment else 'N/A'}",
    )

    # Create a notification for the patient
    if appointment and appointment.booked_by:
        from django.contrib.auth.models import User
        create_notification(
            recipient=appointment.booked_by,
            notification_type='next_dose_reminder',
            title=f'Dose {next_info["next_dose"]} Scheduled',
            message=f'Your next vaccination (Dose {next_info["next_dose"]}) is scheduled for {next_date}.',
            appointment=appointment,
        )

    return schedule


# ─── Inventory Deduction ────────────────────────────────────────────

def deduct_vaccine_stock(vaccination_record):
    """Auto-deduct vaccine stock when a vaccination is administered.
    Creates a stock-out transaction in VaccineBatch."""
    from inventory.models import Vaccine, VaccineBatch, LowStockAlert

    vaccine = vaccination_record.vaccine
    if not vaccine:
        return None

    batch = VaccineBatch.objects.create(
        vaccine=vaccine,
        batch_number=vaccination_record.batch_number or 'AUTO',
        transaction_type='out',
        quantity=1,
        reference_record=vaccination_record,
        notes=f"Auto-deducted for vaccination record #{vaccination_record.id}",
        recorded_by=vaccination_record.administered_by,
    )

    # Check low stock threshold
    try:
        alert = LowStockAlert.objects.get(vaccine=vaccine, is_enabled=True)
        current = vaccine.current_stock
        if current <= alert.threshold:
            # Notify admin and staff about low stock
            from django.contrib.auth.models import User
            admin_users = User.objects.filter(profile__role='admin')
            staff_users = User.objects.filter(profile__role='staff')
            for user in admin_users.union(staff_users):
                create_notification(
                    recipient=user,
                    notification_type='low_stock_alert',
                    title='Low Stock Alert',
                    message=f'{vaccine.name} stock is low: {current} remaining (threshold: {alert.threshold})',
                )
            alert.last_triggered_at = timezone.now()
            alert.save()
    except LowStockAlert.DoesNotExist:
        pass

    return batch


# ─── Notification Helper ────────────────────────────────────────────

def create_notification(recipient, notification_type, title, message, appointment=None):
    """Create an in-system notification."""
    from .models import Notification
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        appointment=appointment,
    )
    return notification


def get_clinic_info():
    """Get clinic scheduling information for the frontend."""
    config = get_clinic_config()
    return {
        'opening_time': config.opening_time.strftime('%H:%M'),
        'closing_time': config.closing_time.strftime('%H:%M'),
        'appointment_duration_minutes': config.appointment_duration_minutes,
        'max_appointments_per_day': config.max_appointments_per_day,
        'max_patients_per_slot': config.max_patients_per_slot,
        'cancel_cutoff_hours': config.cancel_cutoff_hours,
        'operating_days': config.get_operating_days_list(),
    }
