# """
# Production settings.

# DEBUG is off, the database is PostgreSQL, HTTPS is enforced, and all
# the security flags are on. Only used when DJANGO_ENV=prod.
# """

# from decouple import Csv, config
# from dj_database_url import parse as db_url

# from .settings_base import *  # noqa: F401,F403

# DEBUG = False

# ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv())

# # ------------------------------------------------------------------
# # Database — PostgreSQL via DATABASE_URL
# # ------------------------------------------------------------------
# # Example value:
# #   DATABASE_URL=postgres://user:password@host:5432/dbname
# DATABASES = {
#     "default": db_url(config("DATABASE_URL")),
# }

# # ------------------------------------------------------------------
# # CORS — same origin in production (React served by Django), so no
# # cross-origin allowances are needed. If you serve the frontend from a
# # different domain, list it here.
# # ------------------------------------------------------------------
# CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())
# CORS_ALLOW_CREDENTIALS = False

# # ------------------------------------------------------------------
# # Static files — WhiteNoise serves them in prod
# # ------------------------------------------------------------------
# STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# # ------------------------------------------------------------------
# # HTTPS / cookies / HSTS
# # ------------------------------------------------------------------
# SECURE_SSL_REDIRECT = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
# SECURE_HSTS_SECONDS = 31536000  # 1 year
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True
# SECURE_CONTENT_TYPE_NOSNIFF = True
# SECURE_BROWSER_XSS_FILTER = True
# X_FRAME_OPTIONS = "DENY"

# # Trust the reverse proxy's X-Forwarded-Proto header.
# SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")