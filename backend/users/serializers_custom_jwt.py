import os
import requests
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

FRIEND_SERVICE = os.getenv("FRIEND_SERVICE_URL", "http://localhost:4000")


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @staticmethod
    def _safe_avatar_url(user):
        profile = getattr(user, "profile", None)
        avatar_field = getattr(profile, "profile_image", None) if profile else None
        if not avatar_field:
            return None
        try:
            return avatar_field.url
        except Exception:
            return None

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["userId"] = user.id
        token["email"] = user.email
        token["username"] = user.username
        token["fullName"] = user.get_full_name()
        token["avatar"] = cls._safe_avatar_url(user)

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        profile_data = {
            "userId": user.id,
            "email": user.email,
            "username": user.username,
            "fullName": user.get_full_name(),
            "avatar": self._safe_avatar_url(user),
        }

        try:
            requests.post(
                f"{FRIEND_SERVICE}/users/sync",
                json=profile_data,
                timeout=2,
            )
        except Exception:
            pass

        data["user"] = profile_data
        return data
