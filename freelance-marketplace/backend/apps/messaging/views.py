"""
API views for the messaging app.
"""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.services import notify

from .models import Conversation, Message
from .permissions import IsConversationParticipant
from .serializers import (
    ConversationCreateSerializer,
    ConversationDetailSerializer,
    ConversationListSerializer,
    MessageCreateSerializer,
    MessageSerializer,
)


@extend_schema_view(
    list=extend_schema(
        tags=["messaging"],
        summary="List my conversations",
        description="Sorted by most recent message activity.",
    ),
    retrieve=extend_schema(tags=["messaging"], summary="Retrieve a conversation"),
    create=extend_schema(
        tags=["messaging"],
        summary="Start or retrieve a conversation",
        description=(
            "Provide `user_id` of the other participant. Idempotent: if a "
            "1-to-1 conversation with that user already exists, returns it. "
            "Always responds 200 (never 201) to make retries safe."
        ),
    ),
)
class ConversationViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated, IsConversationParticipant]

    def get_queryset(self):
        return (
            Conversation.objects.filter(participants=self.request.user)
            .prefetch_related("participants")
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == "create":
            return ConversationCreateSerializer
        if self.action == "retrieve":
            return ConversationDetailSerializer
        return ConversationListSerializer

    def create(self, request, *args, **kwargs):
        write = ConversationCreateSerializer(
            data=request.data, context={"request": request}
        )
        write.is_valid(raise_exception=True)
        conv = write.save()
        return Response(
            ConversationDetailSerializer(conv, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        tags=["messaging"],
        summary="List or send messages in a conversation",
        description=(
            "**GET** — chronological messages (oldest first). "
            "**POST** — send a new message (participants only)."
        ),
    )
    @action(detail=True, methods=["get", "post"], url_path="messages")
    def messages(self, request, pk=None):
        conversation = self.get_object()

        if request.method == "GET":
            qs = conversation.messages.select_related("sender").order_by("created_at")
            page = self.paginate_queryset(qs)
            if page is not None:
                serializer = MessageSerializer(page, many=True, context={"request": request})
                return self.get_paginated_response(serializer.data)
            return Response(
                MessageSerializer(qs, many=True, context={"request": request}).data
            )

        write = MessageCreateSerializer(
            data=request.data,
            context={"request": request, "conversation": conversation},
        )
        write.is_valid(raise_exception=True)
        message = write.save()

        conversation.last_message_at = message.created_at
        conversation.save(update_fields=["last_message_at", "updated_at"])

        for participant in conversation.participants.exclude(pk=request.user.pk):
            notify(
                user=participant,
                notif_type=Notification.Type.NEW_MESSAGE,
                title="New message",
                message=f"{request.user.username}: {message.body[:80]}",
                related_object=conversation,
            )

        return Response(
            MessageSerializer(message, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        tags=["messaging"],
        summary="Mark conversation as read",
        description="Marks all incoming (not sent by me) messages as read.",
    )
    @action(detail=True, methods=["post"], url_path="read")
    def read(self, request, pk=None):
        conversation = self.get_object()
        updated = (
            conversation.messages.filter(is_read=False)
            .exclude(sender=request.user)
            .update(is_read=True)
        )
        return Response({"marked_read": updated}, status=status.HTTP_200_OK)