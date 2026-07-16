from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    
    profile_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'role', 'phone', 'address', 'gender', 'birth_date',
                  'emergency_contact_name', 'emergency_contact_phone',
                  'emergency_contact_relation', 'blood_type',
                  'specialization', 'license_number', 'is_active',
                  'profile_completed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'profile_completed']
    
    def get_profile_completed(self, obj):
        return obj.is_profile_complete()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with nested profile."""
    
    profile = UserProfileSerializer()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_active', 'date_joined', 'profile']
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users with profile data."""
    
    profile = UserProfileSerializer()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'password', 'confirm_password', 'is_active', 'profile']
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Update profile fields
        profile = user.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating existing users."""
    
    profile = UserProfileSerializer(partial=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_active', 'profile']
        read_only_fields = ['id']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile fields
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class PatientProfileSerializer(serializers.ModelSerializer):
    """Flattened serializer for patient profile response.
    Maps User + UserProfile fields into a flat structure the frontend expects.
    """
    
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    contact_number = serializers.CharField(source='phone', read_only=True)
    date_of_birth = serializers.DateField(source='birth_date', read_only=True)
    sex = serializers.CharField(source='gender', read_only=True)
    profile_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'contact_number', 'address', 'date_of_birth', 'sex',
            'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relation', 'blood_type',
            'profile_completed',
        ]
    
    def get_profile_completed(self, obj):
        return obj.is_profile_complete()


class PatientProfileUpdateSerializer(serializers.Serializer):
    """Serializer for patients to complete/update their own profile."""
    
    # User fields
    first_name = serializers.CharField(required=False, max_length=100)
    last_name = serializers.CharField(required=False, max_length=100)
    
    # Profile fields
    # NOTE: No `source` param here — DRF stores validated_data under field names.
    # The update() method manually maps these to correct model fields.
    contact_number = serializers.CharField(required=False, max_length=20, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    sex = serializers.ChoiceField(required=False, choices=['male', 'female', 'other', ''], allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    emergency_contact_name = serializers.CharField(required=False, max_length=200, allow_blank=True)
    emergency_contact_phone = serializers.CharField(required=False, max_length=20, allow_blank=True)
    emergency_contact_relation = serializers.CharField(required=False, max_length=100, allow_blank=True)
    blood_type = serializers.ChoiceField(required=False, choices=[
        'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown', ''
    ], allow_blank=True)
    
    def update(self, instance, validated_data):
        # Update User fields
        user_fields = ['first_name', 'last_name']
        for field in user_fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        
        # Update Profile fields (handle source mapping)
        profile = instance.profile
        field_mapping = {
            'contact_number': 'phone',
            'sex': 'gender',
            'date_of_birth': 'birth_date',
            'address': 'address',
            'emergency_contact_name': 'emergency_contact_name',
            'emergency_contact_phone': 'emergency_contact_phone',
            'emergency_contact_relation': 'emergency_contact_relation',
            'blood_type': 'blood_type',
        }
        for form_field, profile_field in field_mapping.items():
            if form_field in validated_data:
                setattr(profile, profile_field, validated_data[form_field])
        profile.save()
        
        return instance


class PatientRegisterSerializer(serializers.Serializer):
    """Serializer for public patient registration.
    Creates a User + UserProfile with role='patient'.
    Email is used as the username for login.
    """
    # Patient info
    first_name = serializers.CharField(required=True, max_length=100)
    last_name = serializers.CharField(required=True, max_length=100)
    email = serializers.EmailField(required=True)
    
    # Contact & demographics
    date_of_birth = serializers.DateField(required=True)
    sex = serializers.ChoiceField(choices=['male', 'female', 'other'], required=True)
    address = serializers.CharField(required=True)
    contact_number = serializers.CharField(required=True, max_length=20)
    
    # Auth
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    
    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        # Extract fields
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email')
        date_of_birth = validated_data.pop('date_of_birth')
        sex = validated_data.pop('sex')
        address = validated_data.pop('address')
        contact_number = validated_data.pop('contact_number')
        password = validated_data.pop('password')
        
        # Create User with email as username
        user = User(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(password)
        user.save()
        
        # Update profile with patient data (profile auto-created by signal)
        profile = user.profile
        profile.role = 'patient'
        profile.phone = contact_number
        profile.gender = sex
        profile.address = address
        profile.birth_date = date_of_birth
        profile.save()
        
        return user


class RegisterStep1Serializer(serializers.Serializer):
    """Serializer for registration step 1 - collects basic info and sends OTP."""
    
    first_name = serializers.CharField(required=True, max_length=100)
    last_name = serializers.CharField(required=True, max_length=100)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    
    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower().strip()
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for OTP verification."""
    
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)
    
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must be a 6-digit number.")
        return value


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP."""
    
    email = serializers.EmailField(required=True)


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    username = serializers.CharField()
    password = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True, min_length=8)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing users."""
    
    role = serializers.CharField(source='profile.role', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'full_name', 'is_active', 'role', 'date_joined']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username
