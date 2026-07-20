"""
Root API view — provides a health-check / discovery endpoint at the
application root (/) so the backend returns useful JSON instead of a
bare 404 when a client or browser visits http://<host>:8000/.
"""

from django.urls import get_resolver
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def _get_named_urls(resolver=None, prefix=""):
    """Recursively collect all named URL patterns."""
    if resolver is None:
        resolver = get_resolver()
    urls = []
    for pattern in resolver.url_patterns:
        if hasattr(pattern, "name") and pattern.name:
            url_path = prefix + str(pattern.pattern)
            urls.append(url_path)
        if hasattr(pattern, "url_patterns"):
            urls.extend(
                _get_named_urls(pattern, prefix + str(pattern.pattern))
            )
    return sorted(set(urls))


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    """
    API root — returns application metadata and a list of available routes.
    This replaces the default 404 at the root URL so that health checks,
    reverse proxies, and developers always get a meaningful response.
    """
    from django.conf import settings

    resolver = get_resolver()
    all_urls = _get_named_urls(resolver)

    return Response(
        {
            "application": "Animal Bite Clinic System",
            "version": getattr(settings, "APP_VERSION", "1.0.0"),
            "status": "running",
            "docs": "/api/auth/login/",
            "available_endpoints": all_urls,
        }
    )
