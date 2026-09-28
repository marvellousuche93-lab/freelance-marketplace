"""
Tests for job applications.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.applications.models import Application
from apps.categories.models import Category
from apps.jobs.models import Job

User = get_user_model()


class ApplicationTestBase(APITestCase):
    def setUp(self):
        self.employer = User.objects.create_user(
            username="acme",
            email="acme@example.com",
            password="StrongPass123!",
            role="EMPLOYER",
        )
        self.freelancer = User.objects.create_user(
            username="jane",
            email="jane@example.com",
            password="StrongPass123!",
            role="FREELANCER",
        )
        self.other_freelancer = User.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="StrongPass123!",
            role="FREELANCER",
        )
        self.category = Category.objects.create(name="Web Development")

        self.open_job = Job.objects.create(
            employer=self.employer,
            title="Open job",
            description="x",
            category=self.category,
            status=Job.Status.OPEN,
            budget_type=Job.JobType.FIXED_PRICE,
            min_budget="500.00",
            max_budget="500.00",
        )
        self.draft_job = Job.objects.create(
            employer=self.employer,
            title="Draft job",
            description="x",
            category=self.category,
            status=Job.Status.DRAFT,
        )


class ApplicationCreateTests(ApplicationTestBase):
    def _payload(self, job_id=None):
        return {
            "job": job_id or self.open_job.id,
            "cover_letter": "I have four years of Django experience and can deliver this.",
            "proposed_price": "500.00",
        }

    def test_freelancer_can_apply_to_open_job(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.post("/api/applications/", self._payload(), format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["status"], "PENDING")

    def test_anonymous_cannot_apply(self):
        resp = self.client.post("/api/applications/", self._payload(), format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_employer_cannot_apply(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.post("/api/applications/", self._payload(), format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_apply_twice(self):
        self.client.force_authenticate(user=self.freelancer)
        self.client.post("/api/applications/", self._payload(), format="json")
        resp = self.client.post("/api/applications/", self._payload(), format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Application.objects.count(), 1)

    def test_cannot_apply_to_draft_job(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.post(
            "/api/applications/", self._payload(self.draft_job.id), format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_short_cover_letter_rejected(self):
        self.client.force_authenticate(user=self.freelancer)
        payload = {**self._payload(), "cover_letter": "hi"}
        resp = self.client.post("/api/applications/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class ApplicationDecisionTests(ApplicationTestBase):
    def setUp(self):
        super().setUp()
        self.application = Application.objects.create(
            job=self.open_job,
            freelancer=self.freelancer,
            cover_letter="I can do this job, with significant detail about my approach.",
            proposed_price="500.00",
        )

    def test_freelancer_cannot_accept_own_application(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.post(f"/api/applications/{self.application.id}/accept/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_employer_accepts(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.post(f"/api/applications/{self.application.id}/accept/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, "ACCEPTED")
        # Job should flip to IN_PROGRESS
        self.open_job.refresh_from_db()
        self.assertEqual(self.open_job.status, "IN_PROGRESS")

    def test_cannot_accept_after_rejection(self):
        self.client.force_authenticate(user=self.employer)
        self.client.post(f"/api/applications/{self.application.id}/reject/")
        resp = self.client.post(f"/api/applications/{self.application.id}/accept/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_freelancer_can_withdraw_pending(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.post(f"/api/applications/{self.application.id}/withdraw/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, "WITHDRAWN")

    def test_other_freelancer_cannot_withdraw(self):
        # Cross-user access is hidden behind a 404, not a 403. This is
        # intentional: the queryset for a freelancer only contains their
        # own applications, so another user's application "does not exist"
        # from their perspective. Returning 403 would leak its existence.
        self.client.force_authenticate(user=self.other_freelancer)
        resp = self.client.post(f"/api/applications/{self.application.id}/withdraw/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


class ApplicationListScopingTests(ApplicationTestBase):
    def setUp(self):
        super().setUp()
        self.app_jane = Application.objects.create(
            job=self.open_job,
            freelancer=self.freelancer,
            cover_letter="Jane applies to this open job with enough detail here.",
            proposed_price="500.00",
        )

    def test_freelancer_sees_only_own(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.get("/api/applications/")
        ids = [a["id"] for a in resp.data["results"]]
        self.assertIn(self.app_jane.id, ids)

    def test_other_freelancer_sees_none(self):
        self.client.force_authenticate(user=self.other_freelancer)
        resp = self.client.get("/api/applications/")
        self.assertEqual(resp.data["count"], 0)

    def test_employer_sees_received(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.get("/api/applications/received/")
        self.assertEqual(resp.data["count"], 1)

    def test_freelancer_cannot_call_received(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.get("/api/applications/received/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_employer_cannot_call_my(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.get("/api/applications/my/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)