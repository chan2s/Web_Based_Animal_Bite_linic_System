from django.urls import path
from . import views

urlpatterns = [
    path('send/', views.chat_send, name='chatbot-send'),
    path('history/', views.chat_history, name='chatbot-history'),
    path('history/<int:conversation_id>/', views.chat_conversation_detail, name='chatbot-conversation-detail'),
]
