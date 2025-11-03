#!/usr/bin/env python
"""
Django's command-line utility for administrative tasks.

Este script es el punto de entrada para ejecutar comandos de Django como:
- runserver: Inicia el servidor de desarrollo
- migrate: Aplica cambios en la base de datos
- createsuperuser: Crea un administrador
- makemigrations: Crea archivos de migración
- shell: Abre una shell interactiva de Django
- test: Ejecuta las pruebas
"""
import os
import sys


def main():
    """
    Función principal que ejecuta las tareas administrativas de Django.

    Configura el módulo de settings como 'settings' (sin prefijo itam_backend)
    y ejecuta el comando solicitado desde línea de comandos.
    Maneja errores de importación si Django no está disponible.
    """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
