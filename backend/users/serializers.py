from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    # Return a safe URL only when the file exists (important for ephemeral storage in cloud deploys).
    profile_image = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    def get_profile_image(self, obj):
        image = getattr(obj, "profile_image", None)
        if not image:
            return None
        try:
            image_name = image.name
            if not image_name or not image.storage.exists(image_name):
                return None
            image_url = image.url
        except Exception:
            return None

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(image_url)
        return image_url

    class Meta:
        model = Profile
        fields = ['username', 'email', 'first_name', 'last_name', 'bio', 'occupation', 'profile_image']
