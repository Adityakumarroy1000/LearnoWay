# api/urls.py
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet
from django.urls import path
from . import views
router = DefaultRouter()
router.register(r'courses', CourseViewSet)   # <-- only 'courses'

urlpatterns = router.urls
