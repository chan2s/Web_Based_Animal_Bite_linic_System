from django.db import models
from django.contrib.auth.models import User
from patients.models import Patient
from cases.models import AnimalBiteCase
from inventory.models import Vaccine


class VaccinationRecord(models.Model):
    """Records a vaccination administered to a patient."""
    
    DOSE_TYPE_CHOICES = [
        ('first', 'First Dose'),
        ('second', 'Second Dose'),
        ('third', 'Third Dose'),
        ('fourth', 'Fourth Dose'),
        ('fifth', 'Fifth Dose'),
        ('booster', 'Booster'),
        ('tetanus', 'Tetanus Toxoid'),
        ('rabies_ig', 'Rabies Immune Globulin'),
    ]
    
    VACCINATION_SITE_CHOICES = [
        ('left_deltoid', 'Left Deltoid'),
        ('right_deltoid', 'Right Deltoid'),
        ('left_thigh', 'Left Thigh (Anterolateral)'),
        ('right_thigh', 'Right Thigh (Anterolateral)'),
        ('left_gluteal', 'Left Gluteal'),
        ('right_gluteal', 'Right Gluteal'),
    ]
    
    ADMINISTRATION_ROUTE_CHOICES = [
        ('im', 'Intramuscular (IM)'),
        ('sc', 'Subcutaneous (SC)'),
        ('id', 'Intradermal (ID)'),
    ]
    
    RESULT_CHOICES = [
        ('administered', 'Administered'),
        ('missed', 'Missed'),
        ('refused', 'Refused'),
        ('contraindicated', 'Contraindicated'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Relationships
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='vaccinations'
    )
    case = models.ForeignKey(
        AnimalBiteCase, on_delete=models.CASCADE, related_name='vaccinations',
        null=True, blank=True
    )
    vaccine = models.ForeignKey(
        Vaccine, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='administered_records'
    )
    
    # Vaccination Details
    dose_type = models.CharField(max_length=20, choices=DOSE_TYPE_CHOICES)
    dose_number = models.IntegerField(help_text="Sequential dose number for this case")
    scheduled_date = models.DateField()
    administered_date = models.DateField(null=True, blank=True)
    
    # Clinical Details
    administration_route = models.CharField(
        max_length=5, choices=ADMINISTRATION_ROUTE_CHOICES, default='im'
    )
    injection_site = models.CharField(
        max_length=20, choices=VACCINATION_SITE_CHOICES, blank=True
    )
    batch_number = models.CharField(max_length=100, blank=True)
    dosage_amount = models.CharField(max_length=50, blank=True, help_text="e.g., 0.5ml, 1.0ml")
    manufacturer = models.CharField(max_length=200, blank=True)
    
    # Outcome
    result = models.CharField(max_length=20, choices=RESULT_CHOICES, default='administered')
    notes = models.TextField(blank=True)
    adverse_reaction = models.TextField(blank=True)
    
    # Who administered
    administered_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='administered_vaccinations'
    )
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vaccination_records'
        verbose_name = 'Vaccination Record'
        verbose_name_plural = 'Vaccination Records'
        ordering = ['-scheduled_date', 'dose_number']
        indexes = [
            models.Index(fields=['patient', 'case']),
            models.Index(fields=['scheduled_date']),
            models.Index(fields=['result']),
        ]
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.get_dose_type_display()} ({self.scheduled_date})"


class VaccinationSchedule(models.Model):
    """Predefined vaccination schedule template."""
    
    case = models.ForeignKey(
        AnimalBiteCase, on_delete=models.CASCADE, related_name='vaccination_schedule'
    )
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='vaccination_schedules'
    )
    dose_number = models.IntegerField()
    dose_type = models.CharField(max_length=20, choices=VaccinationRecord.DOSE_TYPE_CHOICES)
    scheduled_date = models.DateField()
    notes = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    completed_record = models.ForeignKey(
        VaccinationRecord, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vaccination_schedules'
        verbose_name = 'Vaccination Schedule'
        verbose_name_plural = 'Vaccination Schedules'
        ordering = ['scheduled_date', 'dose_number']
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - Dose {self.dose_number} ({self.scheduled_date})"
