import os
from django.apps import AppConfig


class SkillsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'skills'

    def ready(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        if username and password:
            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(
                    username=username,
                    password=password
                )
                print(f"Superuser '{username}' created automatically")
