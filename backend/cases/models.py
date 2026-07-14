from django.db import models
from django.contrib.auth.models import User
from patients.models import Patient


class AnimalBiteCase(models.Model):
    """Comprehensive animal bite case record."""
    
    BITE_CATEGORY_CHOICES = [
        ('I', 'Category I - Animal contact without breaking skin'),
        ('II', 'Category II - Nibbling without bleeding, scratches without bleeding'),
        ('III', 'Category III - Single/multiple bites with bleeding, contamination of mucous membrane'),
    ]
    
    EXPOSURE_TYPE_CHOICES = [
        ('direct', 'Direct Contact'),
        ('scratch', 'Scratch'),
        ('bite', 'Bite'),
        ('mucous_membrane', 'Mucous Membrane Exposure'),
        ('other', 'Other'),
    ]
    
    WOUND_LOCATION_CHOICES = [
        ('head', 'Head'),
        ('face', 'Face'),
        ('neck', 'Neck'),
        ('upper_arm', 'Upper Arm'),
        ('forearm', 'Forearm'),
        ('hand', 'Hand'),
        ('finger', 'Finger'),
        ('chest', 'Chest'),
        ('abdomen', 'Abdomen'),
        ('back', 'Back'),
        ('thigh', 'Thigh'),
        ('leg', 'Leg'),
        ('foot', 'Foot'),
        ('multiple', 'Multiple Locations'),
        ('other', 'Other'),
    ]
    
    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]
    
    CASE_STATUS_CHOICES = [
        ('open', 'Open'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('lost_to_followup', 'Lost to Follow-up'),
        ('referred', 'Referred'),
    ]
    
    ANIMAL_TYPE_CHOICES = [
        ('dog', 'Dog'),
        ('cat', 'Cat'),
        ('bat', 'Bat'),
        ('monkey', 'Monkey'),
        ('rat', 'Rat'),
        ('other', 'Other'),
    ]
    
    VACCINATION_STATUS_CHOICES = [
        ('unknown', 'Unknown'),
        ('vaccinated', 'Vaccinated'),
        ('not_vaccinated', 'Not Vaccinated'),
        ('observed', 'Under Observation'),
    ]
    
    INITIAL_TREATMENT_CHOICES = [
        ('none', 'No Treatment'),
        ('wound_cleaning', 'Wound Cleaning'),
        ('wound_care', 'Wound Care & Dressing'),
        ('first_aid', 'First Aid'),
        ('referral', 'Referred for Treatment'),
    ]
    
    # Case Information
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='bite_cases'
    )
    case_number = models.CharField(max_length=20, unique=True, blank=True)
    
    # Incident Details
    incident_date = models.DateTimeField()
    incident_location = models.TextField(blank=True)
    
    # Animal Information
    animal_type = models.CharField(max_length=20, choices=ANIMAL_TYPE_CHOICES)
    animal_other_type = models.CharField(max_length=100, blank=True, help_text="Specify if animal type is 'other'")
    animal_description = models.TextField(blank=True, help_text="Color, size, distinguishing features")
    animal_owner_name = models.CharField(max_length=200, blank=True)
    animal_owner_contact = models.CharField(max_length=20, blank=True)
    animal_vaccination_status = models.CharField(
        max_length=20, choices=VACCINATION_STATUS_CHOICES, default='unknown'
    )
    animal_is_stray = models.BooleanField(default=False)
    animal_was_provoked = models.BooleanField(null=True, blank=True)
    
    # Bite Details
    bite_category = models.CharField(max_length=5, choices=BITE_CATEGORY_CHOICES)
    exposure_type = models.CharField(max_length=20, choices=EXPOSURE_TYPE_CHOICES)
    wound_location = models.CharField(max_length=20, choices=WOUND_LOCATION_CHOICES)
    wound_location_other = models.CharField(max_length=200, blank=True)
    wound_description = models.TextField(blank=True)
    wound_depth_mm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    number_of_wounds = models.IntegerField(default=1)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='mild')
    
    # Initial Management
    initial_treatment = models.CharField(
        max_length=20, choices=INITIAL_TREATMENT_CHOICES, default='none'
    )
    initial_treatment_notes = models.TextField(blank=True)
    wound_treated_within_24h = models.BooleanField(null=True, blank=True)
    
    # Clinical Assessment
    tetanus_status_checked = models.BooleanField(default=False)
    tetanus_vaccine_given = models.BooleanField(default=False)
    rabies_immune_globulin_given = models.BooleanField(default=False)
    referred_to_hospital = models.BooleanField(default=False)
    referral_notes = models.TextField(blank=True)
    
    # Status
    case_status = models.CharField(max_length=20, choices=CASE_STATUS_CHOICES, default='open')
    
    # Attending Personnel
    attending_doctor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='attended_cases'
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='created_cases'
    )
    
    # Metadata
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'animal_bite_cases'
        verbose_name = 'Animal Bite Case'
        verbose_name_plural = 'Animal Bite Cases'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['case_number']),
            models.Index(fields=['case_status']),
            models.Index(fields=['bite_category']),
            models.Index(fields=['incident_date']),
        ]
    
    def __str__(self):
        return f"Case {self.case_number} - {self.patient.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.case_number:
            from django.db.models import Max
            max_id = AnimalBiteCase.objects.aggregate(Max('id'))['id__max']
            next_id = (max_id or 0) + 1
            self.case_number = f"ABC-{next_id:05d}"
        super().save(*args, **kwargs)
