from rest_framework import serializers
from .models import Appointment, ClinicConfiguration
from .services import check_slot_availability, check_duplicate_booking


class ClinicConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for clinic scheduling configuration."""
    
    class Meta:
        model = ClinicConfiguration
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new appointments with availability validation."""
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_number', 'patient_name', 'patient_phone',
            'patient_email', 'appointment_date', 'time_slot', 'reason',
            'reason_other', 'notes', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'appointment_number', 'status', 'created_at']
    
    def validate_appointment_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("Cannot book appointments in the past.")
        return value
    
    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if request else None
        
        if not user:
            raise serializers.ValidationError("Authentication required.")
        
        target_date = attrs.get('appointment_date')
        time_slot = attrs.get('time_slot')
        
        # Check duplicate booking
        if check_duplicate_booking(user, target_date, time_slot):
            raise serializers.ValidationError(
                "You already have an appointment at this date and time."
            )
        
        # Check slot availability
        availability = check_slot_availability(target_date, time_slot)
        if not availability['available']:
            raise serializers.ValidationError(availability['message'])
        
        return attrs
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['booked_by'] = request.user
        return super().create(validated_data)


class AppointmentSerializer(serializers.ModelSerializer):
    """Full appointment serializer with computed fields."""
    
    booked_by_name = serializers.SerializerMethodField()
    handled_by_name = serializers.SerializerMethodField()
    can_cancel = serializers.BooleanField(read_only=True)
    status_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['id', 'appointment_number', 'booked_by', 'created_at', 'updated_at']
    
    def get_booked_by_name(self, obj):
        return obj.booked_by.get_full_name() or obj.booked_by.username
    
    def get_handled_by_name(self, obj):
        if obj.handled_by:
            return obj.handled_by.get_full_name() or obj.handled_by.username
        return None


class AppointmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for appointment lists."""
    
    booked_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_number', 'patient_name', 'patient_phone',
            'appointment_date', 'time_slot', 'reason', 'status',
            'status_display', 'booked_by_name', 'created_at'
        ]
    
    def get_booked_by_name(self, obj):
        return obj.booked_by.get_full_name() or obj.booked_by.username


class AppointmentStaffUpdateSerializer(serializers.ModelSerializer):
    """Serializer for staff to update appointment status."""
    
    class Meta:
        model = Appointment
        fields = ['status', 'staff_notes', 'handled_by', 'appointment_date', 'time_slot']
    
    def validate(self, attrs):
        # If rescheduling, validate availability
        if 'appointment_date' in attrs or 'time_slot' in attrs:
            instance = self.instance
            target_date = attrs.get('appointment_date', instance.appointment_date)
            time_slot = attrs.get('time_slot', instance.time_slot)
            
            availability = check_slot_availability(
                target_date, time_slot, 
                exclude_appointment_id=instance.id
            )
            if not availability['available']:
                raise serializers.ValidationError(availability['message'])
        
        return attrs
    
    def update(self, instance, validated_data):
        # Track rescheduling
        if 'appointment_date' in validated_data or 'time_slot' in validated_data:
            if not instance.original_date:
                instance.original_date = instance.appointment_date
                instance.original_time_slot = instance.time_slot
            
            if instance.status == 'pending':
                instance.status = 'approved'
        
        return super().update(instance, validated_data)
