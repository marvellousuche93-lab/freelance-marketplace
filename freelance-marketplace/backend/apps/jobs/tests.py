"""
Tests for jobs: creation permissions, validation, visibility, search.
"""

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.categories.models import Category, Skill
from apps.jobs.models import Job

User = get_user_model()


class JobTestBase(APITestCase):
    def setUp(self):
        self.employer = User.objects.create_user(
            username="acme",
            email="acme@example.com",
            password="StrongPass123!",
            role="EMPLOYER",
        )
        self.other_employer = User.objects.create_user(
            username="globex",
            email="globex@example.com",
            password="StrongPass123!",
            role="EMPLOYER",
        )
        self.freelancer = User.objects.create_user(
            username="jane",
            email="jane@example.com",
            password="StrongPass123!",
            role="FREELANCER",
        )
        self.category = Category.objects.create(name="Web Development")
        self.skill = Skill.objects.create(name="Django")

        self.valid_payload = {
            "title": "Build a Django API",
            "description": "We need a DRF API with JWT auth.",
            "category": self.category.id,
            "skills": [self.skill.id],
            "budget_type": "FIXED_PRICE",
            "min_budget": "800.00",
            "max_budget": "800.00",
            "experience_level": "INTERMEDIATE",
            "location": "Remote",
            "remote_status": "REMOTE",
            "status": "OPEN",
        }


class JobCreationTests(JobTestBase):
    def test_employer_can_create_open_job(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.post("/api/jobs/", self.valid_payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["status"], "OPEN")
        self.assertEqual(resp.data["employer"]["username"], "acme")
        self.assertEqual(Job.objects.count(), 1)

    def test_anonymous_cannot_create(self):
        resp = self.client.post("/api/jobs/", self.valid_payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_freelancer_cannot_create(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.post("/api/jobs/", self.valid_payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_open_job_requires_budget(self):
        self.client.force_authenticate(user=self.employer)
        payload = {**self.valid_payload}
        del payload["min_budget"]
        del payload["max_budget"]
        resp = self.client.post("/api/jobs/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fixed_price_min_must_equal_max(self):
        self.client.force_authenticate(user=self.employer)
        payload = {**self.valid_payload, "min_budget": "100.00", "max_budget": "200.00"}
        resp = self.client.post("/api/jobs/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_min_cannot_exceed_max(self):
        self.client.force_authenticate(user=self.employer)
        payload = {
            **self.valid_payload,
            "budget_type": "HOURLY",
            "min_budget": "200.00",
            "max_budget": "100.00",
        }
        resp = self.client.post("/api/jobs/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class JobVisibilityTests(JobTestBase):
    def setUp(self):
        super().setUp()
        self.open_job = Job.objects.create(
            employer=self.employer,
            title="Open job",
            description="x",
            category=self.category,
            status=Job.Status.OPEN,
            budget_type=Job.JobType.FIXED_PRICE,
            min_budget="100.00",
            max_budget="100.00",
        )
        self.draft_job = Job.objects.create(
            employer=self.employer,
            title="Draft job",
            description="x",
            category=self.category,
            status=Job.Status.DRAFT,
        )

    def test_anonymous_only_sees_open_jobs(self):
        resp = self.client.get("/api/jobs/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        titles = [j["title"] for j in resp.data["results"]]
        self.assertIn("Open job", titles)
        self.assertNotIn("Draft job", titles)

    def test_freelancer_only_sees_open_jobs(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.get("/api/jobs/")
        titles = [j["title"] for j in resp.data["results"]]
        self.assertNotIn("Draft job", titles)

    def test_employer_sees_own_drafts(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.get("/api/jobs/my/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        titles = [j["title"] for j in resp.data["results"]]
        self.assertIn("Draft job", titles)

    def test_other_employer_cannot_edit_foreign_job(self):
        self.client.force_authenticate(user=self.other_employer)
        resp = self.client.patch(
            f"/api/jobs/{self.open_job.slug}/", {"title": "hacked"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_edit_job(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.patch(
            f"/api/jobs/{self.open_job.slug}/", {"title": "Updated"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.open_job.refresh_from_db()
        self.assertEqual(self.open_job.title, "Updated")


class JobSearchFilterTests(JobTestBase):
    def setUp(self):
        super().setUp()
        for i in range(3):
            Job.objects.create(
                employer=self.employer,
                title=f"Django job {i}",
                description="Django description",
                category=self.category,
                status=Job.Status.OPEN,
                budget_type=Job.JobType.FIXED_PRICE,
                min_budget=f"{100 + i}.00",
                max_budget=f"{100 + i}.00",
                experience_level=Job.ExperienceLevel.INTERMEDIATE,
                remote_status=Job.RemoteStatus.REMOTE,
            )

    def test_search_filters_by_keyword(self):
        resp = self.client.get("/api/jobs/?search=django")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["count"], 3)

    def test_search_no_matches(self):
        resp = self.client.get("/api/jobs/?search=gibberishxyz")
        self.assertEqual(resp.data["count"], 0)

    def test_filter_by_category_slug(self):
        resp = self.client.get("/api/jobs/?category__slug=web-development")
        self.assertEqual(resp.data["count"], 3)

    def test_ordering_by_min_budget(self):
        resp = self.client.get("/api/jobs/?ordering=-min_budget")
        mins = [float(j["min_budget"]) for j in resp.data["results"]]
        self.assertEqual(mins, sorted(mins, reverse=True))