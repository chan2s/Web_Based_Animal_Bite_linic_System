from rest_framework import permissions


# ── Helper ──

def _get_role(request):
    """Safely get the user's role from profile."""
    if not request.user or not request.user.is_authenticated:
        return None
    if not hasattr(request.user, 'profile'):
        return None
    return request.user.profile.role


STAFF_ROLES = ['admin', 'doctor', 'veterinarian', 'nurse', 'staff']
CLINICAL_ROLES = ['admin', 'doctor', 'veterinarian', 'nurse']


def is_staff_role(role):
    return role in STAFF_ROLES


def is_clinical_role(role):
    return role in CLINICAL_ROLES


# ── Role Checks ──

class IsAdmin(permissions.BasePermission):
    """Allows access only to admin users."""
    
    def has_permission(self, request, view):
        return _get_role(request) == 'admin'


class IsDoctor(permissions.BasePermission):
    """Allows access only to doctors."""
    
    def has_permission(self, request, view):
        return _get_role(request) == 'doctor'


class IsNurse(permissions.BasePermission):
    """Allows access only to nurses."""
    
    def has_permission(self, request, view):
        return _get_role(request) == 'nurse'


class IsStaff(permissions.BasePermission):
    """Allows access only to staff (non-clinical)."""
    
    def has_permission(self, request, view):
        return _get_role(request) == 'staff'


class IsPatient(permissions.BasePermission):
    """Allows access only to patients."""
    
    def has_permission(self, request, view):
        return _get_role(request) == 'patient'


# ── Compound Role Checks ──

class IsAdminOrDoctor(permissions.BasePermission):
    """Allows access only to admin or doctor users."""
    
    def has_permission(self, request, view):
        return _get_role(request) in ['admin', 'doctor']


class IsAdminOrDoctorOrNurse(permissions.BasePermission):
    """Allows access to admin, doctor, veterinarian, or nurse users."""
    
    def has_permission(self, request, view):
        return _get_role(request) in ['admin', 'doctor', 'veterinarian', 'nurse']


class IsStaffUser(permissions.BasePermission):
    """Allows access only to staff users (admin, doctor, nurse, staff)."""
    
    def has_permission(self, request, view):
        return _get_role(request) in STAFF_ROLES


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allows access if user is the owner of the object or is admin."""
    
    def has_permission(self, request, view):
        return True  # Checked at object level
    
    def has_object_permission(self, request, view, obj):
        role = _get_role(request)
        if role == 'admin':
            return True
        return hasattr(obj, 'user') and obj.user == request.user


# ── Management Permissions ──

class CanManageUsers(permissions.BasePermission):
    """Only admin can manage users (create/edit/delete)."""
    
    def has_permission(self, request, view):
        return _get_role(request) == 'admin'


class CanDeleteRecord(permissions.BasePermission):
    """Only admin can permanently delete records."""
    
    def has_permission(self, request, view):
        if request.method == 'DELETE':
            return _get_role(request) == 'admin'
        return True


class CanModifyPatient(permissions.BasePermission):
    """
    Admin can create/edit/delete patients.
    Staff (doctor, nurse, staff) can view and create patients,
    but cannot edit personal information fields or delete patients.
    """
    
    def has_permission(self, request, view):
        role = _get_role(request)
        if not role:
            return False
        
        # Anyone in STAFF_ROLES can view patients
        if request.method in permissions.SAFE_METHODS:
            return role in STAFF_ROLES
        
        # DELETE: admin only
        if request.method == 'DELETE':
            return role == 'admin'
        
        # CREATE: admin, doctor, nurse are allowed
        if request.method == 'POST':
            return role in ['admin', 'doctor', 'nurse']
        
        # PUT/PATCH: admin can update all fields;
        # staff can update but we'll restrict fields at serializer level
        return role in STAFF_ROLES


class CanManageVaccines(permissions.BasePermission):
    """Only admin can manage vaccine inventory (CRUD). Staff can view."""
    
    def has_permission(self, request, view):
        role = _get_role(request)
        if not role:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return role in STAFF_ROLES  # All staff can view
        
        return role == 'admin'


class CanViewReports(permissions.BasePermission):
    """Only admin can view reports and analytics."""
    
    def has_permission(self, request, view):
        return _get_role(request) == 'admin'


class CanViewAuditLogs(permissions.BasePermission):
    """Only admin can view audit logs."""
    
    def has_permission(self, request, view):
        return _get_role(request) == 'admin'


class CanEditClinicalFields(permissions.BasePermission):
    """
    Staff (doctor, nurse) can update clinical/medical fields on patients.
    Admin can update ALL fields.
    Used as a marker — actual field restriction is in the serializer.
    """
    
    def has_permission(self, request, view):
        role = _get_role(request)
        if not role:
            return False
        return role in ['admin', 'doctor', 'nurse']
