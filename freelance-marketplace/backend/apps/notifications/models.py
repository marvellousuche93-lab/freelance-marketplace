"""
Models for the notifications app.

A Notification is a small, user-facing message about an event in the
marketplace: a new application, an acceptance, a new message, etc.
"""

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """A single notification for a single user."""

    class Type(models.TextChoices):
        NEW_APPLICATION = "NEW_APPLICATION", "New application"
        APPLICATION_ACCEPTED = "APPLICATION_ACCEPTED", "Application accepted"
        APPLICATION_REJECTED = "APPLICATION_REJECTED", "Application rejected"
        APPLICATION_WITHDRAWN = "APPLICATION_WITHDRAWN", "Application withdrawn"
        JOB_STATUS_CHANGED = "JOB_STATUS_CHANGED", "Job status changed"
        NEW_MESSAGE = "NEW_MESSAGE", "New message"
        NEW_REVIEW = "NEW_REVIEW", "New review"
        SYSTEM = "SYSTEM", "System"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notif_type = models.CharField(
        max_length=32,
        choices=Type.choices,
        default=Type.SYSTEM,
    )
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)

    # Optional generic reference to a related object.
    related_object_type = models.CharField(max_length=40, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        indexes = [
            models.Index(fields=["user", "is_read", "-created_at"]),
        ]

    def __str__(self) -> str:
        return f"[{self.notif_type}] → {self.user.username}: {self.title}"