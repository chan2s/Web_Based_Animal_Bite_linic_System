from django.urls import path
from . import views

urlpatterns = [
    path('vaccines/', views.VaccineListCreateView.as_view(), name='vaccine-list'),
    path('vaccines/<int:pk>/', views.VaccineDetailView.as_view(), name='vaccine-detail'),
    path('batches/', views.VaccineBatchListCreateView.as_view(), name='batch-list'),
    path('batches/<int:pk>/', views.VaccineBatchDetailView.as_view(), name='batch-detail'),
    path('alerts/', views.LowStockAlertListCreateView.as_view(), name='alert-list'),
    path('alerts/<int:pk>/', views.LowStockAlertDetailView.as_view(), name='alert-detail'),
    path('low-stock/', views.low_stock_summary_view, name='inventory-low-stock'),
    path('summary/', views.inventory_summary_view, name='inventory-summary'),
]
