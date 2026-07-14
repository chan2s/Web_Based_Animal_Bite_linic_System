from django.utils.deprecation import MiddlewareMixin
from .models import log_activity


class AuditLogMiddleware(MiddlewareMixin):
    """Middleware to automatically log certain system activities."""
    
    # Paths to exclude from audit logging
    EXCLUDED_PATHS = [
        '/admin/jsi18n/',
        '/static/',
        '/media/',
    ]
    
    # Modules that shouldn't be logged on every request
    READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS']
    
    def process_response(self, request, response):
        # Skip logging for excluded paths and read-only methods
        path = request.path_info
        if any(path.startswith(excluded) for excluded in self.EXCLUDED_PATHS):
            return response
        
        if request.method in self.READ_ONLY_METHODS:
            return response
        
        # Skip if user is not authenticated
        if not request.user or not request.user.is_authenticated:
            return response
        
        # Determine action from HTTP method
        action_map = {
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete',
        }
        
        action = action_map.get(request.method, 'other')
        
        # Determine module from URL path
        path_parts = path.strip('/').split('/')
        module = path_parts[0] if path_parts else 'unknown'
        
        # Only log for our API endpoints
        if module not in ['api']:
            return response
        
        # Get the sub-module (e.g., patients, cases, etc.)
        sub_module = path_parts[1] if len(path_parts) > 1 else 'unknown'
        
        # Log the activity
        log_activity(
            user=request.user,
            action=action,
            module=f"{module}/{sub_module}",
            description=f"{action.upper()} request to {path}",
            request=request,
        )
        
        return response
