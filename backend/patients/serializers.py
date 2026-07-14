from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    """Full patient serializer."""
    
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
