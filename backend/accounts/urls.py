from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register_view, name='auth-register'),
    path('register/step1/', views.register_step1_view, name='auth-register-step1'),
    path('register/verify-otp/', views.verify_otp_view, name='auth-verify-otp'),
    path('register/resend-otp/', views.resend_otp_view, name='auth-resend-otp'),
    path('login/', views.login_view, name='auth-login'),
    path('logout/', views.logout_view, name='auth-logout'),
    path('profile/', views.profile_view, name='auth-profile'),
    path('profile/patient/', views.patient_profile_view, name='auth-patient-profile'),
    path('change-password/', views.change_password_view, name='auth-change-password'),

    # User Management (Admin only)
    path('users/', views.UserListCreateView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]
