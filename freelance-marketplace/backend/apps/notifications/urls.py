"""
URL routing for the notifications app.

Final paths:
    /api/notifications/
    /api/notifications/<id>/
    /api/notifications/unread_count/
    /api/notifications/<id>/read/
    /api/notifications/read_all/
    /api/notifications/clear/
"""

from rest_framework.routers import DefaultRouter

from .views import NotificationViewSet

app_name = "notifications"

router = DefaultRouter()
router.register(r"notifications", NotificationViewSet, basename="notification")

urlpatterns = router.urls