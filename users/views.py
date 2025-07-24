from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
# Importa get_user_model para obtener tu CustomUser
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission # Importa Group y Permission
from .permissions import IsActiveUser # ¡Importa tu permiso personalizado!
# Asume que CustomUser está importado o definido en models.py
from rest_framework.permissions import IsAuthenticated

# Obtiene tu CustomUser
User = get_user_model()

# Importa tus serializadores
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer,
    PermissionSerializer, RoleSerializer
)

# Vistas para el CRUD de usuarios
class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser, IsActiveUser]

class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, IsActiveUser]

# Vista para obtener los detalles del usuario autenticado
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsActiveUser]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# Vistas para CRUD de Roles (usando Group)
# Esta vista ya devuelve los objetos de grupo con ID y nombre
class RoleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Group.objects.all().order_by('name')
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, IsActiveUser]

class RoleRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, IsActiveUser]

# Vista para listar todos los permisos disponibles de Django
class PermissionListAPIView(generics.ListAPIView):
    queryset = Permission.objects.all().order_by('codename')
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, IsActiveUser]

# Vista para cambiar la contraseña de un usuario
class ChangeUserPasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsActiveUser]

    def post(self, request, pk, *args, **kwargs):
        try:
            user_to_change = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.is_superuser and request.user.pk != user_to_change.pk:
            return Response({'detail': 'No tienes permiso para cambiar la contraseña de este usuario.'},
                             status=status.HTTP_403_FORBIDDEN)

        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_password = serializer.validated_data['new_password']
        user_to_change.set_password(new_password)
        user_to_change.save()

        return Response({'detail': 'Contraseña actualizada exitosamente.'}, status=status.HTTP_200_OK)

# *** ¡ELIMINA LA SIGUIENTE VISTA! Ya no la necesitas. ***
# class RoleChoicesView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request, *args, **kwargs):
#         role_choices = [choice[0] for choice in CustomUser.ROL_CHOICES]
#         return Response(role_choices, status=status.HTTP_200_OK)