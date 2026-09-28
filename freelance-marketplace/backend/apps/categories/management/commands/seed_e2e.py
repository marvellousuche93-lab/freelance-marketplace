"""
Management command: seed_e2e

Runs a light bootstrap for E2E tests:
    1. Applies any pending migrations.
    2. Seeds categories and skills if empty.

This is safe to run on every E2E start. It is idempotent.

Usage:
    python manage.py seed_e2e
"""

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Prepare the database for E2E test runs (idempotent)."

    def handle(self, *args, **options):
        self.stdout.write("Applying migrations…")
        call_command("migrate", verbosity=0)

        self.stdout.write("Seeding categories and skills if empty…")
        call_command("seed_if_empty")

        self.stdout.write(self.style.SUCCESS("E2E bootstrap complete."))