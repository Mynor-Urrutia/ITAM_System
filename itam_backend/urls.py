"""
URLs principales del proyecto ITAM.

Este archivo define todas las rutas URL del backend Django.
Incluye rutas para:
- Panel de administración de Django
- Endpoints de autenticación JWT
- APIs de todas las aplicaciones (users, masterdata, assets, employees)
"""

# C:\Proyectos\ITAM_System\itam_backend\itam_backend\urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
# from django.conf.urls.static import static
from django.http import HttpResponse
from django.views.static import serve
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,  # Opcional: para verificar tokens
)
# Importa la vista base TokenObtainPairView
from rest_framework_simplejwt.views import TokenObtainPairView
# Importa tu serializer personalizado
from apps.users.serializers import CustomTokenObtainPairSerializer


# Definición de todas las rutas URL del proyecto
urlpatterns = [
    path('admin/', admin.site.urls),  # Panel de administración de Django

    # Endpoints de autenticación JWT
    path('api/login/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    path('api/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # APIs de las aplicaciones del sistema ITAM
    path('api/', include('apps.users.urls')),        # Gestión de usuarios y roles
    path('api/masterdata/', include('apps.masterdata.urls')),  # Datos maestros (catálogos)
    path('api/assets/', include('apps.assets.urls')),          # Gestión de activos
    path('api/employees/', include('apps.employees.urls')),    # Gestión de empleados
]
