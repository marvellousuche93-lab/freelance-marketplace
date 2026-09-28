# """
# Development settings.

# DEBUG is on, everything is permissive, the database is SQLite. This is
# what `python manage.py runserver` uses by default.
# """

# from decouple import Csv, config

# from .settings_base import *  # noqa: F401,F403

# DEBUG = True

# ALLOWED_HOSTS = config(
#     "ALLOWED_HOSTS",
#     default="127.0.0.1,localhost",
#     cast=Csv(),
# )

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
#     }
# }

# # The React dev server runs on a different origin during development.
# CORS_ALLOWED_ORIGINS = config(
#     "CORS_ALLOWED_ORIGINS",
#     default="http://localhost:5173,http://127.0.0.1:5173",
#     cast=Csv(),
# )

# CORS_ALLOW_CREDENTIALS = False