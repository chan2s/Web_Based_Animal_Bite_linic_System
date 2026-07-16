from django.db import models
from django.contrib.auth.models import User


class ChatbotConversation(models.Model):
    """A conversation session with the AI chatbot."""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True,
        related_name='chatbot_conversations'
    )
    session_key = models.CharField(
        max_length=128, db_index=True,
        help_text="Anonymous session identifier for unauthenticated users."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chatbot_conversations'
        verbose_name = 'Chatbot Conversation'
        verbose_name_plural = 'Chatbot Conversations'
        ordering = ['-updated_at']

    def __str__(self):
        user_info = self.user.get_full_name() or self.user.username if self.user else f"Session {self.session_key[:8]}"
        return f"Chatbot #{self.id} — {user_info}"


class ChatbotMessage(models.Model):
    """A single message within a chatbot conversation."""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]

    conversation = models.ForeignKey(
        ChatbotConversation, on_delete=models.CASCADE, related_name='messages'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    metadata = models.JSONField(null=True, blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chatbot_messages'
        verbose_name = 'Chatbot Message'
        verbose_name_plural = 'Chatbot Messages'
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role.upper()}] {self.content[:60]}..."
