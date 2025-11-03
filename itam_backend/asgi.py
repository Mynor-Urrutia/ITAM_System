"""
ASGI config for itam_backend project.

Configuración ASGI (Asynchronous Server Gateway Interface) para el proyecto ITAM.
Permite el despliegue con servidores asíncronos como Daphne para mejor rendimiento
en aplicaciones que requieren conexiones en tiempo real.

Expone el callable ASGI como una variable a nivel de módulo llamada ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'itam_backend.settings')

application = get_asgi_application()
