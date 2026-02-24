import requests
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

FRIEND_SERVICE = "http://localhost:4000"


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # JWT payload
        token["userId"] = user.id
        token["email"] = user.email
        token["username"] = user.username
        token["fullName"] = user.get_full_name()

        # include avatar so friend-service can sync the profile when frontend
        # calls /users/sync using this JWT
        profile = getattr(user, "profile", None)
        avatar_url = (
            profile.profile_pic.url
            if profile and getattr(profile, "profile_pic", None)
            else None
        )
        token["avatar"] = avatar_url

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # ✅ SAFE profile picture → avatar
        profile = getattr(user, "profile", None)
        avatar_url = (
            profile.profile_pic.url
            if profile and getattr(profile, "profile_pic", None)
            else None
        )

        # ✅ SINGLE source of truth
        profile_data = {
            "userId": user.id,
            "email": user.email,
            "username": user.username,
            "fullName": user.get_full_name(),
            "avatar": avatar_url,
        }

        # 🔥 Sync user to friend-service
        try:
            requests.post(
                f"{FRIEND_SERVICE}/users/sync",
                json=profile_data,
                timeout=2,
            )
        except Exception:
            pass  # never break login

        # ✅ Attach user profile to login response
        data["user"] = profile_data

        return data
