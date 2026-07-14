from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    """List audit logs (read-only for non-admin users)."""
    
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'module', 'user_role', 'is_successful']
    search_fields = ['username', 'description', 'module', 'model_name', 'object_repr']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
