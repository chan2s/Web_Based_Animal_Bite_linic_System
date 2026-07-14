from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vaccine, VaccineBatch, LowStockAlert
from .serializers import (
    VaccineSerializer, VaccineListSerializer,
    VaccineBatchSerializer, LowStockAlertSerializer
)


class VaccineListCreateView(generics.ListCreateAPIView):
    """List all vaccines or create a new one."""
    
    queryset = Vaccine.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vaccine_type', 'is_active']
    search_fields = ['name', 'manufacturer']
    ordering_fields = ['name', 'vaccine_type']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return VaccineListSerializer
        return VaccineSerializer


class VaccineDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a vaccine."""
    
    queryset = Vaccine.objects.all()
    serializer_class = VaccineSerializer
    permission_classes = [permissions.IsAuthenticated]


class VaccineBatchListCreateView(generics.ListCreateAPIView):
    """List all stock transactions or create a new one."""
    
    queryset = VaccineBatch.objects.select_related('vaccine', 'recorded_by').all()
    serializer_class = VaccineBatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'vaccine']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class VaccineBatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a stock transaction."""
    
    queryset = VaccineBatch.objects.select_related('vaccine', 'recorded_by').all()
    serializer_class = VaccineBatchSerializer
    permission_classes = [permissions.IsAuthenticated]


class LowStockAlertListCreateView(generics.ListCreateAPIView):
    """List or configure low stock alerts."""
    
    queryset = LowStockAlert.objects.select_related('vaccine').all()
    serializer_class = LowStockAlertSerializer
    permission_classes = [permissions.IsAuthenticated]


class LowStockAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a low stock alert config."""
    
    queryset = LowStockAlert.objects.select_related('vaccine').all()
    serializer_class = LowStockAlertSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def low_stock_summary_view(request):
    """Get all vaccines that are below their threshold."""
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
@permission_classes([permissions.IsAuthenticated])
def inventory_summary_view(request):
    """Get overall inventory summary."""
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
