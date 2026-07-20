"""
Django settings for Web_Based_Animal_Bite_linic_System project.
"""

from pathlib import Path
import os
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

# ============================================
# SECURITY: Load from .env — never commit secrets
# ============================================

SECRET_KEY = config('SECRET_KEY')

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='http://localhost:5173,http://localhost:8080', cast=Csv())

# Application definition

INSTALLED_APPS = [
    'daphne',  # MUST be first for ASGI WebSocket support
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'channels',
    # Local apps
    'accounts',
    'patients',
    'cases',
    'vaccinations',
    'inventory',
    'reports',
    'audit_logs',
    'dashboard',
    'appointments',
    'chat',
    'chatbot',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'audit_logs.middleware.AuditLogMiddleware',
]

ROOT_URLCONF = 'Web_Based_Animal_Bite_linic_System.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Web_Based_Animal_Bite_linic_System.wsgi.application'

# Database
# ---------------------------------------------------------------------------
# Default: SQLite (zero config for development).
# To switch to PostgreSQL, set the DB_* env vars and change DB_ENGINE to
#   django.db.backends.postgresql
# ---------------------------------------------------------------------------
_db_name = config('DB_NAME', default=os.path.join(BASE_DIR, 'db.sqlite3'))
# Safety net: if DB_NAME is set to empty in .env, fall back to default SQLite path
if not _db_name:
    _db_name = os.path.join(BASE_DIR, 'db.sqlite3')

DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': _db_name,
        'USER': config('DB_USER', default=''),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default=''),
        'PORT': config('DB_PORT', default=''),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Manila'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ASGI / Channels Configuration
# ---------------------------------------------------------------------------
ASGI_APPLICATION = 'Web_Based_Animal_Bite_linic_System.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# CORS Configuration
# ---------------------------------------------------------------------------
# In production, set CORS_ALLOWED_ORIGINS in .env to the frontend domain(s).
# For Render deployments, include https://your-app.onrender.com and the
# Vercel/Netlify frontend URL(s).
# ---------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173,http://localhost:8080', cast=Csv())
CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        # BrowsableAPIRenderer is disabled in production as a defence-in-depth
        # measure: it never runs for JSON Accept headers, but disabling it
        # reduces the attack surface for CSRF-via-cookie scenarios.
    ] if not DEBUG else [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DATETIME_FORMAT': '%Y-%m-%d %H:%M:%S',
    'DATE_FORMAT': '%Y-%m-%d',
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
}

# Email Configuration
# ---------------------------------------------------------------------------
# For development you can use the console backend (emails are printed to the
# terminal). Set EMAIL_BACKEND in .env to 'django.core.mail.backends.smtp.EmailBackend'
# and provide the host/port/credentials when you have SMTP credentials.
# ---------------------------------------------------------------------------
EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend',
)
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config(
    'DEFAULT_FROM_EMAIL',
    default='Animal Bite Clinic <noreply@animalbiteclinic.com>',
)

# ============================================
# SECURITY HEADERS
# ============================================
# X_FRAME_OPTIONS — prevents clickjacking by forbidding the page from being
# rendered in a frame/iframe on a different origin. Default from Django's
# XFrameOptionsMiddleware is 'DENY', which is correct; setting it explicitly.
X_FRAME_OPTIONS = 'DENY'

# SECURE_CONTENT_TYPE_NOSNIFF — instructs the browser to trust the declared
# Content-Type headers rather than MIME-sniffing, mitigating drive-by download
# attacks.
SECURE_CONTENT_TYPE_NOSNIFF = True

# SECURE_REFERRER_POLICY — controls how much referrer information is sent with
# cross-origin requests. 'same-origin' keeps the full URL for same-origin
# requests but sends nothing cross-origin.
SECURE_REFERRER_POLICY = 'same-origin'

# ============================================
# HTTPS / PRODUCTION SECURITY
# ============================================
# The settings below are safe defaults for local dev (no HTTPS).
# On Render, set the following in .env / Render environment variables:
#   SECURE_SSL_REDIRECT=True
#   SESSION_COOKIE_SECURE=True
#   CSRF_COOKIE_SECURE=True
#   SECURE_HSTS_SECONDS=31536000
#   SECURE_HSTS_INCLUDE_SUBDOMAINS=True
#   SECURE_HSTS_PRELOAD=True
# ---------------------------------------------------------------------------

# SECURE_SSL_REDIRECT — redirects all HTTP requests to HTTPS.
# Render handles TLS at the edge (proxy), so this should be True in production.
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)

# SECURE_PROXY_SSL_HEADER — tells Django it is behind an HTTPS-terminating
# proxy (Render, Cloudflare, Nginx). Without this, SECURE_SSL_REDIRECT can
# cause infinite redirect loops because Django sees HTTP from the proxy.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# SESSION_COOKIE_SECURE — the session cookie is only sent over HTTPS.
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=False, cast=bool)

# CSRF_COOKIE_SECURE — the CSRF cookie is only sent over HTTPS.
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=False, cast=bool)

# HTTP Strict Transport Security (HSTS) — tells browsers to always use HTTPS.
# Set SECURE_HSTS_SECONDS to 31536000 (1 year) in production.
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=0, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=False, cast=bool)
SECURE_HSTS_PRELOAD = config('SECURE_HSTS_PRELOAD', default=False, cast=bool)
