"""
WSGI config for itam_backend project.

Configuración WSGI (Web Server Gateway Interface) para el proyecto ITAM.
Interfaz estándar para servidores web Python como Gunicorn o uWSGI.
Se usa en producción para conectar Django con el servidor web.

Expone el callable WSGI como una variable a nivel de módulo llamada ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'itam_backend.settings')

application = get_wsgi_application()
