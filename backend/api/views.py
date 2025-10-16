# api/views.py
from rest_framework import viewsets
from .models import CourseCard
from .serializers import CourseSerializer
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny


@permission_classes([AllowAny])
class CourseViewSet(viewsets.ModelViewSet):
    queryset = CourseCard.objects.all()
    serializer_class = CourseSerializer
    
