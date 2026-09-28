"""
Serializers for the jobs app.
"""

from rest_framework import serializers

from apps.categories.models import Category, Skill
from apps.categories.serializers import CategorySerializer, SkillSerializer
from apps.accounts.serializers import PublicUserSerializer

from .models import Job


class JobListSerializer(serializers.ModelSerializer):
    """
    Compact representation for list endpoints.
    Enough to render a job card without extra queries.
    """

    category = CategorySerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    employer = PublicUserSerializer(read_only=True)

    class Meta:
        model = Job
        fields = (
            "id",
            "title",
            "slug",
            "category",
            "skills",
            "employer",
            "budget_type",
            "min_budget",
            "max_budget",
            "experience_level",
            "location",
            "remote_status",
            "status",
            "deadline",
            "created_at",
        )


class JobDetailSerializer(JobListSerializer):
    """
    Full representation for the detail endpoint.
    Adds description and updated_at on top of the list serializer.
    """

    class Meta(JobListSerializer.Meta):
        fields = JobListSerializer.Meta.fields + (
            "description",
            "updated_at",
        )


class JobWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating jobs.
    Accepts category by id and skills as a list of ids.
    """

    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True)
    )
    skills = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.filter(is_active=True),
        many=True,
        required=False,
    )

    class Meta:
        model = Job
        fields = (
            "id",
            "title",
            "description",
            "category",
            "skills",
            "budget_type",
            "min_budget",
            "max_budget",
            "experience_level",
            "location",
            "remote_status",
            "deadline",
            "status",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        """
        Cross-field validation:
        - min <= max
        - if either budget is set, both must be set
        - fixed price jobs must have min == max
        - OPEN jobs require budgets and a category (category is required by field)
        """
        min_b = attrs.get("min_budget", getattr(self.instance, "min_budget", None))
        max_b = attrs.get("max_budget", getattr(self.instance, "max_budget", None))
        budget_type = attrs.get(
            "budget_type", getattr(self.instance, "budget_type", None)
        )
        status = attrs.get("status", getattr(self.instance, "status", None))

        if (min_b is None) != (max_b is None):
            raise serializers.ValidationError(
                {"budget": "Provide both min and max budget, or neither."}
            )

        if min_b is not None and max_b is not None and min_b > max_b:
            raise serializers.ValidationError(
                {"budget": "Minimum budget cannot exceed maximum budget."}
            )

        if budget_type == Job.JobType.FIXED_PRICE and min_b is not None and max_b is not None:
            if min_b != max_b:
                raise serializers.ValidationError(
                    {"budget": "For fixed-price jobs, min and max budget must be equal."}
                )

        if status == Job.Status.OPEN:
            if min_b is None or max_b is None:
                raise serializers.ValidationError(
                    {"budget": "An open job must have a budget."}
                )

        return attrs

    def create(self, validated_data):
        skills = validated_data.pop("skills", [])
        job = Job.objects.create(**validated_data)
        if skills:
            job.skills.set(skills)
        return job

    def update(self, instance, validated_data):
        skills = validated_data.pop("skills", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if skills is not None:
            instance.skills.set(skills)
        return instance