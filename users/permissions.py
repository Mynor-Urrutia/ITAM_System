# C:\Proyectos\ITAM_System\users\permissions.py
from rest_framework import permissions

class IsActiveUser(permissions.BasePermission):
    """
    Custom permission to only allow active users access to protected views.
    """
    message = 'Tu cuenta ha sido deshabilitada y no puedes acceder a este recurso.'

    def has_permission(self, request, view):
        # === ¡CAMBIA ESTO! ===
        return request.user and request.user.is_authenticated and request.user.is_active # Ahora verifica 'is_active'
        # =====================