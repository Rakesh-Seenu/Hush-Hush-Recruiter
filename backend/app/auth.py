"""Authentication + role enforcement.

The old app derived the admin role purely in the browser from a value baked into
the JS bundle, and the API had no auth at all. Here the backend is the source of
truth: every protected endpoint runs through :func:`get_current_user`, and the
role is decided server-side from ``ADMIN_EMAILS``.

Two modes (``AUTH_MODE``):

* ``firebase`` - verify a real Firebase ID token with the Admin SDK.
* ``demo``     - accept an unverified token / ``X-Demo-Email`` header so the app
                 runs locally without Firebase credentials. Never use in prod.
"""
from __future__ import annotations

import base64
import binascii
import json
import logging
from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, status

from .config import settings

logger = logging.getLogger("hush.auth")

_firebase_ready = False


@dataclass(frozen=True)
class CurrentUser:
    email: str
    role: str

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"


def _decode_jwt_email(token: str) -> str | None:
    """Best-effort extraction of the ``email`` claim WITHOUT verifying signature.

    Only used in demo mode so a genuine Firebase-issued token from the frontend
    still identifies the user locally. This trusts the client and must never be
    used to gate anything sensitive in production.
    """
    parts = token.split(".")
    if len(parts) != 3:
        return None
    try:
        payload = parts[1] + "=" * (-len(parts[1]) % 4)
        claims = json.loads(base64.urlsafe_b64decode(payload))
    except (ValueError, binascii.Error, json.JSONDecodeError):
        return None
    return claims.get("email")


def _ensure_firebase() -> None:
    global _firebase_ready
    if _firebase_ready:
        return
    import firebase_admin  # type: ignore
    from firebase_admin import credentials

    if not firebase_admin._apps:
        if settings.firebase_credentials_file:
            cred = credentials.Certificate(settings.firebase_credentials_file)
            firebase_admin.initialize_app(cred)
        else:
            # Uses GOOGLE_APPLICATION_CREDENTIALS from the environment.
            firebase_admin.initialize_app()
    _firebase_ready = True


def _verify_firebase_token(token: str) -> str | None:
    try:
        _ensure_firebase()
        from firebase_admin import auth as fb_auth  # type: ignore

        decoded = fb_auth.verify_id_token(token)
        return decoded.get("email")
    except Exception as exc:  # pragma: no cover - depends on external SDK
        logger.warning("Firebase token verification failed: %s", exc)
        return None


def _extract_email(authorization: str | None, x_demo_email: str | None) -> str | None:
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()

    if settings.auth_mode == "firebase":
        return _verify_firebase_token(token) if token else None

    # demo mode
    if x_demo_email:
        return x_demo_email.strip()
    if token:
        # allow either a raw email or a real (unverified) firebase JWT
        return _decode_jwt_email(token) or (token if "@" in token else None)
    return None


async def get_current_user(
    authorization: str | None = Header(default=None),
    x_demo_email: str | None = Header(default=None, alias="X-Demo-Email"),
    x_demo_token: str | None = Header(default=None, alias="X-Demo-Token"),
) -> CurrentUser:
    email = _extract_email(authorization, x_demo_email)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role = settings.role_for(email)

    # In demo mode, admin is trusted from a header, which is fine locally but
    # unsafe on a public URL. If DEMO_ADMIN_TOKEN is configured, require it to
    # actually get admin (Firebase mode does real verification and skips this).
    if (
        settings.auth_mode == "demo"
        and role == "admin"
        and settings.demo_admin_token
        and (x_demo_token or "") != settings.demo_admin_token
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin access in demo mode requires a valid token.",
        )

    return CurrentUser(email=email.lower(), role=role)


async def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin/recruiter access required.",
        )
    return user
