from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import time, timedelta


class ClinicConfiguration(models.Model):
    """Configurable clinic scheduling rules.
    This is a singleton model — only one configuration record should exist.
    """
    # Operating hours
    opening_time = models.TimeField(default=time(8, 0), help_text="Clinic opening time (e.g., 08:00)")
    closing_time = models.TimeField(default=time(17, 0), help_text="Clinic closing time (e.g., 17:00)")
    
    # Scheduling rules
    appointment_duration_minutes = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(15), MaxValueValidator(120)],
        help_text="Duration of each appointment slot in minutes"
    )
    max_appointments_per_day = models.PositiveIntegerField(
        default=50,
        help_text="Maximum number of appointments allowed per day"
    )
    max_patients_per_slot = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Maximum number of patients per time slot"
    )
    
    # Cutoff settings
    cancel_cutoff_hours = models.PositiveIntegerField(
        default=2,
        help_text="Hours before appointment when cancellation is no longer allowed"
    )
    
    # Days of operation (bitmask-style, 0=Sunday, 6=Saturday)
    operating_days = models.CharField(
        max_length=7,
        default='12345',  # Monday to Friday
        help_text="Days the clinic is open (0=Sun, 1=Mon, ... 6=Sat). E.g., '12345' = weekdays"
    )
    
    # Metadata
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'clinic_configuration'
        verbose_name = 'Clinic Configuration'
        verbose_name_plural = 'Clinic Configuration'
    
    def __str__(self):
        return f"Clinic: {self.opening_time.strftime('%H:%M')} - {self.closing_time.strftime('%H:%M')} ({self.appointment_duration_minutes}min slots)"
    
    def get_operating_days_list(self):
        """Return list of integers for operating days."""
        return [int(d) for d in self.operating_days if d.isdigit()]
    
    def is_operating_day(self, date_obj):
        """Check if the clinic operates on a given date."""
        return date_obj.weekday() in self.get_operating_days_list()
    
    def generate_time_slots(self):
        """Generate all possible time slots for a day based on configuration."""
        slots = []
        current = datetime.combine(date.today(), self.opening_time)
        closing_datetime = datetime.combine(date.today(), self.closing_time)
        duration = timedelta(minutes=self.appointment_duration_minutes)
        
        while current + duration <= closing_datetime:
            slots.append(current.time().strftime('%H:%M'))
            current += duration
        
        return slots


class Appointment(models.Model):
    """Vaccination appointment booking record."""
    
    REASON_CHOICES = [
        ('new_bite', 'New Animal Bite'),
        ('follow_up', 'Follow-up Dose'),
        ('booster', 'Booster'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    # Auto-generated unique appointment number
    appointment_number = models.CharField(max_length=20, unique=True, blank=True)
    
    # Who booked this appointment
    booked_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='appointments'
    )
    
    # Patient details (can differ from the user if booking for someone else)
    patient_name = models.CharField(max_length=200)
    patient_phone = models.CharField(max_length=20)
    patient_email = models.EmailField(blank=True)
    
    # Appointment details
    appointment_date = models.DateField()
    time_slot = models.CharField(max_length=5, help_text="Format: HH:MM")
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    reason_other = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    staff_notes = models.TextField(blank=True, help_text="Internal notes from clinic staff")
    
    # Rescheduling tracking
    original_date = models.DateField(null=True, blank=True)
    original_time_slot = models.CharField(max_length=5, blank=True)
    
    # Who handled this appointment (staff)
    handled_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='handled_appointments'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'appointments'
        verbose_name = 'Appointment'
        verbose_name_plural = 'Appointments'
        ordering = ['-appointment_date', 'time_slot']
        indexes = [
            models.Index(fields=['appointment_number']),
            models.Index(fields=['appointment_date', 'time_slot']),
            models.Index(fields=['status']),
            models.Index(fields=['booked_by']),
        ]
        # Prevent duplicate: same patient can't book same date+time
        unique_together = ['booked_by', 'appointment_date', 'time_slot']
    
    def __str__(self):
        return f"{self.appointment_number} - {self.patient_name} ({self.appointment_date} {self.time_slot})"
    
    def save(self, *args, **kwargs):
        if not self.appointment_number:
            from django.db.models import Max
            max_id = Appointment.objects.aggregate(Max('id'))['id__max']
            next_id = (max_id or 0) + 1
            self.appointment_number = f"APT-{next_id:05d}"
        super().save(*args, **kwargs)
    
    @property
    def status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, self.status)
    
    @property
    def can_cancel(self):
        """Check if appointment can be cancelled based on cutoff time."""
        if self.status in ['completed', 'cancelled', 'rejected']:
            return False
        from datetime import datetime, date, timedelta as td
        cutoff_hours = ClinicConfiguration.objects.first().cancel_cutoff_hours if ClinicConfiguration.objects.exists() else 2
        appointment_datetime = datetime.combine(self.appointment_date, datetime.strptime(self.time_slot, '%H:%M').time())
        now = datetime.now()
        return (appointment_datetime - now) > td(hours=cutoff_hours)
