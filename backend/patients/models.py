from django.db import models
from django.contrib.auth.models import User


class Patient(models.Model):
    """Comprehensive patient information model."""
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
        ('unknown', 'Unknown'),
    ]
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=20, blank=True, help_text="e.g., Jr., Sr., III")
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    blood_type = models.CharField(max_length=10, choices=BLOOD_TYPE_CHOICES, default='unknown')
    
    # Contact Information
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address = models.TextField()
    barangay = models.CharField(max_length=100, blank=True)
    municipality = models.CharField(max_length=100, blank=True)
    province = models.CharField(max_length=100, blank=True)
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(max_length=20)
    emergency_contact_relation = models.CharField(max_length=100, blank=True)
    
    # Medical Information
    allergies = models.TextField(blank=True, help_text="List any known allergies")
    medical_conditions = models.TextField(blank=True, help_text="Pre-existing medical conditions")
    current_medications = models.TextField(blank=True)
    tetanus_vaccination_history = models.TextField(blank=True, help_text="Previous tetanus vaccination dates")
    
    # Metadata
    patient_id_display = models.CharField(max_length=20, unique=True, blank=True, 
                                          help_text="Auto-generated display ID")
    registered_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, 
        related_name='registered_patients'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patients'
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['last_name', 'first_name']),
            models.Index(fields=['patient_id_display']),
            models.Index(fields=['barangay']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.patient_id_display})"
    
    def get_full_name(self):
        parts = [self.first_name]
        if self.middle_name:
            parts.append(self.middle_name[0] + '.')
        parts.append(self.last_name)
        if self.suffix:
            parts.append(self.suffix)
        return ' '.join(parts)
    
    def save(self, *args, **kwargs):
        if not self.patient_id_display:
            from django.db.models import Max
            max_id = Patient.objects.aggregate(Max('id'))['id__max']
            next_id = (max_id or 0) + 1
            self.patient_id_display = f"PAT-{next_id:05d}"
        super().save(*args, **kwargs)
