"""
Tests for bookmarks.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.bookmarks.models import Bookmark
from apps.categories.models import Category
from apps.jobs.models import Job

User = get_user_model()


class BookmarkTestBase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="jane", email="jane@example.com", password="StrongPass123!", role="FREELANCER"
        )
        self.user2 = User.objects.create_user(
            username="bob", email="bob@example.com", password="StrongPass123!", role="FREELANCER"
        )
        self.employer = User.objects.create_user(
            username="acme", email="acme@example.com", password="StrongPass123!", role="EMPLOYER"
        )
        self.category = Category.objects.create(name="Web Development")
        self.open_job = Job.objects.create(
            employer=self.employer, title="Open job", description="x",
            category=self.category, status=Job.Status.OPEN,
            budget_type=Job.JobType.FIXED_PRICE, min_budget="100.00", max_budget="100.00",
        )
        self.draft_job = Job.objects.create(
            employer=self.employer, title="Draft job", description="x",
            category=self.category, status=Job.Status.DRAFT,
        )


class BookmarkCreateTests(BookmarkTestBase):
    def test_authenticated_user_can_bookmark_open_job(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.post("/api/bookmarks/", {"job": self.open_job.id}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Bookmark.objects.count(), 1)

    def test_anonymous_cannot_bookmark(self):
        resp = self.client.post("/api/bookmarks/", {"job": self.open_job.id}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_bookmark_draft_job(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.post("/api/bookmarks/", {"job": self.draft_job.id}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_bookmark_twice(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post("/api/bookmarks/", {"job": self.open_job.id}, format="json")
        resp = self.client.post("/api/bookmarks/", {"job": self.open_job.id}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Bookmark.objects.count(), 1)

    def test_two_users_can_bookmark_same_job(self):
        self.client.force_authenticate(user=self.user1)
        self.client.post("/api/bookmarks/", {"job": self.open_job.id}, format="json")
        self.client.force_authenticate(user=self.user2)
        resp = self.client.post("/api/bookmarks/", {"job": self.open_job.id}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Bookmark.objects.count(), 2)


class BookmarkIsolationTests(BookmarkTestBase):
    def setUp(self):
        super().setUp()
        self.b1 = Bookmark.objects.create(user=self.user1, job=self.open_job)
        self.b2 = Bookmark.objects.create(user=self.user2, job=self.open_job)

    def test_user_sees_only_own_bookmarks(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.get("/api/bookmarks/")
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["id"], self.b1.id)

    def test_user_cannot_fetch_other_users_bookmark(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.get(f"/api/bookmarks/{self.b2.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_check_endpoint(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.get(f"/api/bookmarks/check/?job={self.open_job.id}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data["bookmarked"])

    def test_check_endpoint_requires_job_param(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.get("/api/bookmarks/check/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_can_delete_own_bookmark(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.delete(f"/api/bookmarks/{self.b1.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Bookmark.objects.count(), 1)

    def test_user_cannot_delete_other_users_bookmark(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.delete(f"/api/bookmarks/{self.b2.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)