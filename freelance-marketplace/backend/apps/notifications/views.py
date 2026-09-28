"""
API views for the notifications app.
"""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["notifications"],
        summary="List my notifications",
        description=(
            "Newest first. **Filters:** `?is_read=true|false`, "
            "`?notif_type=NEW_MESSAGE|NEW_APPLICATION|...`."
        ),
    ),
    retrieve=extend_schema(tags=["notifications"], summary="Retrieve a notification"),
    destroy=extend_schema(tags=["notifications"], summary="Dismiss a notification"),
)
class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["is_read", "notif_type"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @extend_schema(
        tags=["notifications"],
        summary="Unread count",
        description="Cheap endpoint for the navbar badge.",
    )
    @action(detail=False, methods=["get"], url_path="unread_count")
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["notifications"],
        summary="Mark one notification as read",
    )
    @action(detail=True, methods=["post"], url_path="read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])
        return Response(
            NotificationSerializer(notification, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        tags=["notifications"],
        summary="Mark all notifications as read",
    )
    @action(detail=False, methods=["post"], url_path="read_all")
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"marked_read": updated}, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["notifications"],
        summary="Delete all read notifications",
    )
    @action(detail=False, methods=["delete"], url_path="clear")
    def clear_read(self, request):
        deleted, _ = self.get_queryset().filter(is_read=True).delete()
        return Response({"deleted": deleted}, status=status.HTTP_200_OK)