from django.urls import path
from . import views

urlpatterns = [
    path('records/', views.VaccinationRecordListCreateView.as_view(), name='vaccination-record-list'),
    path('records/<int:pk>/', views.VaccinationRecordDetailView.as_view(), name='vaccination-record-detail'),
    path('schedules/', views.VaccinationScheduleListCreateView.as_view(), name='vaccination-schedule-list'),
    path('schedules/<int:pk>/', views.VaccinationScheduleDetailView.as_view(), name='vaccination-schedule-detail'),
    path('missed/', views.missed_vaccinations_view, name='vaccination-missed'),
    path('today/', views.today_vaccinations_view, name='vaccination-today'),
]
