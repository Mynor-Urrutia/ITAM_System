# C:\Proyectos\ITAM_System\users\views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
# Importa get_user_model para obtener tu CustomUser
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission # Importa Group y Permission
from .permissions import IsActiveUser # ¡Importa tu permiso personalizado!

# Obtiene tu CustomUser
User = get_user_model()

# Importa tus serializadores
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer,
    PermissionSerializer, RoleSerializer
)

# ... Tus vistas existentes (RegisterView, LoginView, UserListCreateView, UserDetailView, ChangeUserPasswordView) ...

# Vista para el login (TokenObtainPairView ya maneja esto, pero si tienes una personalizada, asegúrate que devuelva los datos)
# Si estás usando TokenObtainPairView de simplejwt, no necesitas esta LoginView personalizada.
# La dejaremos comentada si usas la de simplejwt en urls.py
# class LoginView(APIView):
#     permission_classes = (permissions.AllowAny,)

#     def post(self, request, *args, **kwargs):
#         username = request.data.get('username')
#         password = request.data.get('password')
#         user = User.objects.filter(username=username).first() # Usa tu CustomUser

#         if user and user.check_password(password):
#             if user.status != 'Activo':
#                 return Response(
#                     {'error': 'Tu cuenta no está activa. Contacta al administrador.'},
#                     status=status.HTTP_403_FORBIDDEN
#                 )

#             refresh = RefreshToken.for_user(user)
#             # Aquí deberías devolver solo los tokens, y el frontend hará otra petición para los datos del usuario
#             return Response({
#                 'access': str(refresh.access_token),
#                 'refresh': str(refresh),
#                 # No devuelvas los datos del usuario aquí si el frontend va a hacer una petición a /users/me/
#             })
#         return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)


# Vistas para el CRUD de usuarios
class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    # === ¡CAMBIA ESTO! ===
    permission_classes = [permissions.IsAdminUser, IsActiveUser] # Añade IsActiveUser
    # ====================

class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, IsActiveUser] # Añade IsActiveUser

# Vista para obtener los detalles del usuario autenticado
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsActiveUser] # Añade IsActiveUser

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# Vistas para CRUD de Roles (usando Group)
class RoleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Group.objects.all().order_by('name')
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, IsActiveUser] # Añade IsActiveUser

class RoleRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, IsActiveUser] # Añade IsActiveUser

# Vista para listar todos los permisos disponibles de Django
class PermissionListAPIView(generics.ListAPIView):
    queryset = Permission.objects.all().order_by('codename')
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, IsActiveUser] # Añade IsActiveUser

# Vista para cambiar la contraseña de un usuario
class ChangeUserPasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsActiveUser] # Añade IsActiveUser

    def post(self, request, pk, *args, **kwargs):
        try:
            user_to_change = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Lógica de permisos para cambiar contraseña:
        # - Un superusuario puede cambiar la contraseña de cualquier usuario.
        # - Un usuario normal solo puede cambiar su propia contraseña.
        if not request.user.is_superuser and request.user.pk != user_to_change.pk:
            return Response({'detail': 'No tienes permiso para cambiar la contraseña de este usuario.'},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_password = serializer.validated_data['new_password']
        user_to_change.set_password(new_password)
        user_to_change.save()

        return Response({'detail': 'Contraseña actualizada exitosamente.'}, status=status.HTTP_200_OK)
