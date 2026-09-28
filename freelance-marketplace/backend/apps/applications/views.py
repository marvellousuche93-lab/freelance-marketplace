"""
API views for the applications app.
"""

from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.jobs.models import Job
from apps.notifications.models import Notification
from apps.notifications.services import notify

from .models import Application
from .permissions import IsApplicationEmployer, IsApplicationFreelancer
from .serializers import (
    ApplicationDetailSerializer,
    ApplicationListSerializer,
    ApplicationWriteSerializer,
)


@extend_schema_view(
    list=extend_schema(
        tags=["applications"],
        summary="List applications",
        description=(
            "Freelancers see their own applications. Employers see "
            "applications on their own jobs. Others see nothing."
        ),
    ),
    retrieve=extend_schema(
        tags=["applications"],
        summary="Retrieve an application",
    ),
    create=extend_schema(
        tags=["applications"],
        summary="Apply to a job (freelancer only)",
        description=(
            "Creates an application. Rules: only freelancers, only OPEN jobs, "
            "cannot apply twice to the same job, cover letter ≥ 20 chars."
        ),
    ),
)
class ApplicationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationWriteSerializer
        if self.action == "retrieve":
            return ApplicationDetailSerializer
        return ApplicationListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = (
            Application.objects.select_related(
                "job", "freelancer", "job__employer", "job__category"
            )
            .prefetch_related("job__skills", "freelancer__freelancer_profile")
        )
        if getattr(user, "is_freelancer", False):
            return qs.filter(freelancer=user)
        if getattr(user, "is_employer", False):
            return qs.filter(job__employer=user)
        return qs.none()

    def create(self, request, *args, **kwargs):
        write = ApplicationWriteSerializer(
            data=request.data, context={"request": request}
        )
        write.is_valid(raise_exception=True)
        app_obj = write.save()

        notify(
            user=app_obj.job.employer,
            notif_type=Notification.Type.NEW_APPLICATION,
            title="New application received",
            message=f"{app_obj.freelancer.username} applied to '{app_obj.job.title}'.",
            related_object=app_obj,
        )

        return Response(
            ApplicationDetailSerializer(app_obj, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        tags=["applications"],
        summary="My applications (freelancer)",
    )
    @action(detail=False, methods=["get"])
    def my(self, request):
        if not request.user.is_freelancer:
            return Response(
                {"detail": "Only freelancers have applications."},
                status=status.HTTP_403_FORBIDDEN,
            )
        qs = self.get_queryset().order_by("-created_at")
        return self._paginated_response(qs)

    @extend_schema(
        tags=["applications"],
        summary="Applications received (employer)",
    )
    @action(detail=False, methods=["get"])
    def received(self, request):
        if not request.user.is_employer:
            return Response(
                {"detail": "Only employers receive applications."},
                status=status.HTTP_403_FORBIDDEN,
            )
        qs = self.get_queryset().order_by("-created_at")
        return self._paginated_response(qs)

    @extend_schema(
        tags=["applications"],
        summary="Accept an application (job owner)",
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsApplicationEmployer],
    )
    def accept(self, request, pk=None):
        application = self.get_object()
        if not application.can_be_decided:
            return Response(
                {"detail": f"Cannot accept an application with status {application.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        application.status = Application.Status.ACCEPTED
        application.decided_at = timezone.now()
        application.save(update_fields=["status", "decided_at", "updated_at"])

        job = application.job
        if job.status == Job.Status.OPEN:
            job.status = Job.Status.IN_PROGRESS
            job.save(update_fields=["status", "updated_at"])

        notify(
            user=application.freelancer,
            notif_type=Notification.Type.APPLICATION_ACCEPTED,
            title="Your application was accepted",
            message=f"Your application to '{job.title}' has been accepted.",
            related_object=application,
        )

        return Response(
            ApplicationDetailSerializer(application, context={"request": request}).data
        )

    @extend_schema(
        tags=["applications"],
        summary="Reject an application (job owner)",
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsApplicationEmployer],
    )
    def reject(self, request, pk=None):
        application = self.get_object()
        if not application.can_be_decided:
            return Response(
                {"detail": f"Cannot reject an application with status {application.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        application.status = Application.Status.REJECTED
        application.decided_at = timezone.now()
        application.save(update_fields=["status", "decided_at", "updated_at"])

        notify(
            user=application.freelancer,
            notif_type=Notification.Type.APPLICATION_REJECTED,
            title="Your application was rejected",
            message=f"Your application to '{application.job.title}' was not selected.",
            related_object=application,
        )

        return Response(
            ApplicationDetailSerializer(application, context={"request": request}).data
        )

    @extend_schema(
        tags=["applications"],
        summary="Withdraw an application (applicant)",
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsApplicationFreelancer],
    )
    def withdraw(self, request, pk=None):
        application = self.get_object()
        if not application.can_be_withdrawn:
            return Response(
                {"detail": f"Cannot withdraw an application with status {application.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        application.status = Application.Status.WITHDRAWN
        application.decided_at = timezone.now()
        application.save(update_fields=["status", "decided_at", "updated_at"])

        notify(
            user=application.job.employer,
            notif_type=Notification.Type.APPLICATION_WITHDRAWN,
            title="An application was withdrawn",
            message=f"{application.freelancer.username} withdrew their application for '{application.job.title}'.",
            related_object=application,
        )

        return Response(
            ApplicationDetailSerializer(application, context={"request": request}).data
        )

    def _paginated_response(self, qs):
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = ApplicationListSerializer(
                page, many=True, context={"request": self.request}
            )
            return self.get_paginated_response(serializer.data)
        return Response(
            ApplicationListSerializer(
                qs, many=True, context={"request": self.request}
            ).data
        )