from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import CourseCard, Path, Roadmap, SubMap, Resource
from .serializers import (
    CourseSerializer, PathSerializer,
    RoadmapSerializer, SubMapSerializer, ResourceSerializer
)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = CourseCard.objects.all().prefetch_related(
        'path_items__roadmaps__sub_maps__resources'
    )
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]


class PathViewSet(viewsets.ModelViewSet):
    queryset = Path.objects.all().prefetch_related('roadmaps__sub_maps__resources')
    serializer_class = PathSerializer
    permission_classes = [AllowAny]


class RoadmapViewSet(viewsets.ModelViewSet):
    queryset = Roadmap.objects.all().prefetch_related('sub_maps__resources')
    serializer_class = RoadmapSerializer
    permission_classes = [AllowAny]


class SubMapViewSet(viewsets.ModelViewSet):
    queryset = SubMap.objects.all().prefetch_related('resources')
    serializer_class = SubMapSerializer
    permission_classes = [AllowAny]


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [AllowAny]
