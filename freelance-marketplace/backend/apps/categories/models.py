"""
Models for the categories app.

Contains two independent lookup tables:
    Category  - broad grouping for jobs (e.g., "Web Development")
    Skill     - specific capability (e.g., "Django", "React")

Both use slugs for clean URLs and are managed primarily via Django admin.
"""

from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """A broad grouping for jobs (e.g., Web Development, Design)."""

    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(
        max_length=80,
        blank=True,
        help_text="Optional icon name (e.g., from Lucide).",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:140]
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Skill(models.Model):
    """A specific capability (e.g., Python, React, SEO)."""

    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Skill"
        verbose_name_plural = "Skills"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:100]
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name