from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Conversation, Message, MessageReadStatus


class UserMinialSerializer(serializers.ModelSerializer):
    """Lightweight user serializer for chat participants."""
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='profile.role', read_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'full_name', 'role', 'profile_picture']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_profile_picture(self, obj):
        # No avatar/picture field exists on UserProfile yet
        return None


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for individual messages."""
    sender = UserMinialSerializer(read_only=True)
    sender_id = serializers.IntegerField(read_only=True)
    read_by = serializers.SerializerMethodField()
    is_delivered = serializers.BooleanField(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_id', 'body',
                  'is_delivered', 'is_read', 'read_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'sender', 'conversation',
                            'is_delivered', 'is_read', 'created_at', 'updated_at']

    def get_read_by(self, obj):
        read_statuses = obj.read_statuses.all()
        return [
            {
                'reader_id': rs.reader.id,
                'reader_name': rs.reader.get_full_name() or rs.reader.username,
                'read_at': rs.read_at,
            }
            for rs in read_statuses
        ]


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new message."""

    class Meta:
        model = Message
        fields = ['body']
        extra_kwargs = {
            'body': {'required': True, 'max_length': 5000},
        }


class ConversationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing conversations with last message preview."""
    participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'subject', 'status', 'participant', 'last_message',
                  'unread_count', 'is_online', 'last_seen', 'last_message_at',
                  'created_at', 'updated_at']

    def get_participant(self, obj):
        """Return the 'other' participant from the perspective of the requesting user."""
        request = self.context.get('request')
        if not request:
            return None
        user = request.user
        profile = user.profile

        # For patients, return staff info (or null staff)
        if profile.role == 'patient':
            if obj.staff:
                return UserMinialSerializer(obj.staff).data
            return {
                'id': None,
                'full_name': 'Clinic Staff',
                'role': 'staff',
            }

        # For staff, return patient info
        return UserMinialSerializer(obj.patient).data

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if not last_msg:
            return None
        return {
            'id': last_msg.id,
            'body': last_msg.body[:100],
            'sender_id': last_msg.sender_id,
            'created_at': last_msg.created_at,
        }

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.get_unread_count(request.user)

    def get_is_online(self, obj):
        """
        Check if the other participant is online.
        Uses a simple session-based check - last activity within 5 minutes.
        """
        request = self.context.get('request')
        if not request:
            return False
        user = request.user
        profile = user.profile

        if profile.role == 'patient':
            target = obj.staff
        else:
            target = obj.patient

        if not target:
            return False

        from django.utils import timezone
        # Check if user has been active in the last 5 minutes
        # This is a simplified check - for production, use Redis presence
        return hasattr(target, 'last_login') and target.last_login and \
            (timezone.now() - target.last_login).total_seconds() < 300

    def get_last_seen(self, obj):
        """Return human-readable 'last seen' time for the other participant."""
        request = self.context.get('request')
        if not request:
            return None
        user = request.user
        profile = user.profile

        if profile.role == 'patient':
            target = obj.staff
        else:
            target = obj.patient

        if not target or not target.last_login:
            return None

        from django.utils.timesince import timesince
        return timesince(target.last_login)


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a single conversation with full participant info."""
    patient = UserMinialSerializer(read_only=True)
    staff = UserMinialSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'subject', 'status', 'patient', 'staff',
                  'messages', 'unread_count', 'last_message_at',
                  'created_at', 'updated_at']

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.get_unread_count(request.user)


class ConversationCreateSerializer(serializers.Serializer):
    """Serializer for creating a new conversation."""
    subject = serializers.CharField(required=False, max_length=200, default='')
    message = serializers.CharField(required=True, max_length=5000)
    staff_id = serializers.IntegerField(required=False, allow_null=True)
    patient_id = serializers.IntegerField(required=False, allow_null=True)
