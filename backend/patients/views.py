from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Patient
from .serializers import PatientSerializer, PatientListSerializer


class PatientListCreateView(generics.ListCreateAPIView):
    """List all patients or create a new patient."""
    
    queryset = Patient.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'barangay', 'municipality', 'is_active', 'blood_type']
    search_fields = ['first_name', 'last_name', 'middle_name', 
                     'patient_id_display', 'phone', 'email', 'barangay']
    ordering_fields = ['created_at', 'last_name', 'first_name', 'date_of_birth']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PatientListSerializer
        return PatientSerializer
    
    def perform_create(self, serializer):
        serializer.save(registered_by=self.request.user)


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a patient."""
    
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
