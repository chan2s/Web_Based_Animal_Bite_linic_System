from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Allows access only to admin users."""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated 
                    and hasattr(request.user, 'profile')
                    and request.user.profile.role == 'admin')


class IsDoctor(permissions.BasePermission):
    """Allows access only to doctors."""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated 
                    and hasattr(request.user, 'profile')
                    and request.user.profile.role == 'doctor')


class IsNurse(permissions.BasePermission):
    """Allows access only to nurses."""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated 
                    and hasattr(request.user, 'profile')
                    and request.user.profile.role == 'nurse')


class IsStaff(permissions.BasePermission):
    """Allows access only to staff."""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated 
                    and hasattr(request.user, 'profile')
                    and request.user.profile.role == 'staff')


class IsAdminOrDoctor(permissions.BasePermission):
    """Allows access only to admin or doctor users."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ['admin', 'doctor']


class IsAdminOrDoctorOrNurse(permissions.BasePermission):
    """Allows access to admin, doctor, or nurse users."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ['admin', 'doctor', 'nurse']


class CanManageUsers(permissions.BasePermission):
    """Allows only admin users to manage other users."""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated 
                    and hasattr(request.user, 'profile')
                    and request.user.profile.role == 'admin')


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allows access if user is the owner of the object or is admin."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.profile.role == 'admin':
            return True
        return obj.user == request.user


class IsPatient(permissions.BasePermission):
    """Allows access only to patients."""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated 
                    and hasattr(request.user, 'profile')
                    and request.user.profile.role == 'patient')


class IsStaffUser(permissions.BasePermission):
    """Allows access only to staff users (admin, doctor, nurse, staff)."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ['admin', 'doctor', 'nurse', 'staff']
