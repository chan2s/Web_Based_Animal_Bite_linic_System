from django.contrib import admin
from .models import Conversation, Message, MessageReadStatus


class MessageInline(admin.TabularInline):
    model = Message
    fields = ['sender', 'body', 'is_delivered', 'is_read', 'created_at']
    readonly_fields = ['sender', 'body', 'created_at']
    extra = 0
    max_num = 20
    ordering = ['-created_at']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'staff', 'subject', 'status', 'last_message_at', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['patient__username', 'patient__email', 'patient__first_name', 'patient__last_name',
                     'staff__username', 'staff__email']
    inlines = [MessageInline]
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'body_preview', 'is_delivered', 'is_read', 'created_at']
    list_filter = ['is_read', 'is_delivered', 'created_at']
    search_fields = ['body', 'sender__username', 'sender__email']
    readonly_fields = ['created_at', 'updated_at']

    def body_preview(self, obj):
        return obj.body[:80] + '...' if len(obj.body) > 80 else obj.body
    body_preview.short_description = 'Message'


@admin.register(MessageReadStatus)
class MessageReadStatusAdmin(admin.ModelAdmin):
    list_display = ['message', 'reader', 'read_at']
    list_filter = ['read_at']
    search_fields = ['reader__username', 'reader__email']
