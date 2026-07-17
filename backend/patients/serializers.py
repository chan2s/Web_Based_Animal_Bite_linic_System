from rest_framework import serializers
from .models import Patient
from accounts.permissions import _get_role


class PatientSerializer(serializers.ModelSerializer):
    """Full patient serializer. Used by admin users for full CRUD."""
    
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    registered_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ['id', 'patient_id_display', 'registered_by', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_age(self, obj):
        from datetime import date
        today = date.today()
        age = today.year - obj.date_of_birth.year
        if today.month < obj.date_of_birth.month or \
           (today.month == obj.date_of_birth.month and today.day < obj.date_of_birth.day):
            age -= 1
        return age
    
    def get_registered_by_name(self, obj):
        if obj.registered_by:
            return obj.registered_by.get_full_name() or obj.registered_by.username
        return None

    def validate(self, attrs):
        """
        Field-level RBAC enforcement:
        Non-admin users cannot modify protected personal information fields.
        This is the backend source-of-truth check — no frontend check can override it.
        """
        request = self.context.get('request')
        if request and self.instance:
            role = _get_role(request)
            if role and role != 'admin':
                protected_fields = [
                    'first_name', 'middle_name', 'last_name', 'suffix',
                    'date_of_birth', 'gender', 'blood_type',
                    'phone', 'email', 'address', 'barangay', 'municipality', 'province',
                    'emergency_contact_name', 'emergency_contact_phone',
                    'emergency_contact_relation',
                    'patient_id_display', 'is_active',
                ]
                for field in protected_fields:
                    if field in attrs and attrs[field] != getattr(self.instance, field):
                        raise serializers.ValidationError({
                            field: 'You do not have permission to modify this field.'
                        })
        return attrs


class StaffPatientUpdateSerializer(serializers.ModelSerializer):
    """
    Restricted serializer for non-admin staff updating patient records.
    Only allows editing clinical/medical fields — personal info is read-only.
    """
    
    # Read-only personal info fields (included for display in response)
    first_name = serializers.CharField(read_only=True)
    middle_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    suffix = serializers.CharField(read_only=True)
    date_of_birth = serializers.DateField(read_only=True)
    gender = serializers.CharField(read_only=True)
    blood_type = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    address = serializers.CharField(read_only=True)
    barangay = serializers.CharField(read_only=True)
    municipality = serializers.CharField(read_only=True)
    province = serializers.CharField(read_only=True)
    emergency_contact_name = serializers.CharField(read_only=True)
    emergency_contact_phone = serializers.CharField(read_only=True)
    emergency_contact_relation = serializers.CharField(read_only=True)
    patient_id_display = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    registered_by = serializers.PrimaryKeyRelatedField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    registered_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = '__all__'
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_age(self, obj):
        from datetime import date
        today = date.today()
        age = today.year - obj.date_of_birth.year
        if today.month < obj.date_of_birth.month or \
           (today.month == obj.date_of_birth.month and today.day < obj.date_of_birth.day):
            age -= 1
        return age
    
    def get_registered_by_name(self, obj):
        if obj.registered_by:
            return obj.registered_by.get_full_name() or obj.registered_by.username
        return None


class PatientListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for patient list views."""
    
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = ['id', 'patient_id_display', 'first_name', 'last_name', 
                  'full_name', 'gender', 'age', 'phone', 'barangay',
                  'date_of_birth', 'is_active', 'created_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_age(self, obj):
        from datetime import date
        today = date.today()
        age = today.year - obj.date_of_birth.year
        if today.month < obj.date_of_birth.month or \
           (today.month == obj.date_of_birth.month and today.day < obj.date_of_birth.day):
            age -= 1
        return age
