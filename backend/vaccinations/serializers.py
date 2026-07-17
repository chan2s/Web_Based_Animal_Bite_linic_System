from rest_framework import serializers
from .models import VaccinationRecord, VaccinationSchedule


class VaccinationRecordSerializer(serializers.ModelSerializer):
    """Full vaccination record serializer."""
    
    patient_name = serializers.SerializerMethodField()
    case_number = serializers.SerializerMethodField()
    vaccine_name = serializers.SerializerMethodField()
    administered_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = VaccinationRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return obj.patient.get_full_name()
    
    def get_case_number(self, obj):
        return obj.case.case_number if obj.case else None
    
    def get_vaccine_name(self, obj):
        return str(obj.vaccine) if obj.vaccine else None
    
    def get_administered_by_name(self, obj):
        if obj.administered_by:
            return obj.administered_by.get_full_name() or obj.administered_by.username
        return None


class VaccinationRecordListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing vaccinations."""
    
    patient_name = serializers.SerializerMethodField()
    patient_id_display = serializers.SerializerMethodField()
    vaccine_name = serializers.SerializerMethodField()
    
    class Meta:
        model = VaccinationRecord
        fields = ['id', 'patient', 'patient_name', 'patient_id_display', 'dose_type', 'dose_number',
                  'scheduled_date', 'administered_date', 'result',
                  'vaccine_name', 'vaccine', 'batch_number', 'administered_by_name', 'created_at']
    
    def get_patient_name(self, obj):
        return obj.patient.get_full_name()
    
    def get_patient_id_display(self, obj):
        return obj.patient.patient_id_display
    
    def get_vaccine_name(self, obj):
        return str(obj.vaccine) if obj.vaccine else None

    def get_administered_by_name(self, obj):
        if obj.administered_by:
            return obj.administered_by.get_full_name() or obj.administered_by.username
        return None


class VaccinationScheduleSerializer(serializers.ModelSerializer):
    """Vaccination schedule serializer."""
    
    patient_name = serializers.SerializerMethodField()
    case_number = serializers.SerializerMethodField()
    
    class Meta:
        model = VaccinationSchedule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return obj.patient.get_full_name()
    
    def get_case_number(self, obj):
        return obj.case.case_number if obj.case else None
