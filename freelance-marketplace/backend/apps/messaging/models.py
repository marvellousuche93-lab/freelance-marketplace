"""
Models for the messaging app.

A Conversation is a container for messages between two users.
Messages belong to a conversation, have a sender, and are marked
read or unread.
"""

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    """
    A 1-to-1 conversation between two users.

    participants is a M2M to User. For 1-to-1 conversations it holds
    exactly two users; the model is capable of more for future group
    chats, but the API enforces exactly 2 for now.
    """

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="conversations",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Updated whenever a message is sent. Used for sorting.",
    )

    class Meta:
        ordering = ["-last_message_at", "-created_at"]
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"
        indexes = [
            models.Index(fields=["-last_message_at"]),
        ]

    def __str__(self) -> str:
        names = ", ".join(u.username for u in self.participants.all())
        return f"Conversation({self.pk}): {names}"

    def other_participant(self, user):
        """Return the other user (for 1-to-1 conversations)."""
        return self.participants.exclude(pk=user.pk).first()


class Message(models.Model):
    """A single message in a conversation."""

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        indexes = [
            models.Index(fields=["conversation", "created_at"]),
            models.Index(fields=["conversation", "is_read"]),
        ]

    def __str__(self) -> str:
        return f"#{self.pk} from {self.sender.username} in conv {self.conversation_id}"