import secrets
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


class EmailVerification(models.Model):
    """Temporary storage for pending patient registrations awaiting OTP verification."""
    
    # Registration data
    email = models.EmailField(db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    password = models.CharField(max_length=128)  # Django-hashed password stored here
    
    # OTP fields
    otp = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    verified = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_verifications'
        verbose_name = 'Email Verification'
        verbose_name_plural = 'Email Verifications'
        indexes = [
            models.Index(fields=['email', 'otp']),
        ]
    
    def __str__(self):
        return f"Verification for {self.email} (verified={self.verified})"
    
    def is_expired(self):
        """Check if the OTP has expired."""
        return timezone.now() > self.expires_at
    
    def can_resend(self):
        """Check if resend is allowed (60-second cooldown)."""
        cooldown = timezone.now() - timezone.timedelta(seconds=60)
        return self.updated_at < cooldown
    
    @staticmethod
    def generate_otp():
        """Generate a secure random 6-digit OTP."""
        return f"{secrets.randbelow(1000000):06d}"
    
    @staticmethod
    def cleanup_expired():
        """Delete expired OTP records."""
        expired_count = EmailVerification.objects.filter(
            expires_at__lt=timezone.now(),
            verified=False
        ).delete()[0]
        return expired_count


class UserProfile(models.Model):
    """Extended profile for Django User with role-based access control."""
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('staff', 'Staff'),
        ('patient', 'Patient'),
    ]
    
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
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    # Emergency contact (for patients)
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relation = models.CharField(max_length=100, blank=True)
    blood_type = models.CharField(max_length=10, choices=BLOOD_TYPE_CHOICES, default='unknown', blank=True)
    
    # Professional fields (for staff)
    specialization = models.CharField(max_length=200, blank=True, help_text="Medical specialization (for doctors)")
    license_number = models.CharField(max_length=100, blank=True, help_text="Professional license number")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.get_role_display()}"

    def is_profile_complete(self):
        """Check if a patient's profile has all required fields filled."""
        if self.role != 'patient':
            return False  # Profile completion only applies to patients
        required_fields = [
            self.user.first_name,
            self.user.last_name,
            self.birth_date,
            self.gender,
            self.phone,
            self.address,
            self.emergency_contact_name,
            self.emergency_contact_phone,
        ]
        return all(field for field in required_fields)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create UserProfile when a User is created."""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Auto-save UserProfile when User is saved."""
    if hasattr(instance, 'profile'):
        instance.profile.save()
