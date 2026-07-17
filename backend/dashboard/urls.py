from django.urls import path
from . import views

urlpatterns = [
    # Role-specific dashboards
    path('admin/', views.admin_dashboard_view, name='dashboard-admin'),
    path('staff/', views.staff_dashboard_view, name='dashboard-staff'),
    path('veterinarian/', views.veterinarian_dashboard_view, name='dashboard-veterinarian'),
    path('patient/', views.patient_dashboard_view, name='dashboard-patient'),
]
