"""
URL routing for the categories app.

Mounted under /api/ by config/urls.py so the final paths are:
    /api/categories/
    /api/categories/<slug>/
    /api/skills/
    /api/skills/<slug>/
"""

from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, SkillViewSet

app_name = "categories"

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"skills", SkillViewSet, basename="skill")

urlpatterns = router.urls