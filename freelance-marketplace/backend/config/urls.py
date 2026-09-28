"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
"""
Root URL configuration for the Freelance Marketplace backend.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


def welcome(request):
    """Tiny JSON endpoint used to verify the server is running."""
    return JsonResponse(
        {
            "message": "Freelance Marketplace API",
            "status": "ok",
            "version": "1.0.0",
            "endpoints": {
                "swagger": "/api/docs/",
                "redoc": "/api/redoc/",
                "schema": "/api/schema/",
                "admin": "/admin/",
            },
        }
    )


urlpatterns = [
    path("", welcome, name="welcome"),
    path("admin/", admin.site.urls),

    path("api/auth/", include("apps.accounts.urls")),
    path("api/", include("apps.categories.urls")),
    path("api/", include("apps.jobs.urls")),
    path("api/", include("apps.applications.urls")),
    path("api/", include("apps.bookmarks.urls")),
    path("api/", include("apps.portfolios.urls")),
    path("api/", include("apps.reviews.urls")),
    path("api/", include("apps.messaging.urls")),
    path("api/", include("apps.notifications.urls")),

    # --- OpenAPI schema and documentation UIs ---
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)