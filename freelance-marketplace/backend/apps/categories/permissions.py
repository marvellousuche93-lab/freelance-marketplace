"""
Custom DRF permissions for the categories app.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrReadOnly(BasePermission):
    """
    Anyone can GET/HEAD/OPTIONS.
    Only staff users can POST/PUT/PATCH/DELETE.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)