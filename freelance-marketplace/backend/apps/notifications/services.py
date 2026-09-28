"""
Service functions for the notifications app.

Other apps call notify(...) to create a notification. Keeping a single
entry point makes it trivial to change behavior later (e.g., send email,
push, or batch-delete old notifications).
"""

from typing import Optional

from django.db import models

from .models import Notification


def notify(
    *,
    user,
    notif_type: str,
    title: str,
    message: str = "",
    related_object: Optional[models.Model] = None,
) -> Notification:
    """
    Create a Notification for `user`.

    Parameters
    ----------
    user : User instance
        The recipient.
    notif_type : str
        One of Notification.Type values.
    title : str
        Short headline (max 200 chars).
    message : str
        Optional longer body.
    related_object : Model, optional
        If provided, we store its class name (lowercased) and pk so the
        frontend can build a deep link.
    """
    related_type = ""
    related_id = None
    if related_object is not None:
        related_type = related_object.__class__.__name__.lower()
        related_id = related_object.pk

    return Notification.objects.create(
        user=user,
        notif_type=notif_type,
        title=title,
        message=message,
        related_object_type=related_type,
        related_object_id=related_id,
    )