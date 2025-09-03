# api/views.py
from rest_framework import viewsets
from .models import Course
from .serializers import CourseSerializer
from django.shortcuts import render

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
