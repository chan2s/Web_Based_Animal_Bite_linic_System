from rest_framework import serializers
from .models import AnimalBiteCase


class AnimalBiteCaseSerializer(serializers.ModelSerializer):
    """Full serializer for Animal Bite Case."""
    
    patient_name = serializers.SerializerMethodField()
    patient_id_display = serializers.SerializerMethodField()
    attending_doctor_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    days_since_incident = serializers.SerializerMethodField()
    
    class Meta:
        model = AnimalBiteCase
        fields = '__all__'
        read_only_fields = ['id', 'case_number', 'created_by', 'created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return obj.patient.get_full_name()
    
    def get_patient_id_display(self, obj):
        return obj.patient.patient_id_display
    
    def get_attending_doctor_name(self, obj):
        if obj.attending_doctor:
            return obj.attending_doctor.get_full_name() or obj.attending_doctor.username
        return None
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None
    
    def get_days_since_incident(self, obj):
        from datetime import date
        delta = date.today() - obj.incident_date.date()
        return delta.days


class AnimalBiteCaseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for case listing."""
    
    patient_name = serializers.SerializerMethodField()
    patient_id_display = serializers.SerializerMethodField()
    days_since_incident = serializers.SerializerMethodField()
    
    class Meta:
        model = AnimalBiteCase
        fields = ['id', 'case_number', 'patient_name', 'patient_id_display',
                  'animal_type', 'bite_category', 'severity', 'case_status',
                  'incident_date', 'days_since_incident', 'created_at']
    
    def get_patient_name(self, obj):
        return obj.patient.get_full_name()
    
    def get_patient_id_display(self, obj):
        return obj.patient.patient_id_display
    
    def get_days_since_incident(self, obj):
        from datetime import date
        delta = date.today() - obj.incident_date.date()
        return delta.days
