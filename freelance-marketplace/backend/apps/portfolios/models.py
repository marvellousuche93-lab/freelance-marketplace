"""
Models for the portfolios app.

A PortfolioProject is a single piece of a freelancer's work.
Each project can have many PortfolioImage records (a gallery)
and can be tagged with many Skills.
"""

from django.conf import settings
from django.db import models
from django.utils.text import slugify


class PortfolioProject(models.Model):
    """
    A single project in a freelancer's portfolio.
    """

    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="portfolio_projects",
        limit_choices_to={"role": "FREELANCER"},
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()

    featured_image = models.ImageField(
        upload_to="portfolios/covers/",
        blank=True,
        null=True,
    )

    skills = models.ManyToManyField(
        "categories.Skill",
        related_name="portfolio_projects",
        blank=True,
    )

    project_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    is_featured = models.BooleanField(
        default=False,
        help_text="Pinned to the top of the freelancer's portfolio.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]
        verbose_name = "Portfolio Project"
        verbose_name_plural = "Portfolio Projects"
        indexes = [
            models.Index(fields=["freelancer", "-created_at"]),
            models.Index(fields=["freelancer", "-is_featured", "-created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200] or "project"
            slug = base
            counter = 1
            while (
                PortfolioProject.objects.filter(slug=slug)
                .exclude(pk=self.pk)
                .exists()
            ):
                counter += 1
                slug = f"{base}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.freelancer.username} — {self.title}"


class PortfolioImage(models.Model):
    """
    An additional image in a portfolio project's gallery.
    """

    project = models.ForeignKey(
        PortfolioProject,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="portfolios/gallery/")
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(
        default=0,
        help_text="Lower numbers appear first.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "created_at"]
        verbose_name = "Portfolio Image"
        verbose_name_plural = "Portfolio Images"

    def __str__(self) -> str:
        return f"Image for {self.project.title}"