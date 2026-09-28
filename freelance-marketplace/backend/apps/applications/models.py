"""
Models for the applications app.

An Application links a freelancer to a job with a cover letter and
proposed price. Only one application per (job, freelancer) pair is
allowed. Statuses track the employer's decision.
"""

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Application(models.Model):
    """A freelancer's application to a job."""

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    job = models.ForeignKey(
        "jobs.Job",
        on_delete=models.CASCADE,
        related_name="applications",
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
        limit_choices_to={"role": "FREELANCER"},
    )

    cover_letter = models.TextField()
    proposed_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    estimated_duration = models.CharField(
        max_length=120,
        blank=True,
        help_text="Free-form, e.g. '2 weeks', '1 month'.",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    # Timestamps for lifecycle events
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    decided_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the employer accepted or rejected (or the freelancer withdrew).",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Application"
        verbose_name_plural = "Applications"
        constraints = [
            models.UniqueConstraint(
                fields=["job", "freelancer"],
                name="unique_application_per_job_per_freelancer",
            ),
        ]
        indexes = [
            models.Index(fields=["job", "status"]),
            models.Index(fields=["freelancer", "status"]),
        ]

    def __str__(self) -> str:
        return f"{self.freelancer.username} → {self.job.title} [{self.status}]"

    # --- Helpers ---
    @property
    def is_pending(self) -> bool:
        return self.status == self.Status.PENDING

    @property
    def can_be_decided(self) -> bool:
        """Employer can only accept/reject a still-pending application."""
        return self.status == self.Status.PENDING

    @property
    def can_be_withdrawn(self) -> bool:
        """Freelancer can only withdraw a still-pending application."""
        return self.status == self.Status.PENDING