"""
WSGI config for Web_Based_Animal_Bite_linic_System project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Web_Based_Animal_Bite_linic_System.settings')

application = get_wsgi_application()
