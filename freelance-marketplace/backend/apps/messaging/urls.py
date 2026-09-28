"""
URL routing for the messaging app.

Final paths:
    /api/conversations/
    /api/conversations/<id>/
    /api/conversations/<id>/messages/
    /api/conversations/<id>/read/
"""

from rest_framework.routers import DefaultRouter

from .views import ConversationViewSet

app_name = "messaging"

router = DefaultRouter()
router.register(r"conversations", ConversationViewSet, basename="conversation")

urlpatterns = router.urls