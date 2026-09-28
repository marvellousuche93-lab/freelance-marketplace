"""
API views for the jobs app.
"""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Job
from .permissions import IsEmployerOrReadOnly, IsJobOwnerOrReadOnly
from .serializers import (
    JobDetailSerializer,
    JobListSerializer,
    JobWriteSerializer,
)


@extend_schema_view(
    list=extend_schema(
        tags=["jobs"],
        summary="List open jobs",
        description=(
            "Public list of **OPEN** jobs. Employers and admins see all "
            "jobs; anonymous users and freelancers only see `status=OPEN`.\n\n"
            "**Search:** `?search=<keyword>` matches title/description/location.\n"
            "**Filters:** `?category__slug=`, `?budget_type=`, "
            "`?experience_level=`, `?remote_status=`, `?status=`, `?location=`.\n"
            "**Ordering:** `?ordering=-created_at|deadline|min_budget|max_budget`."
        ),
    ),
    retrieve=extend_schema(
        tags=["jobs"],
        summary="Retrieve a job by slug",
    ),
    create=extend_schema(
        tags=["jobs"],
        summary="Create a job (employer only)",
        description=(
            "Creates a job owned by the authenticated employer. "
            "Response uses the full detail shape.\n\n"
            "Rules: fixed-price jobs must have `min_budget == max_budget`. "
            "`status=OPEN` requires a budget."
        ),
    ),
    update=extend_schema(
        tags=["jobs"],
        summary="Update a job (owner only)",
    ),
    partial_update=extend_schema(
        tags=["jobs"],
        summary="Partially update a job (owner only)",
    ),
    destroy=extend_schema(
        tags=["jobs"],
        summary="Delete a job (owner only)",
    ),
)
class JobViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    permission_classes = [IsEmployerOrReadOnly, IsJobOwnerOrReadOnly]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["created_at", "deadline", "min_budget", "max_budget"]
    ordering = ["-created_at"]
    filterset_fields = [
        "category__slug",
        "budget_type",
        "experience_level",
        "remote_status",
        "status",
        "location",
    ]

    def get_queryset(self):
        qs = (
            Job.objects.select_related("employer", "category")
            .prefetch_related(
                "skills",
                "employer__employer_profile",
                "employer__freelancer_profile",
            )
        )
        user = self.request.user
        if not (user.is_authenticated and user.is_employer):
            qs = qs.filter(status=Job.Status.OPEN)
        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return JobWriteSerializer
        if self.action == "retrieve":
            return JobDetailSerializer
        return JobListSerializer

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user)

    def create(self, request, *args, **kwargs):
        write = self.get_serializer(data=request.data)
        write.is_valid(raise_exception=True)
        job = write.save(employer=request.user)
        return Response(
            JobDetailSerializer(job, context={"request": request}).data,
            status=201,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        write = JobWriteSerializer(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        write.is_valid(raise_exception=True)
        write.save()
        return Response(
            JobDetailSerializer(instance, context={"request": request}).data
        )

    @extend_schema(
        tags=["jobs"],
        summary="List my jobs (employer)",
        description="All jobs belonging to the authenticated employer, any status.",
    )
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my(self, request):
        if not request.user.is_employer:
            return Response(
                {"detail": "Only employers have jobs."},
                status=403,
            )
        qs = (
            Job.objects.filter(employer=request.user)
            .select_related("category")
            .prefetch_related("skills")
            .order_by("-created_at")
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = JobListSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)
        return Response(JobListSerializer(qs, many=True, context={"request": request}).data)