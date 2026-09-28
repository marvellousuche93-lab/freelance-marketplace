"""
Tests for notifications.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.applications.models import Application
from apps.categories.models import Category
from apps.jobs.models import Job
from apps.messaging.models import Conversation
from apps.notifications.models import Notification

User = get_user_model()


class NotificationTestBase(APITestCase):
    def setUp(self):
        self.employer = User.objects.create_user(
            username="acme", email="acme@example.com", password="StrongPass123!", role="EMPLOYER"
        )
        self.freelancer = User.objects.create_user(
            username="jane", email="jane@example.com", password="StrongPass123!", role="FREELANCER"
        )
        self.category = Category.objects.create(name="Web Development")
        self.job = Job.objects.create(
            employer=self.employer, title="Job", description="x",
            category=self.category, status=Job.Status.OPEN,
            budget_type=Job.JobType.FIXED_PRICE, min_budget="100.00", max_budget="100.00",
        )


class NotificationCreationTests(NotificationTestBase):
    def test_application_creates_notification_for_employer(self):
        self.client.force_authenticate(user=self.freelancer)
        self.client.post(
            "/api/applications/",
            {
                "job": self.job.id,
                "cover_letter": "I can do this job with significant detail about my approach.",
                "proposed_price": "100.00",
            },
            format="json",
        )
        notif = Notification.objects.filter(user=self.employer).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.notif_type, Notification.Type.NEW_APPLICATION)

    def test_accept_creates_notification_for_freelancer(self):
        app_obj = Application.objects.create(
            job=self.job, freelancer=self.freelancer,
            cover_letter="I can do this job with significant detail about my approach.",
            proposed_price="100.00",
        )
        self.client.force_authenticate(user=self.employer)
        self.client.post(f"/api/applications/{app_obj.id}/accept/")
        notif = Notification.objects.filter(user=self.freelancer).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.notif_type, Notification.Type.APPLICATION_ACCEPTED)

    def test_message_creates_notification_for_recipient(self):
        conv = Conversation.objects.create()
        conv.participants.add(self.freelancer, self.employer)
        self.client.force_authenticate(user=self.freelancer)
        self.client.post(
            f"/api/conversations/{conv.id}/messages/",
            {"body": "Hi Acme!"},
            format="json",
        )
        notif = Notification.objects.filter(user=self.employer).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.notif_type, Notification.Type.NEW_MESSAGE)


class NotificationAPITests(NotificationTestBase):
    def setUp(self):
        super().setUp()
        self.n1 = Notification.objects.create(
            user=self.freelancer, notif_type=Notification.Type.SYSTEM,
            title="A", message="msg A",
        )
        self.n2 = Notification.objects.create(
            user=self.employer, notif_type=Notification.Type.SYSTEM,
            title="B", message="msg B",
        )

    def test_user_sees_only_own_notifications(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.get("/api/notifications/")
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["id"], self.n1.id)

    def test_unread_count(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.get("/api/notifications/unread_count/")
        self.assertEqual(resp.data["unread_count"], 1)

    def test_mark_one_read(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.post(f"/api/notifications/{self.n1.id}/read/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.n1.refresh_from_db()
        self.assertTrue(self.n1.is_read)

    def test_mark_all_read(self):
        self.client.force_authenticate(user=self.freelancer)
        Notification.objects.create(
            user=self.freelancer, notif_type=Notification.Type.SYSTEM, title="C"
        )
        resp = self.client.post("/api/notifications/read_all/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(
            Notification.objects.filter(user=self.freelancer, is_read=False).count(), 0
        )

    def test_cannot_fetch_other_users_notification(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.get(f"/api/notifications/{self.n2.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_clear_read(self):
        self.n1.is_read = True
        self.n1.save()
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.delete("/api/notifications/clear/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(user=self.freelancer).count(), 0)