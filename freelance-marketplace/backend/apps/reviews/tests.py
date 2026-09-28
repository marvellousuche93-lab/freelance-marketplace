"""
Tests for reviews.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.applications.models import Application
from apps.categories.models import Category
from apps.jobs.models import Job
from apps.reviews.models import Review

User = get_user_model()


class ReviewTestBase(APITestCase):
    def setUp(self):
        self.employer = User.objects.create_user(
            username="acme", email="acme@example.com", password="StrongPass123!", role="EMPLOYER"
        )
        self.freelancer = User.objects.create_user(
            username="jane", email="jane@example.com", password="StrongPass123!", role="FREELANCER"
        )
        self.other_freelancer = User.objects.create_user(
            username="bob", email="bob@example.com", password="StrongPass123!", role="FREELANCER"
        )
        self.category = Category.objects.create(name="Web Development")

        self.completed_job = Job.objects.create(
            employer=self.employer,
            title="Completed job",
            description="x",
            category=self.category,
            status=Job.Status.COMPLETED,
            budget_type=Job.JobType.FIXED_PRICE,
            min_budget="500.00",
            max_budget="500.00",
        )
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

        # Jane has an ACCEPTED application on the completed job.
        Application.objects.create(
            job=self.completed_job,
            freelancer=self.freelancer,
            cover_letter="I can do this job, with significant detail about my approach.",
            proposed_price="500.00",
            status=Application.Status.ACCEPTED,
        )


class ReviewCreateTests(ReviewTestBase):
    def test_employer_can_review_freelancer_on_completed_job(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.post(
            "/api/reviews/",
            {"job": self.completed_job.id, "rating": 5, "comment": "Excellent work"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["reviewer"]["username"], "acme")
        self.assertEqual(resp.data["reviewee"]["username"], "jane")

    def test_freelancer_can_review_employer_on_completed_job(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.post(
            "/api/reviews/",
            {"job": self.completed_job.id, "rating": 4, "comment": "Clear brief"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["reviewee"]["username"], "acme")

    def test_anonymous_cannot_review(self):
        resp = self.client.post(
            "/api/reviews/",
            {"job": self.completed_job.id, "rating": 5},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_review_open_job(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.post(
            "/api/reviews/",
            {"job": self.open_job.id, "rating": 5},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_review_twice(self):
        self.client.force_authenticate(user=self.employer)
        payload = {"job": self.completed_job.id, "rating": 5, "comment": "Good"}
        self.client.post("/api/reviews/", payload, format="json")
        resp = self.client.post("/api/reviews/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_party_cannot_review(self):
        self.client.force_authenticate(user=self.other_freelancer)
        resp = self.client.post(
            "/api/reviews/",
            {"job": self.completed_job.id, "rating": 5},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rating_above_5_rejected(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.post(
            "/api/reviews/",
            {"job": self.completed_job.id, "rating": 7},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rating_below_1_rejected(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.post(
            "/api/reviews/",
            {"job": self.completed_job.id, "rating": 0},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class ReviewAggregateTests(ReviewTestBase):
    def setUp(self):
        super().setUp()
        Review.objects.create(
            reviewer=self.employer, reviewee=self.freelancer, job=self.completed_job,
            rating=5, comment="Great",
        )
        Review.objects.create(
            reviewer=self.freelancer, reviewee=self.employer, job=self.completed_job,
            rating=4, comment="Good",
        )

    def test_user_rating_endpoint(self):
        resp = self.client.get(f"/api/users/{self.freelancer.id}/rating/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["average_rating"], 5.0)
        self.assertEqual(resp.data["review_count"], 1)

    def test_user_reviews_list(self):
        resp = self.client.get(f"/api/users/{self.freelancer.id}/reviews/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["count"], 1)

    def test_reviews_are_immutable(self):
        review = Review.objects.first()
        self.client.force_authenticate(user=self.employer)
        resp = self.client.patch(
            f"/api/reviews/{review.id}/", {"rating": 1}, format="json"
        )
        # ViewSet only exposes create/list/retrieve — 405
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)