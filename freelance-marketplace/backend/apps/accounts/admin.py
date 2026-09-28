from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import EmployerProfile, FreelancerProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin view for our custom User model."""

    list_display = (
        "username",
        "email",
        "role",
        "is_staff",
        "is_active",
        "created_at",
    )
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-created_at",)

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Marketplace",
            {
                "fields": (
                    "role",
                    "profile_picture",
                    "bio",
                    "location",
                    "phone_number",
                    "website",
                )
            },
        ),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            "Marketplace",
            {
                "fields": (
                    "email",
                    "role",
                    "bio",
                    "location",
                )
            },
        ),
    )


@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "professional_title",
        "hourly_rate",
        "availability",
        "experience_years",
        "is_featured",
        "updated_at",
    )
    list_filter = ("availability", "is_featured")
    search_fields = ("user__username", "user__email", "professional_title")
    autocomplete_fields = ("user",)


@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "company_name",
        "user",
        "industry",
        "company_size",
        "contact_email",
        "updated_at",
    )
    list_filter = ("company_size", "industry")
    search_fields = ("company_name", "user__username", "user__email")
    autocomplete_fields = ("user",)