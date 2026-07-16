from django.contrib import admin
from .models import ChatbotConversation, ChatbotMessage


class ChatbotMessageInline(admin.TabularInline):
    model = ChatbotMessage
    fields = ['role', 'content', 'created_at']
    readonly_fields = ['role', 'content', 'created_at']
    ordering = ['created_at']
    extra = 0
    max_num = 20


@admin.register(ChatbotConversation)
class ChatbotConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_key_short', 'message_count', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['user__username', 'user__email', 'session_key']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ChatbotMessageInline]

    def session_key_short(self, obj):
        return obj.session_key[:16] if obj.session_key else '—'
    session_key_short.short_description = 'Session'

    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'Messages'


@admin.register(ChatbotMessage)
class ChatbotMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'role', 'content_preview', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['content']

    def content_preview(self, obj):
        return obj.content[:80]
    content_preview.short_description = 'Content'
