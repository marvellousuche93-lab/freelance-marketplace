from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "reviewer",
        "reviewee",
        "job",
        "rating",
        "created_at",
    )
    list_filter = ("rating", "created_at")
    search_fields = (
        "reviewer__username",
        "reviewee__username",
        "job__title",
        "comment",
    )
    autocomplete_fields = ("reviewer", "reviewee", "job")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "created_at"