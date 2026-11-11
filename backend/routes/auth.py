from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import bcrypt
import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
from dotenv import load_dotenv
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
from typing import Optional
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import requests
import jwt

from database import get_db
from models import User, AdminOTP
from schemas import (
    UserCreate,
    UserLogin,
    GoogleLoginRequest,
    AdminOTPRequest,
    AdminOTPResponse,
)

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)

router = APIRouter(tags=["auth"])
security = HTTPBearer(auto_error=False)
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-development-secret")
GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "461770927726-e3ae8196kf2b5uukpfa3v6kitu18ckdm.apps.googleusercontent.com",
)
ALLOWED_ROLES = {"admin", "student"}
ADMIN_VERIFICATION_EMAIL = os.getenv("ADMIN_VERIFICATION_EMAIL", "sritalumni@gmail.com")
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))


def send_admin_otp_email(otp_code: str, target_email: str = ADMIN_VERIFICATION_EMAIL) -> tuple[bool, str]:
    """Send admin creation OTP email to sritalumni@gmail.com via SMTP.
    Delivers strictly via SMTP email. Never leaks OTP to unauthenticated responses.
    Dynamically re-reads .env on each invocation so newly set passwords take effect immediately.
    """
    # Dynamically reload environment variables so newly saved app passwords take effect without restart
    load_dotenv(ENV_PATH, override=True)
    current_smtp_user = os.getenv("SMTP_USER", SMTP_USER).strip()
    current_smtp_pass = os.getenv("SMTP_PASS", SMTP_PASS).strip()
    current_smtp_host = os.getenv("SMTP_HOST", SMTP_HOST).strip()
    current_target = os.getenv("ADMIN_VERIFICATION_EMAIL", target_email).strip() or "sritalumni@gmail.com"

    subject = "SRIT Alumni - Administrator Account Verification OTP"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 580px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #4338ca); padding: 24px; border-radius: 16px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">SRIT Alumni Portal</h1>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Administrator Registration Verification</p>
        </div>
        <div style="padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; margin-top: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <p style="font-size: 15px; margin-top: 0;">Hello Administrator,</p>
          <p style="font-size: 14px; color: #475569;">A request has been initiated to register a new <strong>Administrator Account</strong> on the SRIT Alumni Portal.</p>
          <p style="font-size: 14px; color: #475569;">Use the verification code below to authorize this registration:</p>
          <div style="background: #f8fafc; border: 2px dashed #3b82f6; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; font-family: monospace;">{otp_code}</span>
          </div>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 4px;">⏳ This OTP expires in <strong>10 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 13px; margin-top: 0;">🔒 If you did not authorize this administrator account creation, please discard this message.</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px;">
          &copy; SRIT Alumni Association. All rights reserved.
        </div>
      </body>
    </html>
    """

    # Check if credentials are placeholders or empty
    is_placeholder = (
        not current_smtp_user
        or not current_smtp_pass
        or "your-gmail" in current_smtp_user.lower()
        or "your-gmail" in current_smtp_pass.lower()
        or "your-app-password" in current_smtp_pass.lower()
        or current_smtp_pass.strip() == "your-gmail-app-password"
    )
    if is_placeholder:
        err_msg = (
            "Gmail App Password is not set in backend/.env. "
            "Google requires a 16-character App Password to deliver emails to sritalumni@gmail.com. "
            "Please generate an App Password in your Google Account (myaccount.google.com -> Security -> 2-Step Verification -> App Passwords) "
            "and set SMTP_PASS=<your 16-character password> in backend/.env."
        )
        print(f"[WARN] {err_msg}")
        return False, err_msg

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"SRIT Alumni Portal <{current_smtp_user}>"
        msg["To"] = current_target
        msg.attach(MIMEText(f"Your Administrator Verification OTP is: {otp_code}. Valid for 10 minutes.", "plain"))
        msg.attach(MIMEText(html_content, "html"))

        cleaned_pass = current_smtp_pass.replace(" ", "")

        # Try SSL port 465 first, fallback to TLS port 587
        delivered = False
        last_error = ""

        # 1. Try SSL (Port 465)
        try:
            with smtplib.SMTP_SSL(current_smtp_host, 465, timeout=12) as server:
                server.login(current_smtp_user, cleaned_pass)
                server.sendmail(current_smtp_user, current_target, msg.as_string())
            delivered = True
        except smtplib.SMTPAuthenticationError as auth_err:
            last_error = f"Gmail authentication failed (Code {auth_err.smtp_code}). Invalid credentials. Please ensure 2-Step Verification is active and use a 16-character App Password."
            print(f"[WARN] SMTP SSL auth failed: {last_error}")
        except smtplib.SMTPServerDisconnected as disc_err:
            last_error = f"Gmail SMTP disconnected unexpectedly: {disc_err}. Credentials rejected by Google."
            print(f"[WARN] SMTP SSL disconnected: {last_error}")
        except Exception as ssl_err:
            last_error = f"SMTP SSL (465) error: {type(ssl_err).__name__} - {ssl_err}"
            print(f"[WARN] SMTP SSL error: {last_error}")

        if not delivered:
            # 2. Try STARTTLS (Port 587)
            try:
                print("[INFO] Attempting STARTTLS on port 587...")
                with smtplib.SMTP(current_smtp_host, 587, timeout=12) as server:
                    server.starttls()
                    server.login(current_smtp_user, cleaned_pass)
                    server.sendmail(current_smtp_user, current_target, msg.as_string())
                delivered = True
            except smtplib.SMTPAuthenticationError as auth_err:
                last_error = f"Gmail authentication failed (Code {auth_err.smtp_code}). Invalid credentials. Please ensure 2-Step Verification is active and use a 16-character App Password."
                print(f"[WARN] SMTP TLS auth failed: {last_error}")
            except smtplib.SMTPServerDisconnected as disc_err:
                last_error = f"Gmail SMTP disconnected unexpectedly: {disc_err}. Credentials rejected by Google."
                print(f"[WARN] SMTP TLS disconnected: {last_error}")
            except Exception as tls_err:
                last_error = f"SMTP TLS (587) error: {type(tls_err).__name__} - {tls_err}"
                print(f"[WARN] SMTP TLS error: {last_error}")

        if delivered:
            print(f"[OK] OTP Email sent successfully to {current_target}")
            return True, "Email sent successfully"

        return False, last_error or "Failed to deliver email via SMTP."
    except Exception as e:
        err_msg = f"SMTP delivery failed: {type(e).__name__} - {e}"
        print(f"[ERROR] {err_msg}")
        return False, err_msg


def verify_google_token(credential: str) -> dict:
    """Verify Google ID token via Google tokeninfo endpoint, falling back to pyjwt if needed."""
    try:
        resp = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}",
            timeout=10,
        )
        if resp.status_code == 200:
            data = resp.json()
            aud = data.get("aud")
            if GOOGLE_CLIENT_ID and aud != GOOGLE_CLIENT_ID:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Google token audience",
                )
            return data
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[WARN] Google tokeninfo request failed ({exc}), attempting local JWT decode fallback")

    try:
        decoded = jwt.decode(credential, options={"verify_signature": False})
        return decoded
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google credential: {exc}",
        )


def _encode_token(user: User) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": str(user.id), "role": str(user.role), "exp": int(time.time()) + 60 * 60 * 8}

    def encode(value: dict) -> str:
        return base64.urlsafe_b64encode(json.dumps(value, separators=(",", ":")).encode()).decode().rstrip("=")

    unsigned = f"{encode(header)}.{encode(payload)}"
    signature = hmac.new(JWT_SECRET.encode(), unsigned.encode(), hashlib.sha256).digest()
    return f"{unsigned}.{base64.urlsafe_b64encode(signature).decode().rstrip('=')}"


def _decode_token(token: str) -> dict:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
        unsigned = f"{encoded_header}.{encoded_payload}"
        expected = hmac.new(JWT_SECRET.encode(), unsigned.encode(), hashlib.sha256).digest()
        actual = base64.urlsafe_b64decode(encoded_signature + "===")
        if not hmac.compare_digest(expected, actual):
            raise ValueError
        payload = json.loads(base64.urlsafe_b64decode(encoded_payload + "===").decode())
        if int(payload["exp"]) < int(time.time()):
            raise ValueError
        return payload
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = _decode_token(credentials.credentials)
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or user.role != payload.get("role"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user session")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if str(user.role) != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

@router.post("/admin-otp/request", response_model=AdminOTPResponse)
def request_admin_otp(payload: Optional[AdminOTPRequest] = None, db: Session = Depends(get_db)):
    load_dotenv(ENV_PATH, override=True)
    target_email = os.getenv("ADMIN_VERIFICATION_EMAIL", "sritalumni@gmail.com").strip() or "sritalumni@gmail.com"

    # Generate 6-digit OTP
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Invalidate previous unused OTPs for this email
    db.query(AdminOTP).filter(
        AdminOTP.email == target_email,
        AdminOTP.is_used == False,
    ).update({"is_used": True})

    # Store new OTP record
    otp_record = AdminOTP(
        email=target_email,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(otp_record)
    db.commit()

    # Dispatch email
    sent, error_msg = send_admin_otp_email(otp_code, target_email)

    if not sent:
        return {
            "message": f"Could not deliver email to {target_email}. Reason: {error_msg}",
            "targetEmail": target_email,
            "emailDelivered": False,
            "deliveryError": error_msg,
        }

    return {
        "message": f"Administrator verification OTP has been sent to {target_email}. Please check your inbox.",
        "targetEmail": target_email,
        "emailDelivered": True,
        "deliveryError": None,
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already registered",
        )

    # Validate role
    role = (user_data.role or "student").lower()
    if role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role specified",
        )

    # If creating an administrator account, verify the OTP sent to sritalumni@gmail.com
    if role == "admin":
        if not user_data.otp or not user_data.otp.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Administrator OTP is required. Click 'Send OTP' to receive the verification code at {ADMIN_VERIFICATION_EMAIL}.",
            )

        otp_entry = db.query(AdminOTP).filter(
            AdminOTP.email == ADMIN_VERIFICATION_EMAIL,
            AdminOTP.otp_code == user_data.otp.strip(),
            AdminOTP.is_used == False,
            AdminOTP.expires_at >= datetime.utcnow(),
        ).first()

        if not otp_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid or expired OTP. Please request a new OTP sent to {ADMIN_VERIFICATION_EMAIL}.",
            )

        # Mark OTP as used
        otp_entry.is_used = True

    new_user = User(
        name=user_data.fullName,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        batch_year=user_data.batchYear,
        role=role,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error registering user. Please try again.",
        )

    # Return shape expected by Login.tsx: { message, token, user: { id, fullName, email, role } }
    token = _encode_token(new_user)
    return {
        "message": "Registered successfully",
        "token": token,
        "user": {
            "id": new_user.id,
            "fullName": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
        },
    }


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, str(user.password_hash or "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password",
        )

    # Return shape expected by Login.tsx: { token, user: { id, fullName, email, role } }
    return {
        "message": "Login successful",
        "token": _encode_token(user),
        "user": {
            "id": user.id,
            "fullName": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.post("/google")
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid login role")

    token_info = verify_google_token(payload.credential)
    email = token_info.get("email")
    google_id = token_info.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not provided by Google")

    # Check if user already exists by google_id or email
    user = None
    if google_id:
        user = db.query(User).filter(User.google_id == google_id).first()
    if not user and email:
        user = db.query(User).filter(User.email == email).first()

    # The verified institutional administrator email always has admin role
    is_institutional_admin = email.lower() == ADMIN_VERIFICATION_EMAIL.lower()
    target_role = "admin" if is_institutional_admin else payload.role

    if not user:
        # Create a new user for first-time Google sign-in
        if target_role == "admin" and not is_institutional_admin:
            if not payload.otp or not payload.otp.strip():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Administrator OTP is required. Click 'Send OTP' to receive the verification code at {ADMIN_VERIFICATION_EMAIL}.",
                )

            otp_entry = db.query(AdminOTP).filter(
                AdminOTP.email == ADMIN_VERIFICATION_EMAIL,
                AdminOTP.otp_code == payload.otp.strip(),
                AdminOTP.is_used == False,
                AdminOTP.expires_at >= datetime.utcnow(),
            ).first()

            if not otp_entry:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid or expired OTP. Please request a new OTP sent to {ADMIN_VERIFICATION_EMAIL}.",
                )

            otp_entry.is_used = True

        name = token_info.get("name") or email.split("@")[0]
        picture = token_info.get("picture")
        user = User(
            name=name,
            email=email,
            password_hash=None,
            role=target_role,
            photo_url=picture,
            google_id=google_id,
            auth_provider="google",
        )
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register Google user. Please try again.",
            )
    else:
        # User already exists
        updated = False
        if str(user.role) != "admin" and payload.role == "admin" and not is_institutional_admin:
            # Check if valid OTP was provided for admin elevation
            if not payload.otp or not payload.otp.strip():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Administrator OTP is required. Click 'Send OTP' to receive the verification code at {ADMIN_VERIFICATION_EMAIL}.",
                )

            otp_entry = db.query(AdminOTP).filter(
                AdminOTP.email == ADMIN_VERIFICATION_EMAIL,
                AdminOTP.otp_code == payload.otp.strip(),
                AdminOTP.is_used == False,
                AdminOTP.expires_at >= datetime.utcnow(),
            ).first()

            if not otp_entry:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid or expired OTP. Please request a new OTP sent to {ADMIN_VERIFICATION_EMAIL}.",
                )

            otp_entry.is_used = True
            user.role = "admin"
            updated = True

        if is_institutional_admin and str(user.role) != "admin":
            user.role = "admin"
            updated = True
        if google_id and not user.google_id:
            user.google_id = google_id
            updated = True
        if not user.photo_url and token_info.get("picture"):
            user.photo_url = token_info.get("picture")
            updated = True
        if updated:
            try:
                db.commit()
            except Exception:
                db.rollback()

    return {
        "message": "Login successful",
        "token": _encode_token(user),
        "user": {
            "id": user.id,
            "fullName": user.name,
            "email": user.email,
            "role": user.role,
            "photoUrl": user.photo_url,
        },
    }


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


@router.delete("/me", status_code=status.HTTP_200_OK)
@router.delete("/delete-account", status_code=status.HTTP_200_OK)
def delete_account_auth(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete authenticated user account (both student and admin accounts allowed)."""
    user_id = user.id
    user_email = user.email
    user_role = str(user.role)

    try:
        db.query(AdminOTP).filter(AdminOTP.email == user_email).delete()
    except Exception:
        pass

    db.delete(user)
    db.commit()

    return {
        "message": "Account successfully deleted",
        "deletedUserId": user_id,
        "email": user_email,
        "role": user_role,
    }
