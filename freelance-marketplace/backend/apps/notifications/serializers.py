"""
Serializers for the notifications app.
"""

from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Read-only representation of a notification."""

    class Meta:
        model = Notification
        fields = (
            "id",
            "notif_type",
            "title",
            "message",
            "related_object_type",
            "related_object_id",
            "is_read",
            "created_at",
        )
        read_only_fields = fields