"""
Models for the accounts app.

Contains:
    User                 - custom user with a role
    FreelancerProfile    - 1-to-1 with a freelancer user
    EmployerProfile      - 1-to-1 with an employer user
    EmailChangeRequest   - pending email change with a token
"""

import secrets

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Avg
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model for the Freelance Marketplace.
    """

    class Role(models.TextChoices):
        FREELANCER = "FREELANCER", "Freelancer"
        EMPLOYER = "EMPLOYER", "Employer"
        ADMIN = "ADMIN", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.FREELANCER,
        help_text="Determines which dashboard and permissions the user has.",
    )

    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(
        upload_to="profiles/pictures/",
        blank=True,
        null=True,
    )
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=120, blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    website = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self) -> str:
        return self.username

    @property
    def is_freelancer(self) -> bool:
        return self.role == self.Role.FREELANCER

    @property
    def is_employer(self) -> bool:
        return self.role == self.Role.EMPLOYER

    @property
    def review_count(self) -> int:
        return self.reviews_received.count()

    @property
    def average_rating(self):
        result = self.reviews_received.aggregate(avg=Avg("rating"))
        return round(result["avg"], 1) if result["avg"] is not None else None


class FreelancerProfile(models.Model):
    """
    Role-specific data for users whose role is FREELANCER.
    """

    class Availability(models.TextChoices):
        FULL_TIME = "FULL_TIME", "Full time"
        PART_TIME = "PART_TIME", "Part time"
        NOT_AVAILABLE = "NOT_AVAILABLE", "Not available"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="freelancer_profile",
        primary_key=True,
    )
    professional_title = models.CharField(max_length=150, blank=True)
    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Hourly rate in your preferred currency.",
    )
    availability = models.CharField(
        max_length=20,
        choices=Availability.choices,
        default=Availability.FULL_TIME,
    )
    experience_years = models.PositiveIntegerField(default=0)
    education = models.TextField(blank=True)
    languages = models.CharField(
        max_length=255,
        blank=True,
        help_text="Comma-separated list of languages.",
    )
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Freelancer Profile"
        verbose_name_plural = "Freelancer Profiles"
        ordering = ["-is_featured", "-created_at"]

    def __str__(self) -> str:
        return f"Freelancer profile: {self.user.username}"


class EmployerProfile(models.Model):
    """
    Role-specific data for users whose role is EMPLOYER.
    """

    class CompanySize(models.TextChoices):
        SOLO = "SOLO", "1 (solo)"
        SMALL = "SMALL", "2-10"
        MEDIUM = "MEDIUM", "11-50"
        LARGE = "LARGE", "51-200"
        ENTERPRISE = "ENTERPRISE", "200+"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employer_profile",
        primary_key=True,
    )
    company_name = models.CharField(max_length=150)
    company_logo = models.ImageField(
        upload_to="employers/logos/",
        blank=True,
        null=True,
    )
    company_description = models.TextField(blank=True)
    industry = models.CharField(max_length=120, blank=True)
    company_size = models.CharField(
        max_length=20,
        choices=CompanySize.choices,
        default=CompanySize.SMALL,
    )
    company_website = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Employer Profile"
        verbose_name_plural = "Employer Profiles"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Employer profile: {self.company_name}"


class EmailChangeRequest(models.Model):
    """
    A pending request to change a user's email address.

    When a user asks to change their email, we create one of these with
    the new email and a random token. We email a link containing the
    token to the NEW address. When the link is clicked, we verify the
    token, update `user.email`, and delete this row.

    We never change `user.email` until the link is clicked, which
    prevents someone from claiming an email they don't own.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_change_requests",
    )
    new_email = models.EmailField()
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Email Change Request"
        verbose_name_plural = "Email Change Requests"

    def __str__(self) -> str:
        return f"{self.user.username} → {self.new_email}"

    @property
    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

    @classmethod
    def create_for(cls, user, new_email, lifetime_hours):
        """Create a fresh request, invalidating any prior pending ones."""
        # Invalidate previous requests for this user to keep only one active.
        cls.objects.filter(user=user).delete()
        return cls.objects.create(
            user=user,
            new_email=new_email,
            token=secrets.token_urlsafe(32)[:64],
            expires_at=timezone.now() + timezone.timedelta(hours=lifetime_hours),
        )


# ------------------------------------------------------------------
# Signals: auto-create profiles
# ------------------------------------------------------------------

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def ensure_profile_for_user(sender, instance, created, **kwargs):
    if instance.is_freelancer:
        FreelancerProfile.objects.get_or_create(user=instance)
    elif instance.is_employer:
        EmployerProfile.objects.get_or_create(
            user=instance,
            defaults={"company_name": instance.username},
        )