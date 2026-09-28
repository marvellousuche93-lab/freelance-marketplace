"""
URL routing for the reviews app.

Final paths:
    /api/reviews/
    /api/reviews/<id>/
    /api/users/<id>/reviews/
    /api/users/<id>/rating/
"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ReviewViewSet, UserReviewsListView, user_rating_view

app_name = "reviews"

router = DefaultRouter()
router.register(r"reviews", ReviewViewSet, basename="review")

urlpatterns = router.urls + [
    path(
        "users/<int:user_id>/reviews/",
        UserReviewsListView.as_view(),
        name="user-reviews",
    ),
    path(
        "users/<int:user_id>/rating/",
        user_rating_view,
        name="user-rating",
    ),
]