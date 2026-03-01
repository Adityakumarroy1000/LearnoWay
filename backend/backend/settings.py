"""
Django settings for backend project.
"""

import os
import importlib.util
from pathlib import Path
from urllib.parse import unquote, urlparse
from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv()


def get_bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def get_list_env(name: str, default: list[str] | None = None) -> list[str]:
    value = os.getenv(name, "")
    if not value:
        return default or []
    return [item.strip() for item in value.split(",") if item.strip()]


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

ENVIRONMENT = os.getenv("DJANGO_ENV", "development").strip().lower()
DEBUG = get_bool_env("DEBUG", default=ENVIRONMENT != "production")
IS_PRODUCTION = not DEBUG

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if IS_PRODUCTION:
        raise ImproperlyConfigured("SECRET_KEY is required in production.")
    SECRET_KEY = "dev-only-insecure-secret-change-me"

ALLOWED_HOSTS = get_list_env(
    "ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1"],
)


# Application definition

INSTALLED_APPS = [
    'adminlte3',
    'adminlte3_theme',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    "corsheaders",
    "rest_framework",
    'rest_framework_simplejwt',
    "api",
    "users.apps.UsersConfig",
    'nested_admin',
    "skills",
    'friends',
]

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "").strip()
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "").strip()
USE_CLOUDINARY = all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET])
CLOUDINARY_PACKAGES_READY = (
    importlib.util.find_spec("cloudinary_storage") is not None
    and importlib.util.find_spec("cloudinary") is not None
)
if IS_PRODUCTION and USE_CLOUDINARY and not CLOUDINARY_PACKAGES_READY:
    raise ImproperlyConfigured(
        "Cloudinary env vars are set but cloudinary packages are missing. "
        "Install 'cloudinary' and 'django-cloudinary-storage'."
    )

if USE_CLOUDINARY and CLOUDINARY_PACKAGES_READY:
    INSTALLED_APPS += [
        "cloudinary_storage",
        "cloudinary",
    ]


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    )
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # default
    'users.backends.EmailBackend',  # custom backend
]


EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend" if DEBUG else "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = get_bool_env("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "LearnoWay <no-reply@learnoway.local>")
EMAIL_TIMEOUT = int(os.getenv("EMAIL_TIMEOUT", "15"))


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = get_list_env(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:8080", "http://127.0.0.1:8080"],
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = get_list_env(
    "CSRF_TRUSTED_ORIGINS",
    default=["http://localhost:8080", "http://127.0.0.1:8080"],
)

ROOT_URLCONF = 'backend.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL:
    parsed_db = urlparse(DATABASE_URL)
    db_scheme = parsed_db.scheme.split("+", 1)[0]

    if db_scheme not in {"postgres", "postgresql"}:
        raise ImproperlyConfigured("DATABASE_URL must use a PostgreSQL scheme for production deployments.")

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": unquote(parsed_db.path.lstrip("/")),
            "USER": unquote(parsed_db.username or ""),
            "PASSWORD": unquote(parsed_db.password or ""),
            "HOST": parsed_db.hostname or "",
            "PORT": str(parsed_db.port or "5432"),
            "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "60")),
            "OPTIONS": {
                "sslmode": os.getenv("DB_SSLMODE", "require"),
            },
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')


# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

if USE_CLOUDINARY and CLOUDINARY_PACKAGES_READY:
    CLOUDINARY_STORAGE = {
        "CLOUD_NAME": CLOUDINARY_CLOUD_NAME,
        "API_KEY": CLOUDINARY_API_KEY,
        "API_SECRET": CLOUDINARY_API_SECRET,
        "SECURE": True,
    }
    STORAGES["default"] = {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    }
    # Keep MEDIA_URL local-style; Cloudinary storage backend generates full CDN URLs.
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / "media"
    # Compatibility for packages still checking the legacy setting.
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
else:
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / "media"





# settings.py
SIMPLE_JWT = {
    "UPDATE_LAST_LOGIN": True,
}

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

if IS_PRODUCTION:
    SECURE_SSL_REDIRECT = get_bool_env("SECURE_SSL_REDIRECT", default=True)
    SESSION_COOKIE_SECURE = get_bool_env("SESSION_COOKIE_SECURE", default=True)
    CSRF_COOKIE_SECURE = get_bool_env("CSRF_COOKIE_SECURE", default=True)
    SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = get_bool_env("SECURE_HSTS_INCLUDE_SUBDOMAINS", default=True)
    SECURE_HSTS_PRELOAD = get_bool_env("SECURE_HSTS_PRELOAD", default=True)
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
