from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserListCreateView.as_view(), name='user-management-list'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user-management-detail'),
]
