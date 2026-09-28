"""
Custom DRF permissions for the jobs app.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsEmployerOrReadOnly(BasePermission):
    """
    Anyone (including anonymous) can GET/HEAD/OPTIONS.
    Only authenticated users with role EMPLOYER can write.
    """

    message = "Only employers can create or modify jobs."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "is_employer", False))


class IsJobOwnerOrReadOnly(BasePermission):
    """
    Object-level permission: only the employer who created the job
    can edit or delete it. Everyone can read.
    """

    message = "You can only modify your own jobs."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and obj.employer_id == request.user.id