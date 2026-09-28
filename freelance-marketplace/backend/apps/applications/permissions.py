"""
Custom DRF permissions for the applications app.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsFreelancer(BasePermission):
    """Only authenticated users with role FREELANCER."""

    message = "Only freelancers can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_freelancer", False)
        )


class IsApplicationEmployer(BasePermission):
    """
    Object-level: only the employer who owns the job the application is for.
    """

    message = "Only the job owner can perform this action."

    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_authenticated
            and obj.job.employer_id == request.user.id
        )


class IsApplicationFreelancer(BasePermission):
    """
    Object-level: only the freelancer who submitted the application.
    """

    message = "Only the applicant can perform this action."

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and obj.freelancer_id == request.user.id