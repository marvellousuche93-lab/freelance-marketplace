"""
Serializers for the applications app.
"""

from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer
from apps.jobs.models import Job
from apps.jobs.serializers import JobListSerializer

from .models import Application


class ApplicationListSerializer(serializers.ModelSerializer):
    """Compact representation for list views."""

    job_title = serializers.CharField(source="job.title", read_only=True)
    job_slug = serializers.CharField(source="job.slug", read_only=True)
    freelancer_username = serializers.CharField(
        source="freelancer.username", read_only=True
    )

    class Meta:
        model = Application
        fields = (
            "id",
            "job",
            "job_title",
            "job_slug",
            "freelancer",
            "freelancer_username",
            "proposed_price",
            "estimated_duration",
            "status",
            "created_at",
            "updated_at",
            "decided_at",
        )
        read_only_fields = fields


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Full representation, with nested job and freelancer summaries."""

    job = JobListSerializer(read_only=True)
    freelancer = PublicUserSerializer(read_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "job",
            "freelancer",
            "cover_letter",
            "proposed_price",
            "estimated_duration",
            "status",
            "created_at",
            "updated_at",
            "decided_at",
        )
        read_only_fields = fields


class ApplicationWriteSerializer(serializers.ModelSerializer):
    """
    Freelancer creates an application.
    The view sets freelancer=request.user.
    """

    class Meta:
        model = Application
        fields = (
            "job",
            "cover_letter",
            "proposed_price",
            "estimated_duration",
        )

    def validate_job(self, job):
        user = self.context["request"].user

        # Rule 1: Only freelancers can apply.
        if not getattr(user, "is_freelancer", False):
            raise serializers.ValidationError("Only freelancers can apply to jobs.")

        # Rule 2: Cannot apply to own job (defensive; employers can't be freelancers).
        if job.employer_id == user.id:
            raise serializers.ValidationError("You cannot apply to your own job.")

        # Rule 3: Only OPEN jobs accept applications.
        if job.status != Job.Status.OPEN:
            raise serializers.ValidationError("This job is not accepting applications.")

        # Rule 4: Cannot apply twice.
        if Application.objects.filter(job=job, freelancer=user).exists():
            raise serializers.ValidationError("You have already applied to this job.")

        return job

    def validate_cover_letter(self, value):
        value = (value or "").strip()
        if len(value) < 20:
            raise serializers.ValidationError(
                "Cover letter must be at least 20 characters."
            )
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        return Application.objects.create(freelancer=user, **validated_data)