from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "notif_type",
        "title",
        "is_read",
        "created_at",
    )
    list_filter = ("notif_type", "is_read", "created_at")
    search_fields = ("user__username", "user__email", "title", "message")
    autocomplete_fields = ("user",)
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"