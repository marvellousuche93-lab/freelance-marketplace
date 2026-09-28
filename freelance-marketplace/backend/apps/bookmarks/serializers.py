"""
Serializers for the bookmarks app.
"""

from rest_framework import serializers

from apps.jobs.models import Job
from apps.jobs.serializers import JobListSerializer

from .models import Bookmark


class BookmarkSerializer(serializers.ModelSerializer):
    """Read serializer: nested job, so a bookmark list is a job list."""

    job = JobListSerializer(read_only=True)

    class Meta:
        model = Bookmark
        fields = ("id", "job", "created_at")
        read_only_fields = fields


class BookmarkWriteSerializer(serializers.ModelSerializer):
    """
    Write serializer for creating a bookmark.
    The view sets user=request.user.
    """

    job = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(status=Job.Status.OPEN)
    )

    class Meta:
        model = Bookmark
        fields = ("job",)

    def validate_job(self, job):
        user = self.context["request"].user
        if Bookmark.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError("You have already bookmarked this job.")
        return job

    def create(self, validated_data):
        user = self.context["request"].user
        return Bookmark.objects.create(user=user, **validated_data)