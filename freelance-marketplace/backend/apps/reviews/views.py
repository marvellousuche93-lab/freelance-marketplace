"""
API views for the reviews app.
"""

from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.services import notify

from .models import Review
from .serializers import ReviewSerializer, ReviewWriteSerializer

User = get_user_model()


@extend_schema_view(
    list=extend_schema(
        tags=["reviews"],
        summary="List reviews",
        description="Public list of reviews. Supports `?search=` and `?ordering=rating`.",
    ),
    retrieve=extend_schema(tags=["reviews"], summary="Retrieve a review"),
    create=extend_schema(
        tags=["reviews"],
        summary="Create a review",
        description=(
            "Only parties of a **COMPLETED** job can review each other. "
            "Reviewer is set by the server; reviewee is derived from the job."
        ),
    ),
)
class ReviewViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Review.objects.select_related("reviewer", "reviewee", "job")
        .order_by("-created_at")
    )
    search_fields = ["comment", "job__title", "reviewer__username", "reviewee__username"]
    ordering_fields = ["created_at", "rating"]
    ordering = ["-created_at"]
    filterset_fields = ["job", "reviewee", "reviewer", "rating"]

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action == "create":
            return ReviewWriteSerializer
        return ReviewSerializer

    def create(self, request, *args, **kwargs):
        write = ReviewWriteSerializer(data=request.data, context={"request": request})
        write.is_valid(raise_exception=True)
        review = write.save()

        notify(
            user=review.reviewee,
            notif_type=Notification.Type.NEW_REVIEW,
            title="You received a new review",
            message=f"{review.reviewer.username} rated you {review.rating}/5 for '{review.job.title}'.",
            related_object=review,
        )

        return Response(
            ReviewSerializer(review, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    tags=["reviews"],
    summary="List reviews received by a user",
)
class UserReviewsListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return (
            Review.objects.filter(reviewee_id=user_id)
            .select_related("reviewer", "reviewee", "job")
            .order_by("-created_at")
        )


@extend_schema(
    tags=["reviews"],
    summary="Aggregate rating for a user",
    description="Returns `{ user_id, average_rating, review_count }`.",
)
@api_view(["GET"])
@permission_classes([AllowAny])
def user_rating_view(request, user_id):
    if not User.objects.filter(pk=user_id).exists():
        return Response(
            {"detail": "User not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    agg = Review.objects.filter(reviewee_id=user_id).aggregate(
        avg=Avg("rating"), count=Count("id")
    )
    avg = round(agg["avg"], 1) if agg["avg"] is not None else None
    return Response(
        {
            "user_id": user_id,
            "average_rating": avg,
            "review_count": agg["count"],
        }
    )