"""
URL routing for the jobs app.

Mounted under /api/ by config/urls.py so the final paths are:
    /api/jobs/
    /api/jobs/<slug>/
    /api/jobs/my/
"""

from rest_framework.routers import DefaultRouter

from .views import JobViewSet

app_name = "jobs"

router = DefaultRouter()
router.register(r"jobs", JobViewSet, basename="job")

urlpatterns = router.urls