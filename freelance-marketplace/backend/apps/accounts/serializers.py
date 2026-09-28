"""
Serializers for the accounts app.

Handles: user registration, user read, user update, role-specific
profiles, and the auth-completion flows (change email, change
password, password reset).
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


# ------------------------------------------------------------------
# Profile serializers
# ------------------------------------------------------------------

class FreelancerProfileSerializer(serializers.ModelSerializer):
    """Read/write serializer for a freelancer's own profile."""

    class Meta:
        from .models import FreelancerProfile

        model = FreelancerProfile
        fields = (
            "professional_title",
            "hourly_rate",
            "availability",
            "experience_years",
            "education",
            "languages",
            "linkedin_url",
            "github_url",
            "twitter_url",
            "is_featured",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("is_featured", "created_at", "updated_at")


class EmployerProfileSerializer(serializers.ModelSerializer):
    """Read/write serializer for an employer's own profile."""

    class Meta:
        from .models import EmployerProfile

        model = EmployerProfile
        fields = (
            "company_name",
            "company_logo",
            "company_description",
            "industry",
            "company_size",
            "company_website",
            "contact_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")

    def validate_company_name(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Company name cannot be blank.")
        return value


# ------------------------------------------------------------------
# User serializers
# ------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    """Full read representation of a user. Never includes password."""

    freelancer_profile = FreelancerProfileSerializer(read_only=True)
    employer_profile = EmployerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "profile_picture",
            "bio",
            "location",
            "phone_number",
            "website",
            "is_active",
            "freelancer_profile",
            "employer_profile",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "role", "is_active", "created_at", "updated_at")


class PublicUserSerializer(serializers.ModelSerializer):
    """Reduced user shape for public listings. Excludes email and phone."""

    freelancer_profile = FreelancerProfileSerializer(read_only=True)
    employer_profile = EmployerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "role",
            "profile_picture",
            "bio",
            "location",
            "website",
            "freelancer_profile",
            "employer_profile",
            "created_at",
        )


class RegisterSerializer(serializers.ModelSerializer):
    """Public user creation."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "role",
        )
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
            "email": {"required": True},
            "role": {"required": True},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError(
                "You cannot register as an administrator."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.is_staff = False
        user.is_superuser = False
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Update the authenticated user's own basic fields."""

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "profile_picture",
            "bio",
            "location",
            "phone_number",
            "website",
        )


# ------------------------------------------------------------------
# Change email
# ------------------------------------------------------------------

class ChangeEmailRequestSerializer(serializers.Serializer):
    """
    Step 1: user asks to change email to a new address.

    We don't update the user's email yet — we create a pending request
    and email a confirmation link to the new address.
    """

    new_email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate_new_email(self, value):
        value = value.lower()
        user = self.context["request"].user

        if value == user.email.lower():
            raise serializers.ValidationError(
                "That's already your current email address."
            )
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Another account already uses this email address."
            )
        return value

    def validate_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Incorrect password.")
        return value


class ChangeEmailConfirmSerializer(serializers.Serializer):
    """
    Step 2: user clicks the link in their new inbox. The token comes
    from the URL; the new password-confirmation flow is not needed.
    """

    token = serializers.CharField()


# ------------------------------------------------------------------
# Change password
# ------------------------------------------------------------------

class ChangePasswordSerializer(serializers.Serializer):
    """
    Change password for the currently authenticated user.
    Requires the current password.
    """

    current_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    new_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    new_password_confirm = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "New passwords do not match."}
            )
        try:
            validate_password(attrs["new_password"], self.context["request"].user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                {"new_password": list(exc.messages)}
            )
        return attrs


# ------------------------------------------------------------------
# Password reset
# ------------------------------------------------------------------

class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Step 1: user enters their email. We always respond with 200,
    whether or not the email exists, to avoid leaking which addresses
    are registered.
    """

    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Step 2: user clicks the reset link and submits a new password.
    The token comes from the URL.
    """

    token = serializers.CharField()
    new_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    new_password_confirm = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "New passwords do not match."}
            )
        try:
            validate_password(attrs["new_password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                {"new_password": list(exc.messages)}
            )
        return attrs