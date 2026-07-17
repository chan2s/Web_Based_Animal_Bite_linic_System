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
    path('<int:pk>/cancel/', views.cancel_appointment_view, name='appointment-cancel'),

    # Workflow Actions
    path('<int:pk>/check-in/', views.check_in_view, name='appointment-check-in'),
    path('<int:pk>/start-consultation/', views.start_consultation_view, name='appointment-start-consultation'),
    path('<int:pk>/save-consultation/', views.save_consultation_report_view, name='appointment-save-consultation'),
    path('<int:pk>/start-vaccination/', views.start_vaccination_view, name='appointment-start-vaccination'),
    path('<int:pk>/administer-vaccination/', views.administer_vaccination_view, name='appointment-administer-vaccination'),
    path('<int:pk>/start-observation/', views.start_observation_view, name='appointment-start-observation'),
    path('<int:pk>/complete/', views.complete_treatment_view, name='appointment-complete'),
    path('<int:pk>/no-show/', views.no_show_view, name='appointment-no-show'),

    # Veterinarian Queue
    path('veterinarian/queue/', views.veterinarian_queue_view, name='veterinarian-queue'),

    # Consultation Reports
    path('consultations/', views.ConsultationReportListView.as_view(), name='consultation-list'),
    path('consultations/<int:pk>/', views.ConsultationReportDetailView.as_view(), name='consultation-detail'),

    # Notifications
    path('notifications/', views.my_notifications_view, name='notifications'),
    path('notifications/<int:pk>/read/', views.mark_notification_read_view, name='notification-read'),
    path('notifications/read-all/', views.mark_all_notifications_read_view, name='notifications-read-all'),
    path('notifications/unread-count/', views.unread_notification_count_view, name='notifications-unread-count'),

    # Clinic Configuration
    path('config/', views.ClinicConfigurationView.as_view(), name='clinic-config'),
]
