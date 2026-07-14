from django.db import models
from django.contrib.auth.models import User


class AuditLog(models.Model):
    """Records all important system activities for auditing purposes."""
    
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
        ('password_change', 'Password Change'),
        ('export', 'Export'),
        ('print', 'Print'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='audit_logs'
    )
    username = models.CharField(max_length=150, blank=True)
    user_role = models.CharField(max_length=20, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    module = models.CharField(max_length=100)
    model_name = models.CharField(max_length=100, blank=True)
    object_id = models.IntegerField(null=True, blank=True)
    object_repr = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    request_method = models.CharField(max_length=10, blank=True)
    request_path = models.CharField(max_length=500, blank=True)
    changes = models.JSONField(null=True, blank=True, help_text="Store field changes for update actions")
    is_successful = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action']),
            models.Index(fields=['module']),
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.username} - {self.get_action_display()} - {self.module} ({self.created_at})"


def log_activity(user, action, module, description, model_name='', object_id=None, 
                 object_repr='', changes=None, request=None):
    """Helper function to create audit log entries."""
    log = AuditLog(
        user=user,
        username=user.username if user else 'anonymous',
        user_role=user.profile.role if user and hasattr(user, 'profile') else '',
        action=action,
        module=module,
        model_name=model_name,
        object_id=object_id,
        object_repr=object_repr,
        description=description,
        changes=changes,
        is_successful=True,
    )
    
    if request:
        log.ip_address = request.META.get('REMOTE_ADDR', '')
        log.user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        log.request_method = request.method
        log.request_path = request.path
    
    log.save()
    return log
