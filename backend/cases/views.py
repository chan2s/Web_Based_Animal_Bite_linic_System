from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import AnimalBiteCase
from .serializers import AnimalBiteCaseSerializer, AnimalBiteCaseListSerializer


class AnimalBiteCaseListCreateView(generics.ListCreateAPIView):
    """List all cases or create a new case."""
    
    queryset = AnimalBiteCase.objects.select_related('patient', 'attending_doctor', 'created_by').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case_status', 'bite_category', 'animal_type', 'severity', 
                        'exposure_type', 'wound_location']
    search_fields = ['case_number', 'patient__first_name', 'patient__last_name',
                     'patient__patient_id_display', 'animal_type', 'animal_description']
    ordering_fields = ['created_at', 'incident_date', 'case_status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AnimalBiteCaseListSerializer
        return AnimalBiteCaseSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AnimalBiteCaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a case."""
    
    queryset = AnimalBiteCase.objects.select_related('patient', 'attending_doctor', 'created_by').all()
    serializer_class = AnimalBiteCaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
