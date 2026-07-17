from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Patient
from .serializers import PatientSerializer, PatientListSerializer, StaffPatientUpdateSerializer
from accounts.permissions import CanModifyPatient, CanDeleteRecord, _get_role
from audit_logs.models import log_activity

PROTECTED_FIELDS = [
    'first_name', 'middle_name', 'last_name', 'suffix',
    'date_of_birth', 'gender', 'blood_type',
    'phone', 'email', 'address', 'barangay', 'municipality', 'province',
    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
    'patient_id_display', 'is_active',
]


class PatientListCreateView(generics.ListCreateAPIView):
    """List all patients or create a new patient."""
    
    queryset = Patient.objects.all()
    permission_classes = [permissions.IsAuthenticated, CanModifyPatient]
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
        patient = serializer.save(registered_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='create',
            module='patients',
            description=f"Created patient {patient.get_full_name()} ({patient.patient_id_display})",
            model_name='Patient',
            object_id=patient.id,
            object_repr=str(patient),
            request=self.request,
        )


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a patient."""
    
    queryset = Patient.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            role = _get_role(self.request)
            if role and role != 'admin':
                # Staff users get a restricted serializer that only allows clinical fields
                return StaffPatientUpdateSerializer
        return PatientSerializer
    
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [permissions.IsAuthenticated(), CanDeleteRecord()]
        return [permissions.IsAuthenticated(), CanModifyPatient()]
    
    def perform_update(self, serializer):
        old_patient = self.get_object()
        patient = serializer.save()
        
        # Audit log for sensitive updates
        role = _get_role(self.request)
        changes = {}
        for field in PROTECTED_FIELDS:
            old_val = getattr(old_patient, field, None)
            new_val = getattr(patient, field, None)
            if old_val != new_val:
                changes[field] = {'old': str(old_val), 'new': str(new_val)}
        
        if changes:
            log_activity(
                user=self.request.user,
                action='update',
                module='patients',
                description=f"Updated patient {patient.get_full_name()} ({patient.patient_id_display})",
                model_name='Patient',
                object_id=patient.id,
                object_repr=str(patient),
                changes=changes,
                request=self.request,
            )
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        log_activity(
            user=self.request.user,
            action='delete',
            module='patients',
            description=f"Deactivated patient {instance.get_full_name()} ({instance.patient_id_display})",
            model_name='Patient',
            object_id=instance.id,
            object_repr=str(instance),
            request=self.request,
        )
