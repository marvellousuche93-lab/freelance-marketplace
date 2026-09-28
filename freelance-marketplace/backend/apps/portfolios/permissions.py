"""
Custom DRF permissions for the portfolios app.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsFreelancerOrReadOnly(BasePermission):
    """Anyone can read; only freelancers can write."""

    message = "Only freelancers can manage portfolio projects."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "is_freelancer", False)
        )


class IsPortfolioOwnerOrReadOnly(BasePermission):
    """Object-level: only the freelancer who owns the project can write."""

    message = "You can only modify your own portfolio projects."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and obj.freelancer_id == request.user.id


class IsPortfolioImageOwnerOrReadOnly(BasePermission):
    """Object-level for images: only the freelancer who owns the parent project."""

    message = "You can only modify images on your own portfolio projects."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return (
            request.user.is_authenticated
            and obj.project.freelancer_id == request.user.id
        )