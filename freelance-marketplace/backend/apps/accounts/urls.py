"""
URL routes for the accounts app, mounted under /api/auth/.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangeEmailConfirmView,
    ChangeEmailView,
    ChangePasswordView,
    EmployerDetailView,
    EmployerListView,
    FreelancerDetailView,
    FreelancerListView,
    LoginView,
    MeEmployerProfileView,
    MeFreelancerProfileView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
)

app_name = "accounts"

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),

    # Change email
    path(
        "change-email/",
        ChangeEmailView.as_view(),
        name="change-email",
    ),
    path(
        "change-email/confirm/",
        ChangeEmailConfirmView.as_view(),
        name="change-email-confirm",
    ),

    # Change password
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),

    # Password reset
    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password-reset",
    ),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),

    # Role profiles (self)
    path(
        "me/freelancer-profile/",
        MeFreelancerProfileView.as_view(),
        name="me-freelancer-profile",
    ),
    path(
        "me/employer-profile/",
        MeEmployerProfileView.as_view(),
        name="me-employer-profile",
    ),

    # Public listings
    path("freelancers/", FreelancerListView.as_view(), name="freelancer-list"),
    path("freelancers/<int:pk>/", FreelancerDetailView.as_view(), name="freelancer-detail"),
    path("employers/", EmployerListView.as_view(), name="employer-list"),
    path("employers/<int:pk>/", EmployerDetailView.as_view(), name="employer-detail"),
]