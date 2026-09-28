"""
Serializers for the reviews app.
"""

from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer
from apps.applications.models import Application
from apps.jobs.models import Job

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Read shape for reviews."""

    reviewer = PublicUserSerializer(read_only=True)
    reviewee = PublicUserSerializer(read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    job_slug = serializers.CharField(source="job.slug", read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "reviewer",
            "reviewee",
            "job",
            "job_title",
            "job_slug",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class ReviewWriteSerializer(serializers.ModelSerializer):
    """
    Write shape. The reviewer is set by the view. The reviewee is
    derived from the job + reviewer role: if the reviewer is the
    employer, the reviewee is the accepted freelancer; if the reviewer
    is the freelancer, the reviewee is the employer.
    """

    job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all())

    class Meta:
        model = Review
        fields = ("job", "rating", "comment")

    def validate(self, attrs):
        request = self.context["request"]
        reviewer = request.user
        job = attrs["job"]

        # Rule 1: job must be completed.
        if job.status != Job.Status.COMPLETED:
            raise serializers.ValidationError(
                {"job": "You can only review a completed job."}
            )

        # Rule 2: reviewer must be a party to the job.
        is_employer_party = job.employer_id == reviewer.id
        accepted_app = (
            Application.objects.filter(
                job=job,
                freelancer=reviewer,
                status=Application.Status.ACCEPTED,
            ).first()
        )
        is_freelancer_party = accepted_app is not None

        if not (is_employer_party or is_freelancer_party):
            raise serializers.ValidationError(
                {"job": "You were not a party to this job."}
            )

        # Rule 3: derive the reviewee.
        if is_employer_party:
            # Find the accepted freelancer on this job.
            counterpart = (
                Application.objects.filter(
                    job=job, status=Application.Status.ACCEPTED
                )
                .select_related("freelancer")
                .first()
            )
            if counterpart is None:
                raise serializers.ValidationError(
                    {"job": "This job has no accepted freelancer to review."}
                )
            reviewee = counterpart.freelancer
        else:
            reviewee = job.employer

        # Rule 4: no self-reviews (defensive).
        if reviewee.id == reviewer.id:
            raise serializers.ValidationError(
                {"reviewee": "You cannot review yourself."}
            )

        # Rule 5: no duplicates for the same (reviewer, reviewee, job).
        if Review.objects.filter(
            reviewer=reviewer, reviewee=reviewee, job=job
        ).exists():
            raise serializers.ValidationError(
                {"job": "You have already reviewed this user for this job."}
            )

        # Stash the derived reviewee for create().
        attrs["reviewee"] = reviewee
        return attrs

    def create(self, validated_data):
        reviewer = self.context["request"].user
        return Review.objects.create(reviewer=reviewer, **validated_data)