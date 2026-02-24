from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
import random
import json
import secrets
from django.core.mail import EmailMultiAlternatives
from django.core.files.base import ContentFile
from .models import OTPVerification, Profile
from django.utils import timezone
from datetime import timedelta
from .serializers import ProfileSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers_custom_jwt import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser
from urllib.parse import urlencode
from urllib.request import Request, urlopen


from .models import DeleteAccountOTP
from .utils import generate_otp


import os
import shutil
from django.conf import settings

FRIEND_SERVICE = "http://localhost:4000"
BRAND_NAME = "LearnoWay"



# helper (no decorator)
def _email_sender():
    return getattr(settings, "DEFAULT_FROM_EMAIL", None) or getattr(settings, "EMAIL_HOST_USER", None)


def _render_branded_email(title, subtitle, otp_code, action_label):
    text = (
        f"{BRAND_NAME}\n\n"
        f"{title}\n"
        f"{subtitle}\n\n"
        f"{action_label}: {otp_code}\n\n"
        "This OTP is valid for 5 minutes.\n"
        "If you did not request this, please ignore this email."
    )

    html = f"""
    <div style="margin:0;padding:24px;background:#f4f7fb;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;background:#0f172a;color:#ffffff;">
            <div style="font-size:22px;font-weight:700;letter-spacing:.2px;">{BRAND_NAME}</div>
            <div style="margin-top:4px;font-size:13px;color:#cbd5e1;">Smarter learning, every day</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;">{title}</h2>
            <p style="margin:0 0 18px;color:#334155;font-size:14px;line-height:1.6;">{subtitle}</p>
            <div style="margin:0 0 10px;font-size:13px;color:#475569;text-transform:uppercase;letter-spacing:.7px;">{action_label}</div>
            <div style="display:inline-block;padding:14px 18px;border:1px dashed #2563eb;background:#eff6ff;border-radius:10px;font-size:28px;font-weight:700;letter-spacing:7px;color:#1e40af;">
              {otp_code}
            </div>
            <p style="margin:18px 0 0;color:#475569;font-size:13px;line-height:1.6;">
              This code expires in <strong>5 minutes</strong>. If this wasn't you, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">
            © {BRAND_NAME} • Secure account communication
          </td>
        </tr>
      </table>
    </div>
    """

    return text, html


def _send_branded_otp_email(recipient, subject, title, subtitle, otp_code, action_label):
    text_body, html_body = _render_branded_email(
        title=title,
        subtitle=subtitle,
        otp_code=otp_code,
        action_label=action_label,
    )
    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=_email_sender(),
        to=[recipient],
    )
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)


def generate_and_send_otp(user):
    otp_code = str(random.randint(100000, 999999))
    OTPVerification.objects.create(user=user, otp=otp_code)

    _send_branded_otp_email(
        recipient=user.email,
        subject=f"{BRAND_NAME} • Verify Your Account",
        title="Verify your email address",
        subtitle="Use the one-time code below to complete your LearnoWay sign-up.",
        otp_code=otp_code,
        action_label="Verification code",
    )

    return otp_code


def _issue_tokens_for_user(user):
    refresh = CustomTokenObtainPairSerializer.get_token(user)
    access = refresh.access_token

    profile = getattr(user, "profile", None)
    avatar_url = (
        profile.profile_image.url
        if profile and getattr(profile, "profile_image", None)
        else None
    )
    return {
        "refresh": str(refresh),
        "access": str(access),
        "user_id": user.id,
        "user": {
            "userId": user.id,
            "email": user.email,
            "username": user.username,
            "fullName": user.get_full_name(),
            "avatar": avatar_url,
        },
    }


def _verify_google_id_token(id_token):
    query = urlencode({"id_token": id_token})
    req = Request(
        f"https://oauth2.googleapis.com/tokeninfo?{query}",
        headers={"User-Agent": "lms-backend/1.0"},
    )
    with urlopen(req, timeout=5) as resp:
        payload = json.loads(resp.read().decode("utf-8", errors="ignore"))

    if payload.get("error_description") or payload.get("error"):
        raise ValueError("Invalid Google token")

    aud = payload.get("aud")
    client_id = getattr(settings, "GOOGLE_CLIENT_ID", "") or ""
    if client_id and aud != client_id:
        raise ValueError("Token audience mismatch")

    email = (payload.get("email") or "").strip().lower()
    if not email:
        raise ValueError("Google account email missing")
    if payload.get("email_verified") not in ("true", True):
        raise ValueError("Google email not verified")

    return payload


def _save_google_profile_image(profile, picture_url, username):
    if not picture_url:
        return
    try:
        req = Request(
            picture_url,
            headers={"User-Agent": "lms-backend/1.0"},
        )
        with urlopen(req, timeout=5) as resp:
            data = resp.read()
        if not data:
            return
        safe_username = "".join(ch for ch in (username or "user") if ch.isalnum() or ch in {"_", "-"})
        filename = f"google_{safe_username or 'user'}.jpg"
        profile.profile_image.save(filename, ContentFile(data), save=True)
    except Exception:
        # Never block auth on avatar fetch failure.
        return


def _cleanup_friend_service_user(authorization_header):
    if not authorization_header:
        return

    try:
        req = Request(
            f"{FRIEND_SERVICE}/users/me",
            method="DELETE",
            headers={
                "Authorization": authorization_header,
                "User-Agent": "lms-backend/1.0",
            },
        )
        with urlopen(req, timeout=5):
            return
    except Exception:
        # Never block account deletion if friend-service is unavailable.
        return


def _prune_friend_service_orphans(authorization_header):
    if not authorization_header:
        return None

    valid_user_ids = list(User.objects.values_list("id", flat=True))
    payload = json.dumps({"validUserIds": valid_user_ids}).encode("utf-8")

    try:
        req = Request(
            f"{FRIEND_SERVICE}/users/prune-orphans",
            data=payload,
            method="POST",
            headers={
                "Authorization": authorization_header,
                "Content-Type": "application/json",
                "User-Agent": "lms-backend/1.0",
            },
        )
        with urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8", errors="ignore").strip()
            if not body:
                return {"message": "Cleanup completed"}
            return json.loads(body)
    except Exception:
        return None


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_active = False
        user.save()

        # profile should be created by signal, but create_or_get just in case
        Profile.objects.get_or_create(user=user)

        generate_and_send_otp(user)

        return Response({"message": "User registered. Check your email for OTP."}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    id_token = (request.data.get("id_token") or "").strip()
    requested_username = (request.data.get("username") or "").strip()

    if not id_token:
        return Response({"error": "id_token is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payload = _verify_google_id_token(id_token)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    email = (payload.get("email") or "").strip().lower()
    given_name = (payload.get("given_name") or "").strip()
    family_name = (payload.get("family_name") or "").strip()
    picture = (payload.get("picture") or "").strip()
    suggested = (payload.get("name") or email.split("@")[0] or "user").replace(" ", "").lower()

    user = User.objects.filter(email=email).first()
    if user:
        profile, _ = Profile.objects.get_or_create(user=user)
        if given_name and not user.first_name:
            user.first_name = given_name
        if family_name and not user.last_name:
            user.last_name = family_name
        if given_name or family_name:
            user.save(update_fields=["first_name", "last_name"])
        profile_updates = []
        if given_name and not profile.first_name:
            profile.first_name = given_name
            profile_updates.append("first_name")
        if family_name and not profile.last_name:
            profile.last_name = family_name
            profile_updates.append("last_name")
        if profile_updates:
            profile.save(update_fields=profile_updates)
        if picture and not str(getattr(profile, "profile_image", "")):
            _save_google_profile_image(profile, picture, user.username)
        return Response(_issue_tokens_for_user(user), status=status.HTTP_200_OK)

    if not requested_username:
        return Response(
            {
                "needs_username": True,
                "email": email,
                "suggested_username": suggested,
                "first_name": given_name,
                "last_name": family_name,
                "picture": picture,
            },
            status=status.HTTP_200_OK,
        )

    if User.objects.filter(username=requested_username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=requested_username,
        email=email,
        password=secrets.token_urlsafe(32),
    )
    user.first_name = given_name
    user.last_name = family_name
    user.is_active = True
    user.save()

    profile, _ = Profile.objects.get_or_create(user=user)
    profile_updates = []
    if given_name:
        profile.first_name = given_name
        profile_updates.append("first_name")
    if family_name:
        profile.last_name = family_name
        profile_updates.append("last_name")
    if profile_updates:
        profile.save(update_fields=profile_updates)
    if picture:
        _save_google_profile_image(profile, picture, requested_username)

    return Response(_issue_tokens_for_user(user), status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    try:
        user = User.objects.get(email=email)
        latest_otp = OTPVerification.objects.filter(user=user).latest("created_at")

        if timezone.now() - latest_otp.created_at > timedelta(minutes=5):
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        if latest_otp.otp == otp:
            user.is_active = True
            user.save()
            return Response({"message": "Account verified successfully!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except OTPVerification.DoesNotExist:
        return Response({"error": "No OTP found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_otp(request):
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email)
        generate_and_send_otp(user)
        return Response({"message": "New OTP sent."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# lightweight get-profile that returns username/email (keeps older endpoint working)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    return Response({"username": user.username, "email": user.email})


# Use standard TokenObtainPair endpoint but with our serializer
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ProfileView that returns full profile (creates if missing)
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        # pass request context so ImageField(use_url=True) can produce absolute URL
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            # return serializer with context to ensure image URL is absolute
            return Response(ProfileSerializer(profile, context={'request': request}).data)
        return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cleanup_buddy_orphans(request):
    if not request.user.is_staff:
        return Response({"error": "Admin access required"}, status=403)

    result = _prune_friend_service_orphans(request.META.get("HTTP_AUTHORIZATION"))
    if result is None:
        return Response(
            {"error": "Buddy system cleanup failed"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(result, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_delete_otp(request):
    user = request.user


    # ⛔ RATE LIMIT: 1 OTP per minute
    recent = DeleteAccountOTP.objects.filter(
        user=user,
        created_at__gte=timezone.now() - timedelta(minutes=5)
    ).exists()

    if recent:
        return Response(
            {"error": "Please wait 5 minute before requesting another OTP"},
            status=429
        )

    
    # delete old OTPs
    DeleteAccountOTP.objects.filter(user=user).delete()

    otp = generate_otp()

    DeleteAccountOTP.objects.create(user=user, otp=otp)

    _send_branded_otp_email(
        recipient=user.email,
        subject=f"{BRAND_NAME} • Confirm Account Deletion",
        title="Confirm your account deletion request",
        subtitle="We received a request to permanently delete your LearnoWay account.",
        otp_code=otp,
        action_label="Deletion confirmation code",
    )

    return Response({"detail": "OTP sent successfully"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_delete_account(request):
    user = request.user
    otp = request.data.get("otp")

    if not otp:
        return Response({"error": "OTP required"}, status=400)

    otp_record = DeleteAccountOTP.objects.filter(
        user=user, otp=otp
    ).first()

    if not otp_record:
        return Response({"error": "Invalid OTP"}, status=400)

    if otp_record.is_expired():
        otp_record.delete()
        return Response({"error": "OTP expired"}, status=400)

    # 🔥 DELETE USER FILES
    # Profile image
    if hasattr(user, "profile") and user.profile.profile_image:
        try:
            user.profile.profile_image.delete(save=False)
        except Exception:
            pass

    # 🔥 DELETE USER MEDIA FOLDER (OPTIONAL BUT RECOMMENDED)
    user_media_path = os.path.join(
        settings.MEDIA_ROOT, "users", str(user.id)
    )

    if os.path.exists(user_media_path):
        shutil.rmtree(user_media_path, ignore_errors=True)

    # 🔥 DELETE OTP RECORDS
    DeleteAccountOTP.objects.filter(user=user).delete()


    refresh = request.data.get("refresh")
    if refresh:
        try:
            RefreshToken(refresh).blacklist()
        except Exception:
            pass

    # 🔥 DELETE USER (CASCADE EVERYTHING)
    _cleanup_friend_service_user(request.META.get("HTTP_AUTHORIZATION"))
    user.delete()

    return Response({"detail": "Account deleted successfully"})
