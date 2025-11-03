"""
URLs para la aplicación de empleados del sistema ITAM.

Define las rutas API para gestión CRUD de empleados, incluyendo
filtrado de empleados disponibles para asignación a usuarios.
"""

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet

# Configuración del router para rutas REST automáticas
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)  # /api/employees/employees/

# URLs finales del módulo de empleados
urlpatterns = router.urls