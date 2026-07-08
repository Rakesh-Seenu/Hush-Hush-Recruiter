"""Consent-aware outreach.

Guard rails, in order:

1. A candidate who ``declined`` consent is never emailed.
2. Outreach is blocked entirely unless ``ALLOW_OUTREACH=true``.
3. ``EMAIL_MODE=console`` (default) logs the message instead of sending it, so
   demos and CI never send real mail.

Only ``EMAIL_MODE=smtp`` + ``ALLOW_OUTREACH=true`` + valid credentials sends a
real email.
"""
from __future__ import annotations

import logging
import smtplib
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from ..config import settings

logger = logging.getLogger("hush.email")


@dataclass
class SendOutcome:
    success: bool
    message: str


def _build_html(name: str) -> str:
    return f"""\
<html><body style="font-family:system-ui,Segoe UI,Arial,sans-serif;color:#1a1a2e">
  <p>Hi {name},</p>
  <p>We came across your open-source work and think you could be a great fit for a
     role at <strong>Doodle</strong>. We'd love to invite you to a short, optional
     first-round conversation.</p>
  <p>You are in full control of your data. You can review what we hold and withdraw
     at any time from your candidate portal:</p>
  <p><a href="{settings.apply_url}">Open your candidate portal</a></p>
  <p>If you'd rather not hear from us, just decline in the portal and we'll remove
     you.</p>
  <p>Warm regards,<br/>The Doodle Talent Team</p>
</body></html>"""


def _send_smtp(recipient: str, name: str) -> SendOutcome:
    if not settings.email_password:
        return SendOutcome(False, "SMTP selected but EMAIL_PASSWORD is not configured.")
    try:
        msg = MIMEMultipart()
        msg["From"] = settings.email_sender
        msg["To"] = recipient
        msg["Subject"] = "An opportunity at Doodle"
        msg.attach(MIMEText(_build_html(name), "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as server:
            server.starttls()
            server.login(settings.email_sender, settings.email_password)
            server.sendmail(settings.email_sender, recipient, msg.as_string())
        return SendOutcome(True, f"Email sent to {recipient}.")
    except (smtplib.SMTPException, OSError) as exc:
        logger.warning("SMTP send to %s failed: %s", recipient, exc)
        return SendOutcome(False, f"Email could not be sent: {exc}")


def send_outreach(*, recipient: str | None, name: str | None, consent_status: str) -> SendOutcome:
    if consent_status == "declined":
        return SendOutcome(False, "Candidate declined consent; outreach blocked.")
    if not recipient:
        return SendOutcome(False, "Candidate has no email on file.")
    if not settings.allow_outreach:
        return SendOutcome(
            False,
            "Outreach is disabled (set ALLOW_OUTREACH=true to enable real sending).",
        )

    display = name or recipient.split("@")[0]
    if settings.email_mode == "console":
        logger.info("[console-email] would send outreach to %s (%s)", recipient, display)
        return SendOutcome(True, f"(console mode) Simulated email to {recipient}.")
    return _send_smtp(recipient, display)
