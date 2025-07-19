# C:\Proyectos\ITAM_System\itam_backend\users\urls.py

from django.urls import path
from .views import (
    UserListCreateAPIView,
    UserRetrieveUpdateDestroyAPIView,
    CurrentUserView, # Para /api/users/me/
    RoleListCreateAPIView,
    RoleRetrieveUpdateDestroyAPIView,
    PermissionListAPIView,
    ChangeUserPasswordView,
    # Si tienes una RegisterView personalizada y la usas
    # RegisterView,
)

urlpatterns = [
    # Rutas para el CRUD de usuarios
    path('users/', UserListCreateAPIView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyAPIView.as_view(), name='user-detail'),
    path('users/me/', CurrentUserView.as_view(), name='current-user'), # Ruta para obtener el usuario actual

    # Rutas para CRUD de Roles
    path('roles/', RoleListCreateAPIView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleRetrieveUpdateDestroyAPIView.as_view(), name='role-detail'),

    # Ruta para listar permisos
    path('permissions/', PermissionListAPIView.as_view(), name='permission-list'),

    # Ruta para cambiar contraseña de usuario
    path('users/<int:pk>/change-password/', ChangeUserPasswordView.as_view(), name='user-change-password'),

    # Si usas una RegisterView personalizada
    # path('register/', RegisterView.as_view(), name='register'),
]