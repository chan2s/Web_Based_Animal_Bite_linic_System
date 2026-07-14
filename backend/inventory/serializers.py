from rest_framework import serializers
from .models import Vaccine, VaccineBatch, LowStockAlert


class VaccineSerializer(serializers.ModelSerializer):
    """Vaccine product serializer with computed stock."""
    
    current_stock = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Vaccine
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class VaccineListSerializer(serializers.ModelSerializer):
    """Lightweight vaccine list serializer."""
    
    current_stock = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Vaccine
        fields = ['id', 'name', 'vaccine_type', 'manufacturer', 
                  'current_stock', 'unit', 'is_active']


class VaccineBatchSerializer(serializers.ModelSerializer):
    """Vaccine batch/serializer."""
    
    vaccine_name = serializers.SerializerMethodField()
    recorded_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = VaccineBatch
        fields = '__all__'
        read_only_fields = ['id', 'recorded_by', 'created_at', 'updated_at']
    
    def get_vaccine_name(self, obj):
        return str(obj.vaccine) if obj.vaccine else None
    
    def get_recorded_by_name(self, obj):
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.username
        return None


class LowStockAlertSerializer(serializers.ModelSerializer):
    """Low stock alert configuration serializer."""
    
    vaccine_name = serializers.SerializerMethodField()
    current_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = LowStockAlert
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_vaccine_name(self, obj):
        return str(obj.vaccine)
    
    def get_current_stock(self, obj):
        return obj.vaccine.current_stock
