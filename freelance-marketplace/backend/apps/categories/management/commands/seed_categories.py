"""
Management command to seed default Categories and Skills.

Usage:
    python manage.py seed_categories

Idempotent: running it multiple times will not create duplicates.
"""

from django.core.management.base import BaseCommand

from apps.categories.models import Category, Skill


DEFAULT_CATEGORIES = [
    ("Web Development", "websites, web apps, and frontend/backend engineering", "code"),
    ("Mobile Development", "iOS, Android, Flutter, and React Native apps", "smartphone"),
    ("Software Development", "desktop, backend, systems, and general programming", "terminal"),
    ("Design", "UI/UX, product, brand, and graphic design", "palette"),
    ("Writing", "content, copywriting, editing, and technical writing", "pen-tool"),
    ("Marketing", "growth, paid ads, email, and brand strategy", "megaphone"),
    ("SEO", "search engine optimization and content strategy", "search"),
    ("Data", "data analysis, ML, AI, and data engineering", "bar-chart-3"),
    ("Cybersecurity", "security audits, pentesting, and compliance", "shield"),
    ("Business", "consulting, project management, and operations", "briefcase"),
    ("Video & Animation", "video editing, motion graphics, and 3D", "video"),
]


DEFAULT_SKILLS = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C#", "PHP", "Ruby",
    # Frontend
    "React", "Vue", "Angular", "Next.js", "Tailwind CSS", "HTML", "CSS",
    # Backend
    "Django", "Django REST Framework", "FastAPI", "Flask", "Node.js", "Express",
    # Mobile
    "Flutter", "React Native", "Swift", "Kotlin",
    # Data
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Pandas", "NumPy", "TensorFlow",
    # Design
    "Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX Design",
    # Marketing / content
    "SEO", "Content Writing", "Copywriting", "Digital Marketing", "Email Marketing",
    # Other
    "WordPress", "Graphic Design", "Cybersecurity", "Data Analysis", "DevOps", "Docker",
]


class Command(BaseCommand):
    help = "Seed default Categories and Skills (idempotent)."

    def handle(self, *args, **options):
        cat_created = 0
        for name, description, icon in DEFAULT_CATEGORIES:
            _, created = Category.objects.get_or_create(
                name=name,
                defaults={"description": description, "icon": icon},
            )
            if created:
                cat_created += 1

        skill_created = 0
        for name in DEFAULT_SKILLS:
            _, created = Skill.objects.get_or_create(name=name)
            if created:
                skill_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {cat_created} new categories "
                f"({Category.objects.count()} total) and "
                f"{skill_created} new skills "
                f"({Skill.objects.count()} total)."
            )
        )