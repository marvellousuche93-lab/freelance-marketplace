"""
URL routing for the applications app.

Final paths:
    /api/applications/
    /api/applications/<id>/
    /api/applications/my/
    /api/applications/received/
    /api/applications/<id>/accept/
    /api/applications/<id>/reject/
    /api/applications/<id>/withdraw/
"""

from rest_framework.routers import DefaultRouter

from .views import ApplicationViewSet

app_name = "applications"

router = DefaultRouter()
router.register(r"applications", ApplicationViewSet, basename="application")

urlpatterns = router.urls