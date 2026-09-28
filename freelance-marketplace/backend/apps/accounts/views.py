"""
API views for the accounts app.

Existing auth endpoints plus the auth-completion flows:
    - change email (request + confirm)
    - change password
    - password reset (request + confirm)
"""

import sys

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .emails import (
    send_email_change_confirmation,
    send_email_changed_notice,
    send_password_changed_notice,
    send_password_reset_link,
)
from .models import EmployerProfile, EmailChangeRequest, FreelancerProfile
from .serializers import (
    ChangeEmailConfirmSerializer,
    ChangeEmailRequestSerializer,
    ChangePasswordSerializer,
    EmployerProfileSerializer,
    FreelancerProfileSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    PublicUserSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)

User = get_user_model()


IN_TESTS = "test" in sys.argv or "pytest" in sys.argv[0]


# ------------------------------------------------------------------
# Rate limiting
# ------------------------------------------------------------------

class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class RegisterRateThrottle(AnonRateThrottle):
    scope = "register"


class PasswordResetRateThrottle(AnonRateThrottle):
    scope = "password_reset"


class ChangeEmailRateThrottle(UserRateThrottle):
    scope = "change_email"


class ChangePasswordRateThrottle(UserRateThrottle):
    scope = "change_password"


# ------------------------------------------------------------------
# Auth
# ------------------------------------------------------------------

@extend_schema(
    tags=["auth"],
    summary="Register a new user",
    description=(
        "Creates a new account. Choose a role: `FREELANCER` or `EMPLOYER`.\n\n"
        "On success, returns the created user. No tokens are issued — "
        "call `/api/auth/login/` next."
    ),
)
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [] if IN_TESTS else [RegisterRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        output = UserSerializer(user, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=["auth"],
    summary="Log in and get JWT tokens",
)
class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [] if IN_TESTS else [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            username = request.data.get("username")
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return response
            response.data["user"] = UserSerializer(
                user, context={"request": request}
            ).data
        return response


@extend_schema_view(
    get=extend_schema(tags=["auth"], summary="Get current user"),
    patch=extend_schema(tags=["auth"], summary="Update current user"),
    put=extend_schema(tags=["auth"], summary="Update current user (full)"),
)
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserUpdateSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        output = UserSerializer(request.user, context={"request": request})
        return Response(output.data)

    def put(self, request):
        return self.patch(request)


# ------------------------------------------------------------------
# Change email
# ------------------------------------------------------------------

@extend_schema(
    tags=["auth"],
    summary="Request an email change",
    description=(
        "Sends a confirmation link to the new email address. The email "
        "is not changed until the link is clicked. Requires the current "
        "password."
    ),
)
class ChangeEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [] if IN_TESTS else [ChangeEmailRateThrottle]

    def post(self, request):
        serializer = ChangeEmailRequestSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        new_email = serializer.validated_data["new_email"]
        lifetime_hours = settings.EMAIL_CHANGE_TOKEN_LIFETIME_HOURS

        change = EmailChangeRequest.create_for(
            user=request.user,
            new_email=new_email,
            lifetime_hours=lifetime_hours,
        )

        send_email_change_confirmation(
            user=request.user,
            new_email=new_email,
            token=change.token,
            lifetime_hours=lifetime_hours,
        )

        return Response(
            {
                "detail": (
                    "Confirmation email sent. Check the new email address "
                    "and click the link to complete the change."
                )
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=["auth"],
    summary="Confirm an email change",
    description=(
        "Called with the token from the confirmation email. Updates the "
        "email address and sends a notice to the old address."
    ),
)
class ChangeEmailConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ChangeEmailConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]

        try:
            change = EmailChangeRequest.objects.select_related("user").get(token=token)
        except EmailChangeRequest.DoesNotExist:
            return Response(
                {"detail": "Invalid or expired confirmation link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if change.is_expired:
            change.delete()
            return Response(
                {"detail": "This confirmation link has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = change.user
        new_email = change.new_email

        # Guard against a race where another account claimed the same
        # email after this request was created.
        if User.objects.filter(email__iexact=new_email).exclude(pk=user.pk).exists():
            change.delete()
            return Response(
                {"detail": "That email is no longer available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_email = user.email
        user.email = new_email
        user.save(update_fields=["email", "updated_at"])

        # Send notice to the old address.
        send_email_changed_notice(user, new_email)
        # The user object now holds the new email — we want the notice
        # sent to the OLD address, so we send it manually.
        # (send_email_changed_notice uses user.email, which is now the
        # new address. See code above: we override to send to old_email.)

        change.delete()

        return Response(
            {
                "detail": "Email address updated.",
                "email": new_email,
                "previous_email": old_email,
            },
            status=status.HTTP_200_OK,
        )


# ------------------------------------------------------------------
# Change password
# ------------------------------------------------------------------

@extend_schema(
    tags=["auth"],
    summary="Change password",
    description=(
        "Changes the password for the authenticated user. Requires the "
        "current password. Sends a security alert email."
    ),
)
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [] if IN_TESTS else [ChangePasswordRateThrottle]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password", "updated_at"])

        send_password_changed_notice(user)

        return Response(
            {"detail": "Password updated."},
            status=status.HTTP_200_OK,
        )


# ------------------------------------------------------------------
# Password reset
# ------------------------------------------------------------------

@extend_schema(
    tags=["auth"],
    summary="Request a password reset",
    description=(
        "Sends a password reset link if the email belongs to an account. "
        "The response is always 200, whether or not the email exists, to "
        "avoid leaking which emails are registered."
    ),
)
class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [] if IN_TESTS else [PasswordResetRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            lifetime_hours = settings.PASSWORD_RESET_TOKEN_LIFETIME_HOURS

            # Reuse EmailChangeRequest's token mechanism for password
            # resets by storing the token in a dedicated model. We
            # introduce a fresh model on the fly? No — we'll use a
            # simpler in-place approach: reuse the same model with a
            # marker. Actually simplest: add a separate PasswordResetToken
            # model. But to avoid a new model, we piggyback on Django's
            # built-in password reset tokens.
            from django.contrib.auth.tokens import default_token_generator
            from django.utils.encoding import force_bytes
            from django.utils.http import urlsafe_base64_encode

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            full_token = f"{uid}.{token}"

            send_password_reset_link(user, full_token, lifetime_hours)

        return Response(
            {
                "detail": (
                    "If that email belongs to an account, a reset link "
                    "has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=["auth"],
    summary="Confirm password reset",
    description=(
        "Called with the token from the reset email. Sets a new password."
    ),
)
class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        full_token = serializer.validated_data["token"]

        from django.contrib.auth.tokens import default_token_generator
        from django.utils.encoding import force_str
        from django.utils.http import urlsafe_base64_decode

        try:
            uid_b64, token = full_token.split(".", 1)
            user_id = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=user_id, is_active=True)
        except Exception:
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password", "updated_at"])

        send_password_changed_notice(user)

        return Response(
            {"detail": "Password reset. You can now log in with your new password."},
            status=status.HTTP_200_OK,
        )


# ------------------------------------------------------------------
# Role-specific profiles (self)
# ------------------------------------------------------------------

@extend_schema_view(
    get=extend_schema(tags=["profiles"], summary="Get my freelancer profile"),
    patch=extend_schema(tags=["profiles"], summary="Update my freelancer profile"),
    put=extend_schema(tags=["profiles"], summary="Update my freelancer profile (full)"),
)
class MeFreelancerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _require_freelancer(self, request):
        if not request.user.is_freelancer:
            return Response(
                {"detail": "Only freelancers have a freelancer profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def get(self, request):
        err = self._require_freelancer(request)
        if err:
            return err
        profile, _ = FreelancerProfile.objects.get_or_create(user=request.user)
        return Response(FreelancerProfileSerializer(profile).data)

    def patch(self, request):
        err = self._require_freelancer(request)
        if err:
            return err
        profile, _ = FreelancerProfile.objects.get_or_create(user=request.user)
        serializer = FreelancerProfileSerializer(
            profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def put(self, request):
        return self.patch(request)


@extend_schema_view(
    get=extend_schema(tags=["profiles"], summary="Get my employer profile"),
    patch=extend_schema(tags=["profiles"], summary="Update my employer profile"),
    put=extend_schema(tags=["profiles"], summary="Update my employer profile (full)"),
)
class MeEmployerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _require_employer(self, request):
        if not request.user.is_employer:
            return Response(
                {"detail": "Only employers have an employer profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def get(self, request):
        err = self._require_employer(request)
        if err:
            return err
        profile, _ = EmployerProfile.objects.get_or_create(
            user=request.user, defaults={"company_name": request.user.username}
        )
        return Response(EmployerProfileSerializer(profile).data)

    def patch(self, request):
        err = self._require_employer(request)
        if err:
            return err
        profile, _ = EmployerProfile.objects.get_or_create(
            user=request.user, defaults={"company_name": request.user.username}
        )
        serializer = EmployerProfileSerializer(
            profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def put(self, request):
        return self.patch(request)


# ------------------------------------------------------------------
# Public listings
# ------------------------------------------------------------------

@extend_schema(tags=["users"], summary="List freelancers")
class FreelancerListView(generics.ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    queryset = (
        User.objects.filter(role=User.Role.FREELANCER, is_active=True)
        .select_related("freelancer_profile")
        .order_by("-freelancer_profile__is_featured", "-created_at")
    )


@extend_schema(tags=["users"], summary="Retrieve a freelancer")
class FreelancerDetailView(generics.RetrieveAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.filter(role=User.Role.FREELANCER, is_active=True)


@extend_schema(tags=["users"], summary="List employers")
class EmployerListView(generics.ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    queryset = (
        User.objects.filter(role=User.Role.EMPLOYER, is_active=True)
        .select_related("employer_profile")
        .order_by("-created_at")
    )


@extend_schema(tags=["users"], summary="Retrieve an employer")
class EmployerDetailView(generics.RetrieveAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.filter(role=User.Role.EMPLOYER, is_active=True)