"""
Models for the jobs app.

Contains the Job model — the central entity that employers create
and freelancers browse, apply to, bookmark, and (later) review.
"""

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Job(models.Model):
    """
    A job posting created by an employer.
    """

    class JobType(models.TextChoices):
        FIXED_PRICE = "FIXED_PRICE", "Fixed Price"
        HOURLY = "HOURLY", "Hourly"

    class ExperienceLevel(models.TextChoices):
        BEGINNER = "BEGINNER", "Beginner"
        INTERMEDIATE = "INTERMEDIATE", "Intermediate"
        EXPERT = "EXPERT", "Expert"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        OPEN = "OPEN", "Open"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CLOSED = "CLOSED", "Closed"

    class RemoteStatus(models.TextChoices):
        ONSITE = "ONSITE", "On-site"
        REMOTE = "REMOTE", "Remote"
        HYBRID = "HYBRID", "Hybrid"

    # --- Ownership ---
    employer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="jobs",
        limit_choices_to={"role": "EMPLOYER"},
    )

    # --- Core content ---
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()

    # --- Taxonomy ---
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.PROTECT,
        related_name="jobs",
    )
    skills = models.ManyToManyField(
        "categories.Skill",
        related_name="jobs",
        blank=True,
    )

    # --- Compensation ---
    budget_type = models.CharField(
        max_length=20,
        choices=JobType.choices,
        default=JobType.FIXED_PRICE,
    )
    min_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    max_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    # --- Requirements ---
    experience_level = models.CharField(
        max_length=20,
        choices=ExperienceLevel.choices,
        default=ExperienceLevel.INTERMEDIATE,
    )

    # --- Location / remote ---
    location = models.CharField(max_length=150, blank=True)
    remote_status = models.CharField(
        max_length=20,
        choices=RemoteStatus.choices,
        default=RemoteStatus.REMOTE,
    )

    # --- Lifecycle ---
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    # --- Timestamps ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Job"
        verbose_name_plural = "Jobs"
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["employer", "-created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200] or "job"
            slug = base
            counter = 1
            # Ensure uniqueness
            while Job.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                counter += 1
                slug = f"{base}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title

    # --- Convenience properties ---
    @property
    def is_open(self) -> bool:
        return self.status == self.Status.OPEN

    @property
    def is_past_deadline(self) -> bool:
        return bool(self.deadline and self.deadline < timezone.now().date())