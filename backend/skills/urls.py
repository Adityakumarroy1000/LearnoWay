from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    PathViewSet,
    RoadmapViewSet,
    SubMapViewSet,
    ResourceViewSet
)

# Create a router to auto-generate routes
router = DefaultRouter()
router.register('courses', CourseViewSet, basename='courses')
router.register('paths', PathViewSet, basename='paths')
router.register('roadmaps', RoadmapViewSet, basename='roadmaps')
router.register('submaps', SubMapViewSet, basename='submaps')
router.register('resources', ResourceViewSet, basename='resources')

urlpatterns = [
    path('', include(router.urls)),  # include all generated routes
]
