"""
URLs para la aplicación de usuarios del sistema ITAM.

Define todas las rutas API para:
- CRUD completo de usuarios
- Gestión de roles y permisos
- Cambio de contraseñas
- Obtención del usuario actual
"""

from django.urls import path
from .views import (
    UserListCreateAPIView,
    UserRetrieveUpdateDestroyAPIView,
    CurrentUserView,  # Para obtener el usuario autenticado
    RoleListCreateAPIView,
    RoleRetrieveUpdateDestroyAPIView,
    PermissionListAPIView,
    ChangeUserPasswordView,
)

urlpatterns = [
    # CRUD completo de usuarios
    path('users/', UserListCreateAPIView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyAPIView.as_view(), name='user-detail'),
    path('users/me/', CurrentUserView.as_view(), name='current-user'),  # Usuario autenticado actual

    # Gestión de roles (grupos de permisos)
    path('roles/', RoleListCreateAPIView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleRetrieveUpdateDestroyAPIView.as_view(), name='role-detail'),

    # Lista de permisos disponibles
    path('permissions/', PermissionListAPIView.as_view(), name='permission-list'),

    # Cambio de contraseña
    path('users/<int:pk>/change-password/', ChangeUserPasswordView.as_view(), name='user-change-password'),
]