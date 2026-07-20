from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vaccine, VaccineBatch, LowStockAlert
from .serializers import (
    VaccineSerializer, VaccineListSerializer,
    VaccineBatchSerializer, LowStockAlertSerializer
)
from accounts.permissions import CanManageVaccines, CanDeleteRecord, IsStaffUser
from audit_logs.models import log_activity


class VaccineListCreateView(generics.ListCreateAPIView):
    """List all vaccines or create a new one."""
    
    queryset = Vaccine.objects.all()
    permission_classes = [permissions.IsAuthenticated, CanManageVaccines]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vaccine_type', 'is_active']
    search_fields = ['name', 'manufacturer']
    ordering_fields = ['name', 'vaccine_type']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return VaccineListSerializer
        return VaccineSerializer
    
    def perform_create(self, serializer):
        vaccine = serializer.save()
        log_activity(
            user=self.request.user,
            action='create',
            module='inventory',
            description=f"Added vaccine {vaccine.name}",
            model_name='Vaccine',
            object_id=vaccine.id,
            object_repr=str(vaccine),
            request=self.request,
        )


class VaccineDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a vaccine."""
    
    queryset = Vaccine.objects.all()
    serializer_class = VaccineSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageVaccines]
    
    def perform_update(self, serializer):
        old = self.get_object()
        vaccine = serializer.save()
        log_activity(
            user=self.request.user,
            action='update',
            module='inventory',
            description=f"Updated vaccine {vaccine.name}",
            model_name='Vaccine',
            object_id=vaccine.id,
            object_repr=str(vaccine),
            request=self.request,
        )
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        log_activity(
            user=self.request.user,
            action='delete',
            module='inventory',
            description=f"Archived vaccine {instance.name}",
            model_name='Vaccine',
            object_id=instance.id,
            object_repr=str(instance),
            request=self.request,
        )


class VaccineBatchListCreateView(generics.ListCreateAPIView):
    """List all stock transactions or create a new one (admin only)."""
    
    queryset = VaccineBatch.objects.select_related('vaccine', 'recorded_by').all()
    serializer_class = VaccineBatchSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageVaccines]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'vaccine']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        batch = serializer.save(recorded_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='create',
            module='inventory',
            description=f"Added batch {batch.batch_number} for {batch.vaccine.name}",
            model_name='VaccineBatch',
            object_id=batch.id,
            object_repr=str(batch),
            request=self.request,
        )


class VaccineBatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a stock transaction (admin only)."""
    
    queryset = VaccineBatch.objects.select_related('vaccine', 'recorded_by').all()
    serializer_class = VaccineBatchSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageVaccines]


class LowStockAlertListCreateView(generics.ListCreateAPIView):
    """List or configure low stock alerts (admin only for writes)."""
    
    queryset = LowStockAlert.objects.select_related('vaccine').all()
    serializer_class = LowStockAlertSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageVaccines]


class LowStockAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a low stock alert config (admin only)."""
    
    queryset = LowStockAlert.objects.select_related('vaccine').all()
    serializer_class = LowStockAlertSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageVaccines]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsStaffUser])
def low_stock_summary_view(request):
    """Get all vaccines that are below their threshold. All staff can view."""
    alerts = LowStockAlert.objects.filter(is_enabled=True).select_related('vaccine')
    
    low_stock_items = []
    for alert in alerts:
        stock = alert.vaccine.current_stock
        if stock <= alert.threshold:
            low_stock_items.append({
                'vaccine_id': alert.vaccine.id,
                'vaccine_name': str(alert.vaccine),
                'current_stock': stock,
                'threshold': alert.threshold,
                'unit': alert.vaccine.unit,
            })
    
    return Response(low_stock_items)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsStaffUser])
def inventory_summary_view(request):
    """Get overall inventory summary. All staff can view."""
    vaccines = Vaccine.objects.filter(is_active=True)
    
    summary = []
    for vaccine in vaccines:
        stock = vaccine.current_stock
        alert = LowStockAlert.objects.filter(vaccine=vaccine, is_enabled=True).first()
        threshold = alert.threshold if alert else 0
        is_low = stock <= threshold
        
        summary.append({
            'vaccine_id': vaccine.id,
            'vaccine_name': str(vaccine),
            'vaccine_type': vaccine.vaccine_type,
            'current_stock': stock,
            'threshold': threshold,
            'is_low_stock': is_low,
            'unit': vaccine.unit,
        })
    
    return Response(summary)
