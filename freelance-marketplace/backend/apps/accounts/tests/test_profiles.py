"""
Tests for freelancer and employer profiles.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class FreelancerProfileTests(APITestCase):
    def setUp(self):
        self.freelancer = User.objects.create_user(
            username="jane",
            email="jane@example.com",
            password="StrongPass123!",
            role="FREELANCER",
        )
        self.employer = User.objects.create_user(
            username="acme",
            email="acme@example.com",
            password="StrongPass123!",
            role="EMPLOYER",
        )
        self.url = "/api/auth/me/freelancer-profile/"

    def test_profile_is_autocreated_on_registration(self):
        # The signal creates a FreelancerProfile on user creation.
        self.assertTrue(hasattr(self.freelancer, "freelancer_profile"))

    def test_freelancer_can_read_own_profile(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("hourly_rate", resp.data)

    def test_freelancer_can_update_own_profile(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.patch(
            self.url,
            {"professional_title": "Django dev", "hourly_rate": "40.00"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.freelancer.freelancer_profile.refresh_from_db()
        self.assertEqual(self.freelancer.freelancer_profile.professional_title, "Django dev")

    def test_employer_cannot_access_freelancer_profile(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_access(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class EmployerProfileTests(APITestCase):
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
        self.url = "/api/auth/me/employer-profile/"

    def test_profile_is_autocreated_on_registration(self):
        self.assertTrue(hasattr(self.employer, "employer_profile"))

    def test_employer_can_update_own_profile(self):
        self.client.force_authenticate(user=self.employer)
        resp = self.client.patch(
            self.url,
            {"company_name": "Acme Inc", "industry": "Software"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.employer.employer_profile.refresh_from_db()
        self.assertEqual(self.employer.employer_profile.company_name, "Acme Inc")

    def test_freelancer_cannot_access_employer_profile(self):
        self.client.force_authenticate(user=self.freelancer)
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)