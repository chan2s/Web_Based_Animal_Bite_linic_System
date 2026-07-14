from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.summary_report_view, name='report-summary'),
    path('daily/', views.daily_report_view, name='report-daily'),
    path('patients/', views.patient_report_view, name='report-patients'),
    path('cases/', views.case_report_view, name='report-cases'),
    path('vaccinations/', views.vaccination_report_view, name='report-vaccinations'),
    path('inventory/', views.inventory_report_view, name='report-inventory'),
]
