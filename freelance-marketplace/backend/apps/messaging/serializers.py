"""
Serializers for the messaging app.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Conversation, Message

User = get_user_model()


class ParticipantSerializer(serializers.ModelSerializer):
    """Minimal user shape for displaying participants."""

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "role", "profile_picture")


class MessageSerializer(serializers.ModelSerializer):
    sender = ParticipantSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ("id", "conversation", "sender", "body", "is_read", "created_at")
        read_only_fields = ("id", "conversation", "sender", "is_read", "created_at")


class ConversationListSerializer(serializers.ModelSerializer):
    """Compact shape for the conversation list screen."""

    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            "id",
            "other_participant",
            "last_message",
            "unread_count",
            "last_message_at",
            "created_at",
        )

    def get_other_participant(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        other = obj.other_participant(request.user)
        return ParticipantSerializer(other, context=self.context).data if other else None

    def get_last_message(self, obj):
        last = obj.messages.select_related("sender").order_by("-created_at").first()
        return MessageSerializer(last, context=self.context).data if last else None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request:
            return 0
        return (
            obj.messages.filter(is_read=False)
            .exclude(sender=request.user)
            .count()
        )


class ConversationDetailSerializer(ConversationListSerializer):
    """Detail shape — same as list plus explicit participants list."""

    participants = ParticipantSerializer(many=True, read_only=True)

    class Meta(ConversationListSerializer.Meta):
        fields = ConversationListSerializer.Meta.fields + ("participants",)


class MessageCreateSerializer(serializers.ModelSerializer):
    """Write shape for sending a message."""

    class Meta:
        model = Message
        fields = ("body",)

    def validate_body(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Message body cannot be empty.")
        if len(value) > 5000:
            raise serializers.ValidationError(
                "Message is too long (max 5000 characters)."
            )
        return value

    def create(self, validated_data):
        # sender and conversation are injected by the view.
        return Message.objects.create(
            sender=self.context["request"].user,
            conversation=self.context["conversation"],
            **validated_data,
        )


class ConversationCreateSerializer(serializers.Serializer):
    """
    Input for starting a conversation. Accepts `user_id` — the other
    participant. Idempotent: if a 1-to-1 conversation between the two
    users already exists, returns it instead of creating a new one.
    """

    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        request = self.context["request"]
        if value == request.user.id:
            raise serializers.ValidationError(
                "You cannot start a conversation with yourself."
            )
        if not User.objects.filter(pk=value).exists():
            raise serializers.ValidationError("User not found.")
        return value

    def _find_existing(self):
        """
        Find an existing conversation containing exactly these two users.

        This implementation iterates over the current user's conversations
        and checks participants in Python. It avoids the subtle M2M
        double-join semantics that make the SQL-only version fragile.
        """
        request = self.context["request"]
        other_id = self.validated_data["user_id"]

        candidates = Conversation.objects.filter(participants=request.user)
        for conv in candidates:
            ids = set(conv.participants.values_list("id", flat=True))
            if ids == {request.user.id, other_id}:
                return conv
        return None

    def create(self, validated_data):
        request = self.context["request"]
        other_id = validated_data["user_id"]

        existing = self._find_existing()
        if existing:
            return existing

        conv = Conversation.objects.create()
        conv.participants.add(request.user, other_id)
        return conv