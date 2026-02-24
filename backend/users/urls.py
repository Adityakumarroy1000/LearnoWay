from django.urls import path
from .views import ProfileView, register, get_profile, verify_otp, resend_otp, send_delete_otp, confirm_delete_account, google_login, cleanup_buddy_orphans
from .views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path("register/", register, name="register"),
    path("google-login/", google_login, name="google_login"),
    path("get-profile/", get_profile),
    path("verify-otp/", verify_otp, name="verify_otp"),
    path("resend-otp/", resend_otp, name="resend_otp"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("send-delete-otp/", send_delete_otp),
    path("confirm-delete-account/", confirm_delete_account),
    path("cleanup-buddy-orphans/", cleanup_buddy_orphans),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



