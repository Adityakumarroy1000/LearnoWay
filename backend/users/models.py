from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta
from django.utils.timezone import now


class OTPVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.otp}"

    def is_valid(self):
        """Check if OTP is still valid (5 minutes)."""
        return now() <= self.created_at + timedelta(minutes=5)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Consider not duplicating first_name/last_name from User — but keeping for now
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    profile_image = models.ImageField(upload_to="profiles/", default="profiles/default.png")

    def __str__(self):
        return self.user.username
