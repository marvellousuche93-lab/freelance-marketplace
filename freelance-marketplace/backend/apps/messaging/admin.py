from django.contrib import admin

from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    fields = ("sender", "body", "is_read", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "participants_display", "message_count", "last_message_at", "created_at")
    list_filter = ("created_at", "last_message_at")
    search_fields = ("participants__username", "participants__email")
    filter_horizontal = ("participants",)
    readonly_fields = ("created_at", "updated_at", "last_message_at")
    inlines = (MessageInline,)

    @admin.display(description="Participants")
    def participants_display(self, obj):
        return ", ".join(u.username for u in obj.participants.all())

    @admin.display(description="Messages")
    def message_count(self, obj):
        return obj.messages.count()


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "sender", "short_body", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("sender__username", "body")
    autocomplete_fields = ("conversation", "sender")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"

    @admin.display(description="Body")
    def short_body(self, obj):
        return (obj.body[:60] + "…") if len(obj.body) > 60 else obj.body