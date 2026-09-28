"""
Email sending helpers for the accounts app.

Each function loads a template, formats it, and sends the email. If
sending fails, we log the error but do NOT raise — a failed email
should never break the API response, and we don't want attackers to
learn whether an address exists by observing 500s.
"""

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def _send(subject_template, body_template, context, to_email):
    """
    Render subject+body templates and send them as a plain text email.
    """
    subject = render_to_string(subject_template, context).strip().replace("\n", " ")
    body = render_to_string(body_template, context)
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.send(fail_silently=False)
    except Exception as exc:
        logger.exception("Failed to send email to %s: %s", to_email, exc)


def send_email_change_confirmation(user, new_email, token, lifetime_hours):
    """Send a confirmation link to the NEW email address."""
    confirm_url = (
        f"{settings.FRONTEND_URL}/verify-email/{token}"
    )
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