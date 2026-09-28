"""
Serializers for the portfolios app.
"""

from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer
from apps.categories.models import Skill
from apps.categories.serializers import SkillSerializer

from .models import PortfolioImage, PortfolioProject


class PortfolioImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioImage
        fields = ("id", "image", "caption", "order", "created_at")
        read_only_fields = ("id", "created_at")


class PortfolioProjectListSerializer(serializers.ModelSerializer):
    """Compact shape for lists."""

    skills = SkillSerializer(many=True, read_only=True)
    freelancer = PublicUserSerializer(read_only=True)
    image_count = serializers.IntegerField(source="images.count", read_only=True)

    class Meta:
        model = PortfolioProject
        fields = (
            "id",
            "title",
            "slug",
            "featured_image",
            "skills",
            "freelancer",
            "is_featured",
            "start_date",
            "end_date",
            "image_count",
            "created_at",
        )


class PortfolioProjectDetailSerializer(PortfolioProjectListSerializer):
    """Full shape for the detail endpoint."""

    images = PortfolioImageSerializer(many=True, read_only=True)

    class Meta(PortfolioProjectListSerializer.Meta):
        fields = PortfolioProjectListSerializer.Meta.fields + (
            "description",
            "project_url",
            "github_url",
            "images",
            "updated_at",
        )


class PortfolioProjectWriteSerializer(serializers.ModelSerializer):
    """
    Write shape. Freelancer is set by the view; skills accepted as IDs.
    """

    skills = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.filter(is_active=True),
        many=True,
        required=False,
    )

    class Meta:
        model = PortfolioProject
        fields = (
            "id",
            "title",
            "description",
            "featured_image",
            "skills",
            "project_url",
            "github_url",
            "start_date",
            "end_date",
            "is_featured",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and end < start:
            raise serializers.ValidationError(
                {"end_date": "End date cannot be before start date."}
            )
        return attrs

    def create(self, validated_data):
        skills = validated_data.pop("skills", [])
        project = PortfolioProject.objects.create(**validated_data)
        if skills:
            project.skills.set(skills)
        return project

    def update(self, instance, validated_data):
        skills = validated_data.pop("skills", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if skills is not None:
            instance.skills.set(skills)
        return instance