from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.hashers import make_password
from rest_framework.authtoken.models import Token
from .models import UserProfile, EmailVerification
from .serializers import UserSerializer
from audit_logs.models import log_activity


def get_users_by_role(role):
    """Get all users with a specific role."""
    return User.objects.filter(profile__role=role, is_active=True)


def get_active_users():
    """Get all active users."""
    return User.objects.filter(is_active=True)


def get_available_roles():
    """Get list of available roles."""
    return [{'value': k, 'label': v} for k, v in UserProfile.ROLE_CHOICES]


def is_user_eligible_for_role(user, required_role):
    """Check if a user has at least a certain role level."""
    role_hierarchy = {
        'staff': 1,
        'nurse': 2,
        'doctor': 3,
        'admin': 4,
    }
    user_role_level = role_hierarchy.get(user.profile.role, 0)
    required_level = role_hierarchy.get(required_role, 0)
    return user_role_level >= required_level


# ============================================
# OTP VERIFICATION SERVICES
# ============================================

MAX_VERIFICATION_ATTEMPTS = 5
OTP_EXPIRY_MINUTES = 5
RESEND_COOLDOWN_SECONDS = 60


def send_otp_email(email, otp, first_name):
    """Send OTP verification email to the user."""
    subject = "Verify your Animal Bite Clinic account"
    message = f"""
Dear {first_name},

Welcome to the Animal Bite Clinic System!

Your email verification code is: {otp}

This code will expire in 5 minutes.

If you did not request this verification, please ignore this email.

Thank you,
Animal Bite Clinic Team
"""
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #312e81, #4f46e5); padding: 30px; text-align: center; }}
        .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; }}
        .body {{ padding: 30px; }}
        .otp-box {{ background: #eef2ff; border: 2px dashed #4f46e5; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }}
        .otp-code {{ font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 8px; font-family: monospace; }}
        .footer {{ padding: 20px 30px; background: #f8fafc; text-align: center; color: #94a3b8; font-size: 12px; }}
        .expiry-note {{ color: #ea580c; font-size: 13px; margin-top: 10px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐾 Animal Bite Clinic</h1>
        </div>
        <div class="body">
            <h2>Welcome, {first_name}!</h2>
            <p>Thank you for registering with the Animal Bite Clinic System. Please use the verification code below to complete your registration.</p>
            <div class="otp-box">
                <div class="otp-code">{otp}</div>
            </div>
            <p class="expiry-note">⏰ This code expires in 5 minutes.</p>
            <p>If you did not request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>Animal Bite Clinic System &bull; Stay protected against rabies</p>
        </div>
    </div>
</body>
</html>
"""
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=False,
    )


def create_pending_registration(validated_data, request=None):
    """Create a pending registration record with OTP."""
    # Clean up any existing pending verification for this email
    EmailVerification.objects.filter(
        email=validated_data['email'],
        verified=False
    ).delete()

    # Generate OTP and hash password
    otp = EmailVerification.generate_otp()
    hashed_password = make_password(validated_data['password'])
    expires_at = timezone.now() + timezone.timedelta(minutes=OTP_EXPIRY_MINUTES)

    # Create verification record
    verification = EmailVerification.objects.create(
        email=validated_data['email'],
        first_name=validated_data['first_name'],
        last_name=validated_data['last_name'],
        password=hashed_password,
        otp=otp,
        expires_at=expires_at,
    )

    # Send OTP email
    send_otp_email(
        email=validated_data['email'],
        otp=otp,
        first_name=validated_data['first_name'],
    )

    return verification


def verify_registration_otp(email, otp, request=None):
    """Verify OTP and create the user account if valid."""
    # Clean up expired records first
    EmailVerification.cleanup_expired()

    try:
        verification = EmailVerification.objects.get(
            email=email,
            verified=False,
        )
    except EmailVerification.DoesNotExist:
        return {
            'success': False,
            'error': 'No pending verification found for this email. Please register again.',
            'status': 404,
        }

    # Check if max attempts exceeded
    if verification.attempts >= MAX_VERIFICATION_ATTEMPTS:
        verification.delete()
        return {
            'success': False,
            'error': 'Too many failed attempts. Please register again.',
            'status': 429,
        }

    # Increment attempts
    verification.attempts += 1
    verification.save(update_fields=['attempts'])

    # Check expiry
    if verification.is_expired():
        verification.delete()
        return {
            'success': False,
            'error': 'OTP has expired. Please request a new one.',
            'status': 400,
        }

    # Check OTP match
    if verification.otp != otp:
        remaining = MAX_VERIFICATION_ATTEMPTS - verification.attempts
        return {
            'success': False,
            'error': f'Invalid OTP. {remaining} attempt(s) remaining.',
            'status': 400,
        }

    # OTP is valid - create the user
    user = User(
        username=email,
        email=email,
        first_name=verification.first_name,
        last_name=verification.last_name,
    )
    # Password was already hashed via make_password() during step 1;
    # assign directly to avoid double-hashing.
    user.password = verification.password
    user.save()

    # Update profile role to patient
    profile = user.profile
    profile.role = 'patient'
    profile.save()

    # Mark verification as completed
    verification.verified = True
    verification.save(update_fields=['verified'])

    # Log registration activity
    if request:
        log_activity(
            user=user,
            action='create',
            module='auth',
            description=f"New user {user.username} registered via OTP verification",
            request=request,
        )

    # Auto-login: generate token
    token, _ = Token.objects.get_or_create(user=user)

    # Delete the verification record after successful registration
    verification.delete()

    return {
        'success': True,
        'token': token.key,
        'user': UserSerializer(user).data,
    }


def resend_verification_otp(email, request=None):
    """Resend OTP with cooldown check."""
    # Clean up expired records
    EmailVerification.cleanup_expired()

    try:
        verification = EmailVerification.objects.get(
            email=email,
            verified=False,
        )
    except EmailVerification.DoesNotExist:
        return {
            'success': False,
            'error': 'No pending verification found for this email. Please register again.',
            'status': 404,
        }

    # Check cooldown
    if not verification.can_resend():
        cooldown_remaining = 60 - (timezone.now() - verification.updated_at).seconds
        return {
            'success': False,
            'error': f'Please wait {cooldown_remaining} seconds before requesting a new OTP.',
            'status': 429,
        }

    # Generate new OTP and update
    new_otp = EmailVerification.generate_otp()
    verification.otp = new_otp
    verification.attempts = 0
    verification.expires_at = timezone.now() + timezone.timedelta(minutes=OTP_EXPIRY_MINUTES)
    verification.save(update_fields=['otp', 'attempts', 'expires_at', 'updated_at'])

    # Send new OTP
    send_otp_email(
        email=verification.email,
        otp=new_otp,
        first_name=verification.first_name,
    )

    return {
        'success': True,
        'message': 'A new OTP has been sent to your email.',
    }
