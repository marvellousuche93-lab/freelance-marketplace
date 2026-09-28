"""
API views for the categories app.

Uses DRF ViewSets with a router (see urls.py) so that we get:
    GET    /api/categories/           list
    POST   /api/categories/           create  (staff only)
    GET    /api/categories/<slug>/    detail
    PATCH  /api/categories/<slug>/    update  (staff only)
    DELETE /api/categories/<slug>/    destroy (staff only)
and the same shape for skills.
"""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets

from .models import Category, Skill
from .permissions import IsAdminOrReadOnly
from .serializers import CategorySerializer, SkillSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["categories"],
        summary="List categories",
        description=(
            "Returns all active categories. Staff users may also see "
            "inactive ones by filtering with `?is_active=false`."
        ),
    ),
    retrieve=extend_schema(
        tags=["categories"],
        summary="Retrieve category by slug",
    ),
    create=extend_schema(
        tags=["categories"],
        summary="Create category (staff only)",
    ),
    update=extend_schema(
        tags=["categories"],
        summary="Update category (staff only)",
    ),
    partial_update=extend_schema(
        tags=["categories"],
        summary="Partially update category (staff only)",
    ),
    destroy=extend_schema(
        tags=["categories"],
        summary="Delete category (staff only)",
    ),
)
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
    filterset_fields = ["is_active"]

    def get_queryset(self):
        qs = Category.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs


@extend_schema_view(
    list=extend_schema(
        tags=["skills"],
        summary="List skills",
        description="Returns all active skills. Supports `?search=react`.",
    ),
    retrieve=extend_schema(
        tags=["skills"],
        summary="Retrieve skill by slug",
    ),
    create=extend_schema(
        tags=["skills"],
        summary="Create skill (staff only)",
    ),
    update=extend_schema(
        tags=["skills"],
        summary="Update skill (staff only)",
    ),
    partial_update=extend_schema(
        tags=["skills"],
        summary="Partially update skill (staff only)",
    ),
    destroy=extend_schema(
        tags=["skills"],
        summary="Delete skill (staff only)",
    ),
)
class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
    filterset_fields = ["is_active"]

    def get_queryset(self):
        qs = Skill.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs