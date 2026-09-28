"""
Tests for authentication: register, login, me, refresh.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegisterTests(APITestCase):
    """POST /api/auth/register/"""

    def setUp(self):
        self.url = "/api/auth/register/"
        self.valid_payload = {
            "username": "alice",
            "email": "alice@example.com",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "first_name": "Alice",
            "last_name": "Doe",
            "role": "FREELANCER",
        }

    def test_register_freelancer_success(self):
        resp = self.client.post(self.url, self.valid_payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["username"], "alice")
        self.assertEqual(resp.data["role"], "FREELANCER")
        self.assertNotIn("password", resp.data)
        self.assertTrue(User.objects.filter(username="alice").exists())

    def test_register_employer_success(self):
        payload = {**self.valid_payload, "username": "acme", "email": "acme@example.com", "role": "EMPLOYER"}
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["role"], "EMPLOYER")

    def test_cannot_register_as_admin(self):
        payload = {**self.valid_payload, "role": "ADMIN"}
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("role", resp.data)

    def test_duplicate_email_rejected(self):
        self.client.post(self.url, self.valid_payload, format="json")
        payload = {**self.valid_payload, "username": "alice2"}
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", resp.data)

    def test_duplicate_username_rejected(self):
        self.client.post(self.url, self.valid_payload, format="json")
        payload = {**self.valid_payload, "email": "alice2@example.com"}
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", resp.data)

    def test_mismatched_passwords_rejected(self):
        payload = {**self.valid_payload, "password_confirm": "Different123!"}
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", resp.data)

    def test_weak_password_rejected(self):
        payload = {**self.valid_payload, "password": "123", "password_confirm": "123"}
        resp = self.client.post(self.url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", resp.data)


class LoginAndMeTests(APITestCase):
    """POST /api/auth/login/, GET/PATCH /api/auth/me/, POST /api/auth/token/refresh/"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="jane",
            email="jane@example.com",
            password="StrongPass123!",
            role="FREELANCER",
        )

    def _login(self):
        return self.client.post(
            "/api/auth/login/",
            {"username": "jane", "password": "StrongPass123!"},
            format="json",
        )

    def test_login_returns_tokens_and_user(self):
        resp = self._login()
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)
        self.assertIn("user", resp.data)
        self.assertEqual(resp.data["user"]["username"], "jane")
        self.assertNotIn("password", resp.data["user"])

    def test_login_wrong_password_fails(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"username": "jane", "password": "wrong"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_authentication(self):
        resp = self.client.get("/api/auth/me/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get("/api/auth/me/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["username"], "jane")
        self.assertIn("freelancer_profile", resp.data)

    def test_me_patch_updates_safe_fields(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.patch(
            "/api/auth/me/",
            {"bio": "Hello", "location": "Lagos"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.bio, "Hello")
        self.assertEqual(self.user.location, "Lagos")

    def test_me_patch_cannot_change_role_or_email(self):
        self.client.force_authenticate(user=self.user)
        self.client.patch(
            "/api/auth/me/",
            {"role": "ADMIN", "email": "evil@example.com"},
            format="json",
        )
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, "FREELANCER")
        self.assertEqual(self.user.email, "jane@example.com")

    def test_token_refresh_works(self):
        login = self._login()
        resp = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": login.data["refresh"]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)