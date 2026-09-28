"""
URL routing for the portfolios app.

Final paths:
    /api/portfolios/
    /api/portfolios/my/
    /api/portfolios/<slug>/
    /api/portfolios/<slug>/images/
    /api/portfolios/<slug>/images/<id>/
"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PortfolioImageViewSet, PortfolioProjectViewSet

app_name = "portfolios"

router = DefaultRouter()
router.register(r"portfolios", PortfolioProjectViewSet, basename="portfolio")

image_list = PortfolioImageViewSet.as_view({"get": "list", "post": "create"})
image_detail = PortfolioImageViewSet.as_view({"delete": "destroy"})

urlpatterns = router.urls + [
    path(
        "portfolios/<slug:project_slug>/images/",
        image_list,
        name="portfolio-images-list",
    ),
    path(
        "portfolios/<slug:project_slug>/images/<int:pk>/",
        image_detail,
        name="portfolio-images-detail",
    ),
]