from django.urls import path
from . import views

# Using DRF path-based views since rest_framework_nested might not be installed

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='conversation-list'),
    path('conversations/<int:pk>/', views.ConversationViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='conversation-detail'),

    # Messages within a conversation
    path('conversations/<int:conversation_pk>/messages/', views.MessageViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='conversation-messages'),

    # Utility endpoints
    path('unread-count/', views.unread_count_view, name='chat-unread-count'),
    path('staff-patients/', views.staff_patients_view, name='chat-staff-patients'),
    path('available-staff/', views.available_staff_view, name='chat-available-staff'),
]
