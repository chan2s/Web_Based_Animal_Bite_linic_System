from django.urls import path
from . import views

urlpatterns = [
    # Public/Availability
    path('available-slots/', views.available_slots_view, name='available-slots'),
    path('check-slot/', views.check_slot_view, name='check-slot'),
    path('clinic-info/', views.clinic_info_view, name='clinic-info'),
    
    # User Appointments
    path('my-upcoming/', views.my_upcoming_appointments_view, name='my-upcoming'),
    path('my-history/', views.my_appointment_history_view, name='my-history'),
    
    # Appointments CRUD
    path('', views.AppointmentListCreateView.as_view(), name='appointment-list'),
    path('<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment-detail'),
    
    # Staff Actions
    path('staff/all/', views.AppointmentStaffListView.as_view(), name='appointment-staff-all'),
    path('<int:pk>/approve/', views.approve_appointment_view, name='appointment-approve'),
    path('<int:pk>/reject/', views.reject_appointment_view, name='appointment-reject'),
    path('<int:pk>/complete/', views.complete_appointment_view, name='appointment-complete'),
    path('<int:pk>/cancel/', views.cancel_appointment_view, name='appointment-cancel'),
    
    # Clinic Configuration
    path('config/', views.ClinicConfigurationView.as_view(), name='clinic-config'),
]
