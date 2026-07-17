from rest_framework import serializers
from .models import Appointment, ConsultationReport, Notification, ClinicConfiguration
from .services import check_slot_availability, check_duplicate_booking


class ClinicConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for clinic scheduling configuration."""

    class Meta:
        model = ClinicConfiguration
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']


class ConsultationReportSerializer(serializers.ModelSerializer):
    """Full consultation report serializer."""

    patient_name = serializers.SerializerMethodField()
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ConsultationReport
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()

    def get_recorded_by_name(self, obj):
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.username
        return None


class ConsultationReportListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing consultations."""

    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = ConsultationReport
        fields = ['id', 'patient_name', 'diagnosis', 'symptom_severity',
                  'weight_kg', 'temperature_celsius', 'recorded_by', 'created_at']

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new appointments with availability validation."""

    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_number', 'patient', 'patient_name', 'patient_phone',
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
    assigned_vet_name = serializers.SerializerMethodField()
    can_cancel = serializers.BooleanField(read_only=True)
    status_display = serializers.CharField(read_only=True)
    current_step_index = serializers.IntegerField(read_only=True)
    workflow_progress = serializers.IntegerField(read_only=True)
    consultant = ConsultationReportSerializer(read_only=True, source='consultation')

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

    def get_assigned_vet_name(self, obj):
        if obj.assigned_veterinarian:
            return obj.assigned_veterinarian.get_full_name() or obj.assigned_veterinarian.username
        return None


class AppointmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for appointment lists."""

    booked_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(read_only=True)
    current_step_index = serializers.IntegerField(read_only=True)
    workflow_progress = serializers.IntegerField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_number', 'patient', 'patient_name', 'patient_phone',
            'appointment_date', 'time_slot', 'reason', 'status',
            'status_display', 'booked_by_name', 'created_at',
            'assigned_veterinarian', 'current_step_index', 'workflow_progress'
        ]

    def get_booked_by_name(self, obj):
        return obj.booked_by.get_full_name() or obj.booked_by.username


class AppointmentStaffUpdateSerializer(serializers.ModelSerializer):
    """Serializer for staff to update appointment status and details."""

    class Meta:
        model = Appointment
        fields = [
            'status', 'staff_notes', 'handled_by', 'appointment_date', 'time_slot',
            'assigned_veterinarian', 'patient'
        ]

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


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for in-system notifications."""

    notification_type_display = serializers.CharField(read_only=True, source='get_notification_type_display')
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'recipient', 'created_at']

    def get_time_ago(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        if delta.days > 0:
            return f"{delta.days}d ago"
        if delta.seconds >= 3600:
            return f"{delta.seconds // 3600}h ago"
        if delta.seconds >= 60:
            return f"{delta.seconds // 60}m ago"
        return "Just now"
