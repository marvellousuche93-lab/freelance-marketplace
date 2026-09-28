"""
Serializers for the categories app.
"""

from rest_framework import serializers

from .models import Category, Skill


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "icon",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = (
            "id",
            "name",
            "slug",
            "is_active",
            "created_at",
        )
        read_only_fields = ("id", "slug", "created_at")