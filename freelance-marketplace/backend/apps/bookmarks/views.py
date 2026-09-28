"""
API views for the bookmarks app.
"""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Bookmark
from .serializers import BookmarkSerializer, BookmarkWriteSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["bookmarks"],
        summary="List my bookmarks",
    ),
    retrieve=extend_schema(
        tags=["bookmarks"],
        summary="Retrieve a bookmark",
    ),
    create=extend_schema(
        tags=["bookmarks"],
        summary="Bookmark a job",
        description="Only OPEN jobs can be bookmarked. Duplicates are rejected.",
    ),
    destroy=extend_schema(
        tags=["bookmarks"],
        summary="Remove a bookmark",
    ),
)
class BookmarkViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Bookmark.objects.filter(user=self.request.user)
            .select_related("job", "job__employer", "job__category")
            .prefetch_related("job__skills", "job__employer__employer_profile")
        )

    def get_serializer_class(self):
        if self.action == "create":
            return BookmarkWriteSerializer
        return BookmarkSerializer

    def create(self, request, *args, **kwargs):
        write = BookmarkWriteSerializer(data=request.data, context={"request": request})
        write.is_valid(raise_exception=True)
        bookmark = write.save()
        return Response(
            BookmarkSerializer(bookmark, context={"request": request}).data,
            status=201,
        )

    @extend_schema(
        tags=["bookmarks"],
        summary="Check if a job is bookmarked",
        description="Returns `{ bookmarked: bool, bookmark_id: int|null }`.",
    )
    @action(detail=False, methods=["get"])
    def check(self, request):
        job_id = request.query_params.get("job")
        if not job_id:
            return Response(
                {"detail": "Query parameter 'job' is required."},
                status=400,
            )
        bookmark = Bookmark.objects.filter(user=request.user, job_id=job_id).first()
        return Response(
            {
                "bookmarked": bookmark is not None,
                "bookmark_id": bookmark.id if bookmark else None,
            }
        )