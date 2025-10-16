from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    # ensure DRF can return a URL (use_url=True). The returned URL will be absolute if serializer has request in context.
    profile_image = serializers.ImageField(required=False, use_url=True)


    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'bio', 'occupation', 'profile_image']
