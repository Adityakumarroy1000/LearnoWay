# api/serializers.py
from rest_framework import serializers
from .models import CourseCard

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCard
        fields = "__all__"   # includes name, description, video_link
