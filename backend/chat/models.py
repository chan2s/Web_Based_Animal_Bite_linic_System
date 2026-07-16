from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Conversation(models.Model):
    """
    A conversation between two participants: a patient and a staff member.
    Patients can only have conversations with staff, never with other patients.
    Staff can have conversations with any patient.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('resolved', 'Resolved'),
        ('archived', 'Archived'),
    ]

    # Participants - exactly one patient and one staff member
    patient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='patient_conversations'
    )
    staff = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='staff_conversations',
        null=True, blank=True,
        help_text="Assigned staff member. Null until a staff member responds."
    )

    # Metadata
    subject = models.CharField(max_length=200, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_message_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_conversations'
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-last_message_at', '-created_at']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['staff', 'status']),
            models.Index(fields=['status', 'last_message_at']),
        ]

    def __str__(self):
        return f"Conversation {self.id}: {self.patient.get_full_name()} ↔ {self.staff.get_full_name() if self.staff else 'Unassigned'}"

    def get_unread_count(self, user):
        """Get the number of unread messages for a given user in this conversation."""
        return self.messages.filter(
            ~models.Q(sender=user),
            ~models.Q(read_statuses__reader=user)
        ).count()


class Message(models.Model):
    """
    A single message within a conversation.
    """
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_messages'
    )
    body = models.TextField()
    is_delivered = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_messages'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', 'is_read']),
        ]

    def __str__(self):
        return f"Message {self.id} by {self.sender.get_full_name()} in conv {self.conversation.id}"


class MessageReadStatus(models.Model):
    """
    Tracks when a user has read a message (for seen receipts).
    """
    message = models.ForeignKey(
        Message, on_delete=models.CASCADE, related_name='read_statuses'
    )
    reader = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='message_read_statuses'
    )
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_message_read_statuses'
        verbose_name = 'Message Read Status'
        verbose_name_plural = 'Message Read Statuses'
        unique_together = ['message', 'reader']

    def __str__(self):
        return f"{self.reader.get_full_name()} read msg {self.message.id} at {self.read_at}"
