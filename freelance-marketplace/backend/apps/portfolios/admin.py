from django.contrib import admin
from django.utils.html import format_html

from .models import PortfolioImage, PortfolioProject


class PortfolioImageInline(admin.TabularInline):
    model = PortfolioImage
    extra = 1
    fields = ("image", "caption", "order")


@admin.register(PortfolioProject)
class PortfolioProjectAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "freelancer",
        "is_featured",
        "skill_count",
        "image_count",
        "created_at",
    )
    list_filter = ("is_featured", "skills", "created_at")
    search_fields = ("title", "description", "freelancer__username")
    autocomplete_fields = ("freelancer", "skills")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at", "cover_preview")
    inlines = (PortfolioImageInline,)
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Core",
            {"fields": ("freelancer", "title", "slug", "description")},
        ),
        (
            "Media",
            {"fields": ("featured_image", "cover_preview")},
        ),
        (
            "Skills & Links",
            {"fields": ("skills", "project_url", "github_url")},
        ),
        (
            "Timeline",
            {"fields": ("start_date", "end_date", "is_featured")},
        ),
        (
            "Meta",
            {"fields": ("created_at", "updated_at")},
        ),
    )

    @admin.display(description="Skills")
    def skill_count(self, obj):
        return obj.skills.count()

    @admin.display(description="Images")
    def image_count(self, obj):
        return obj.images.count()

    @admin.display(description="Cover preview")
    def cover_preview(self, obj):
        if not obj.featured_image:
            return "—"
        return format_html(
            '<img src="{}" style="max-height: 120px; border-radius: 6px;" />',
            obj.featured_image.url,
        )


@admin.register(PortfolioImage)
class PortfolioImageAdmin(admin.ModelAdmin):
    list_display = ("id", "project", "caption", "order", "created_at")
    list_filter = ("created_at",)
    search_fields = ("project__title", "caption")
    autocomplete_fields = ("project",)
    readonly_fields = ("created_at",)