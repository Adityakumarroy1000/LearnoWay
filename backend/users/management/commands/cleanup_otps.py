from django.core.management.base import BaseCommand
from django.utils.timezone import now
from datetime import timedelta
from users.models import OTPVerification

class Command(BaseCommand):
    help = "Delete expired OTPs (older than 5 minutes)"

    def handle(self, *args, **kwargs):
        expiry_time = now() - timedelta(minutes=5)
        deleted, _ = OTPVerification.objects.filter(created_at__lt=expiry_time).delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} expired OTP(s)."))
