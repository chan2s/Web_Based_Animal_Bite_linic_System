from rest_framework import serializers
from .models import ChatbotConversation, ChatbotMessage


class ChatbotMessageSerializer(serializers.ModelSerializer):
    """Serializer for individual chatbot messages."""

    class Meta:
        model = ChatbotMessage
        fields = ['id', 'role', 'content', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatbotConversationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing conversations."""
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatbotConversation
        fields = ['id', 'created_at', 'updated_at', 'last_message']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if not last_msg:
            return None
        return {
            'content': last_msg.content[:80],
            'role': last_msg.role,
            'created_at': last_msg.created_at,
        }


class ChatbotConversationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with all messages."""
    messages = ChatbotMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatbotConversation
        fields = ['id', 'created_at', 'updated_at', 'messages']


class ChatbotMessageCreateSerializer(serializers.Serializer):
    """Serializer for creating a new chatbot message."""
    message = serializers.CharField(required=True, max_length=5000, min_length=1)
    conversation_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_message(self, value):
        # Sanitize: strip HTML/script tags for XSS prevention
        import re
        value = re.sub(r'<[^>]*>', '', value)
        return value.strip()
