from django.contrib import admin

from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "job",
        "freelancer",
        "status",
        "proposed_price",
        "created_at",
        "decided_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "job__title",
        "freelancer__username",
        "freelancer__email",
        "cover_letter",
    )
    autocomplete_fields = ("job", "freelancer")
    readonly_fields = ("created_at", "updated_at", "decided_at")
    date_hierarchy = "created_at"