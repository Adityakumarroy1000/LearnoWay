from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.CourseViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name='course-list'),
    path('courses/<int:pk>/', views.CourseViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='course-detail'),
]
