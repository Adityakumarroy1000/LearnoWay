from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
import random
from django.core.mail import send_mail
from .models import OTPVerification, Profile
from django.utils import timezone
from datetime import timedelta
from .serializers import ProfileSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers_custom_jwt import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser


# helper (no decorator)
def generate_and_send_otp(user):
    otp_code = str(random.randint(100000, 999999))
    OTPVerification.objects.create(user=user, otp=otp_code)

    send_mail(
        "Verify your account",
        f"Your OTP is {otp_code}. It will expire in 5 minutes.",
        "your_email@gmail.com",  # replace with your email
        [user.email],
        fail_silently=False,
    )

    return otp_code


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
