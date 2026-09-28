"""
Management command: seed_if_empty

Like `seed_categories`, but only writes when the Category or Skill tables
are empty. Safe to run automatically before every test run — if the data
already exists, it does nothing.

Usage:
    python manage.py seed_if_empty
"""

from django.core.management.base import BaseCommand

from apps.categories.models import Category, Skill

from .seed_categories import DEFAULT_CATEGORIES, DEFAULT_SKILLS


class Command(BaseCommand):
    help = "Seed default Categories and Skills if the tables are empty."

    def handle(self, *args, **options):
        cat_count = Category.objects.count()
        skill_count = Skill.objects.count()

        if cat_count > 0 and skill_count > 0:
            self.stdout.write(
                f"Categories ({cat_count}) and Skills ({skill_count}) already present. "
                f"Nothing to do."
            )
            return

        created_cats = 0
        for name, description, icon in DEFAULT_CATEGORIES:
            _, created = Category.objects.get_or_create(
                name=name,
                defaults={"description": description, "icon": icon},
            )
            if created:
                created_cats += 1

        created_skills = 0
        for name in DEFAULT_SKILLS:
            _, created = Skill.objects.get_or_create(name=name)
            if created:
                created_skills += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {created_cats} new categories "
                f"({Category.objects.count()} total) and "
                f"{created_skills} new skills "
                f"({Skill.objects.count()} total)."
            )
        )