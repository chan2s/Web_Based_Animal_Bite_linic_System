from django.urls import path
from . import views

urlpatterns = [
    path('', views.AnimalBiteCaseListCreateView.as_view(), name='case-list'),
    path('<int:pk>/', views.AnimalBiteCaseDetailView.as_view(), name='case-detail'),
]
