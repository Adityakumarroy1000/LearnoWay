from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    def ready(self):
        # import signals so post_save creates Profile on User create
        import users.signals  # noqa: F401
