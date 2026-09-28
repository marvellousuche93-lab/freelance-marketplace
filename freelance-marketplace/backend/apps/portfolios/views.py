"""
API views for the portfolios app.
"""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PortfolioImage, PortfolioProject
from .permissions import (
    IsFreelancerOrReadOnly,
    IsPortfolioImageOwnerOrReadOnly,
    IsPortfolioOwnerOrReadOnly,
)
from .serializers import (
    PortfolioImageSerializer,
    PortfolioProjectDetailSerializer,
    PortfolioProjectListSerializer,
    PortfolioProjectWriteSerializer,
)


@extend_schema_view(
    list=extend_schema(
        tags=["portfolios"],
        summary="List portfolio projects",
        description=(
            "Public list. **Search:** `?search=`. "
            "**Filters:** `?skills__slug=`, `?freelancer__username=`. "
            "**Ordering:** `?ordering=-is_featured|-created_at|start_date`."
        ),
    ),
    retrieve=extend_schema(tags=["portfolios"], summary="Retrieve portfolio by slug"),
    create=extend_schema(
        tags=["portfolios"],
        summary="Create portfolio project (freelancer only)",
        description="Multipart form-data; accepts `featured_image` and multiple `skills` IDs.",
    ),
    update=extend_schema(tags=["portfolios"], summary="Update portfolio project (owner only)"),
    partial_update=extend_schema(tags=["portfolios"], summary="Partially update portfolio project (owner only)"),
    destroy=extend_schema(tags=["portfolios"], summary="Delete portfolio project (owner only)"),
)
class PortfolioProjectViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    permission_classes = [IsFreelancerOrReadOnly, IsPortfolioOwnerOrReadOnly]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "start_date", "is_featured"]
    ordering = ["-is_featured", "-created_at"]
    filterset_fields = ["skills__slug", "freelancer__username"]

    def get_queryset(self):
        return (
            PortfolioProject.objects.select_related("freelancer")
            .prefetch_related(
                "skills",
                "images",
                "freelancer__freelancer_profile",
            )
        )

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return PortfolioProjectWriteSerializer
        if self.action == "retrieve":
            return PortfolioProjectDetailSerializer
        return PortfolioProjectListSerializer

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    def create(self, request, *args, **kwargs):
        write = self.get_serializer(data=request.data)
        write.is_valid(raise_exception=True)
        project = write.save(freelancer=request.user)
        return Response(
            PortfolioProjectDetailSerializer(
                project, context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        write = PortfolioProjectWriteSerializer(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        write.is_valid(raise_exception=True)
        write.save()
        return Response(
            PortfolioProjectDetailSerializer(
                instance, context={"request": request}
            ).data
        )

    @extend_schema(
        tags=["portfolios"],
        summary="My portfolio projects (freelancer)",
    )
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my(self, request):
        if not request.user.is_freelancer:
            return Response(
                {"detail": "Only freelancers have portfolio projects."},
                status=status.HTTP_403_FORBIDDEN,
            )
        qs = self.get_queryset().filter(freelancer=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = PortfolioProjectListSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)
        return Response(
            PortfolioProjectListSerializer(
                qs, many=True, context={"request": request}
            ).data
        )


@extend_schema_view(
    list=extend_schema(tags=["portfolios"], summary="List gallery images for a project"),
    create=extend_schema(
        tags=["portfolios"],
        summary="Add a gallery image (owner only)",
        description="Multipart form-data; `image` is required.",
    ),
    destroy=extend_schema(tags=["portfolios"], summary="Delete gallery image (owner only)"),
)
class PortfolioImageViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = PortfolioImageSerializer
    permission_classes = [
        IsAuthenticated,
        IsPortfolioImageOwnerOrReadOnly,
    ]

    def _get_project(self):
        project_slug = self.kwargs["project_slug"]
        return PortfolioProject.objects.filter(slug=project_slug).first()

    def get_queryset(self):
        project = self._get_project()
        if project is None:
            return PortfolioImage.objects.none()
        return PortfolioImage.objects.filter(project=project).order_by(
            "order", "created_at"
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["project"] = self._get_project()
        return ctx

    def create(self, request, *args, **kwargs):
        project = self._get_project()
        if project is None:
            return Response(
                {"detail": "Portfolio project not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if project.freelancer_id != request.user.id:
            return Response(
                {"detail": "You can only add images to your own projects."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(project=project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)