from django.urls import path
from .views import send_friend_request

urlpatterns = [
    path("friends/request/", send_friend_request),
]
