from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/cases/', include('cases.urls')),
    path('api/vaccinations/', include('vaccinations.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/audit-logs/', include('audit_logs.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/appointments/', include('appointments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
