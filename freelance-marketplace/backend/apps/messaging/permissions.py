"""
Custom DRF permissions for the messaging app.
"""

from rest_framework.permissions import BasePermission


class IsConversationParticipant(BasePermission):
    """
    Object-level: only participants may read or write a conversation.
    """

    message = "You are not a participant in this conversation."

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        return obj.participants.filter(pk=request.user.pk).exists()