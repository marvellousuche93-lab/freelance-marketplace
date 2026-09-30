"""
Email sending helpers for the accounts app.

Uses the Resend HTTP API (https://resend.com) instead of SMTP,
because Render's free tier blocks outbound SMTP ports.

Environment variables required:
    RESEND_API_KEY      – your Resend API key (starts with "re_")
    DEFAULT_FROM_EMAIL  – the "from" address shown to recipients
"""

import logging

import resend
from django.conf import settings
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

# Configure the Resend client once at import time.
resend.api_key = getattr(settings, "RESEND_API_KEY", "")


def _send(subject_template, body_template, context, to_email):
    """
    Render subject+body templates and send them as a plain text email
    via Resend. Logs errors but does NOT raise — a failed email
    should never break the API response.
    """
    subject = render_to_string(subject_template, context).strip().replace("\n", " ")
    body = render_to_string(body_template, context)

    try:
        resend.Emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [to_email],
            "subject": subject,
            "text": body,
        })
        logger.info("Email sent to %s: %s", to_email, subject)
    except Exception as exc:
        logger.exception("Failed to send email to %s: %s", to_email, exc)


def send_email_change_confirmation(user, new_email, token, lifetime_hours):
    """Send a confirmation link to the NEW email address."""
    confirm_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
    _send(
        subject_template="email/email_change_subject.txt",
        body_template="email/email_change_body.txt",
        context={
            "user": user,
            "new_email": new_email,
            "confirm_url": confirm_url,
            "lifetime_hours": lifetime_hours,
        },
        to_email=new_email,
    )


def send_email_changed_notice(user, new_email):
    """Send a notice to the OLD email address after a change completes."""
    _send(
        subject_template="email/email_changed_subject.txt",
        body_template="email/email_changed_body.txt",
        context={
            "user": user,
            "new_email": new_email,
            "password_reset_url": f"{settings.FRONTEND_URL}/forgot-password",
        },
        to_email=user.email,
    )


def send_password_changed_notice(user):
    """Send a security alert after the password changes."""
    _send(
        subject_template="email/password_changed_subject.txt",
        body_template="email/password_changed_body.txt",
        context={
            "user": user,
            "password_reset_url": f"{settings.FRONTEND_URL}/forgot-password",
        },
        to_email=user.email,
    )


def send_password_reset_link(user, token, lifetime_hours):
    """Send a password reset link to the user's email."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}"
    _send(
        subject_template="email/password_reset_subject.txt",
        body_template="email/password_reset_body.txt",
        context={
            "user": user,
            "reset_url": reset_url,
            "lifetime_hours": lifetime_hours,
        },
        to_email=user.email,
    )