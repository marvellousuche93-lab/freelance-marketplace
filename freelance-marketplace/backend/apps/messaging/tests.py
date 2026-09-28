"""
Tests for messaging.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.messaging.models import Conversation, Message

User = get_user_model()


class MessagingTestBase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="jane", email="jane@example.com", password="StrongPass123!", role="FREELANCER"
        )
        self.user2 = User.objects.create_user(
            username="acme", email="acme@example.com", password="StrongPass123!", role="EMPLOYER"
        )
        self.user3 = User.objects.create_user(
            username="bob", email="bob@example.com", password="StrongPass123!", role="FREELANCER"
        )


class ConversationCreationTests(MessagingTestBase):
    def test_user_can_start_conversation(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.post(
            "/api/conversations/", {"user_id": self.user2.id}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(Conversation.objects.count(), 1)

    def test_starting_twice_returns_same_conversation(self):
        self.client.force_authenticate(user=self.user1)
        r1 = self.client.post("/api/conversations/", {"user_id": self.user2.id}, format="json")
        r2 = self.client.post("/api/conversations/", {"user_id": self.user2.id}, format="json")
        self.assertEqual(r1.data["id"], r2.data["id"])
        self.assertEqual(Conversation.objects.count(), 1)

    def test_cannot_start_with_self(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.post(
            "/api/conversations/", {"user_id": self.user1.id}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_anonymous_cannot_start(self):
        resp = self.client.post(
            "/api/conversations/", {"user_id": self.user2.id}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class ConversationAccessTests(MessagingTestBase):
    def setUp(self):
        super().setUp()
        self.conv = Conversation.objects.create()
        self.conv.participants.add(self.user1, self.user2)

    def test_participant_can_read(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.get(f"/api/conversations/{self.conv.id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_non_participant_gets_404(self):
        self.client.force_authenticate(user=self.user3)
        resp = self.client.get(f"/api/conversations/{self.conv.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_participant_can_send_message(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.post(
            f"/api/conversations/{self.conv.id}/messages/",
            {"body": "Hello there!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)

    def test_non_participant_cannot_send_message(self):
        self.client.force_authenticate(user=self.user3)
        resp = self.client.post(
            f"/api/conversations/{self.conv.id}/messages/",
            {"body": "Hello there!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_empty_message_rejected(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.post(
            f"/api/conversations/{self.conv.id}/messages/",
            {"body": "   "},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_mark_read(self):
        Message.objects.create(conversation=self.conv, sender=self.user1, body="Hello")
        self.client.force_authenticate(user=self.user2)
        resp = self.client.post(f"/api/conversations/{self.conv.id}/read/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["marked_read"], 1)
        self.assertFalse(Message.objects.filter(is_read=False).exists())