from django.contrib import admin

from .models import Bookmark


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "job", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "user__email", "job__title")
    autocomplete_fields = ("user", "job")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"