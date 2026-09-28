from django.contrib import admin
from django.utils.html import format_html

from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "employer",
        "category",
        "status",
        "budget_type",
        "budget_display",
        "deadline",
        "created_at",
    )
    list_filter = ("status", "budget_type", "experience_level", "remote_status", "category")
    search_fields = ("title", "description", "employer__username", "employer__email")
    autocomplete_fields = ("employer", "category", "skills")
    readonly_fields = ("slug", "created_at", "updated_at")
    date_hierarchy = "created_at"
    filter_horizontal = ("skills",)

    fieldsets = (
        (
            "Core",
            {
                "fields": (
                    "employer",
                    "title",
                    "slug",
                    "description",
                    "category",
                    "skills",
                )
            },
        ),
        (
            "Compensation",
            {"fields": ("budget_type", "min_budget", "max_budget")},
        ),
        (
            "Requirements",
            {"fields": ("experience_level", "location", "remote_status")},
        ),
        (
            "Lifecycle",
            {"fields": ("status", "deadline")},
        ),
        (
            "Meta",
            {"fields": ("created_at", "updated_at")},
        ),
    )

    @admin.display(description="Budget")
    def budget_display(self, obj):
        if obj.min_budget is None:
            return "—"
        if obj.budget_type == Job.JobType.FIXED_PRICE:
            return f"${obj.min_budget}"
        return f"${obj.min_budget}–${obj.max_budget}/hr"