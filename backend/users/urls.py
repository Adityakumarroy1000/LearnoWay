from django.urls import path
from .views import ProfileView, register, get_profile, verify_otp, resend_otp
from .views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path("register/", register, name="register"),
    path("get-profile/", get_profile),
    path("verify-otp/", verify_otp, name="verify_otp"),
    path("resend-otp/", resend_otp, name="resend_otp"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



