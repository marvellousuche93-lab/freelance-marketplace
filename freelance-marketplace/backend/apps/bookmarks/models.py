"""
Models for the bookmarks app.

A Bookmark simply records that a user is interested in a job.
The same user cannot bookmark the same job twice.
"""

from django.conf import settings
from django.db import models


class Bookmark(models.Model):
    """A user's saved job."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookmarks",
    )
    job = models.ForeignKey(
        "jobs.Job",
        on_delete=models.CASCADE,
        related_name="bookmarks",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Bookmark"
        verbose_name_plural = "Bookmarks"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "job"],
                name="unique_bookmark_per_user_per_job",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.user.username} ★ {self.job.title}"