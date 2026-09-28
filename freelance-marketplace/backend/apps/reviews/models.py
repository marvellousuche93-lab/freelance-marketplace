"""
Models for the reviews app.

A Review records one party's opinion of the other after a job is
completed. Rating is 1..5. A user cannot review themselves, cannot
review the same person twice for the same job, and can only review
counterparts of a completed job.
"""

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    """A rating + comment from one user about another, tied to a job."""

    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_written",
    )
    reviewee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_received",
    )
    job = models.ForeignKey(
        "jobs.Job",
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1 (poor) to 5 (excellent).",
    )
    comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        constraints = [
            models.UniqueConstraint(
                fields=["reviewer", "reviewee", "job"],
                name="unique_review_per_user_job",
            ),
            # Disallow self-reviews at the DB level too.
            models.CheckConstraint(
                check=~models.Q(reviewer=models.F("reviewee")),
                name="no_self_review",
            ),
        ]
        indexes = [
            models.Index(fields=["reviewee", "-created_at"]),
            models.Index(fields=["job"]),
        ]

    def __str__(self) -> str:
        return f"{self.reviewer.username} → {self.reviewee.username} ({self.rating}/5) on {self.job.title}"