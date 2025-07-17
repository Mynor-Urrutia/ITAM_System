# C:\Proyectos\ITAM_System\itam_backend\users\views.py

from rest_framework import generics, permissions, status # 'status' es importante para las respuestas HTTP
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
# ¡MODIFICA ESTA LÍNEA PARA INCLUIR ChangePasswordSerializer!
from .serializers import UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer
# Las siguientes dos líneas están bien, solo asegúrate de que estén separadas de la importación de serializadores
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

# Vista para el registro de usuarios
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,) # Cualquiera puede registrarse
    serializer_class = UserRegistrationSerializer

# Vista para el login
class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = CustomUser.objects.filter(username=username).first()

        if user and user.check_password(password):
            # *** ASEGÚRATE QUE ESTA LÍNEA ES CORRECTA ***
            if user.status != 'Activo': # <--- ¡Aquí es donde debe verificar TU CAMPO 'status'!
                return Response(
                    {'error': 'Tu cuenta no está activa. Contacta al administrador.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            # *** Y ASEGÚRATE DE NO ESTAR VERIFICANDO user.is_active en algún otro lugar aquí ***

            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'puesto': user.puesto,
                'departamento': user.departamento,
                'region': user.region,
                'status': user.status, # Asegúrate de que el status enviado aquí sea el correcto también
            })
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
# Vistas para el CRUD de usuarios (Listar, Crear, Ver Detalle, Actualizar)
# Se recomienda usar ModelViewSet para simplificar, pero si ya tienes generics.ListCreateAPIView
# y generics.RetrieveUpdateDestroyAPIView, asegúrate de que usen UserSerializer.

class UserListCreateView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated] # Solo usuarios autenticados pueden ver/crear

    # Opcional: Filtrar para que los usuarios no administradores solo vean su propio perfil
    # def get_queryset(self):
    #     if self.request.user.is_staff or self.request.user.is_superuser:
    #         return CustomUser.objects.all()
    #     return CustomUser.objects.filter(id=self.request.user.id)


class UserDetailView(generics.RetrieveUpdateAPIView): # Usamos RetrieveUpdateAPIView para permitir ver y actualizar
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated] # Solo autenticados pueden ver/actualizar

    # Opcional: Asegurar que un usuario solo pueda ver/editar su propio perfil a menos que sea admin
    # def get_queryset(self):
    #     if self.request.user.is_staff or self.request.user.is_superuser:
    #         return CustomUser.objects.all()
    #     return CustomUser.objects.filter(id=self.request.user.id)

class ChangeUserPasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Solo usuarios autenticados pueden usar esto

    def post(self, request, pk, *args, **kwargs):
        try:
            user_to_change = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Solo un superusuario o el propio usuario puede cambiar su contraseña
        # if not request.user.is_superuser and request.user != user_to_change:
        #     return Response({'detail': 'No tienes permiso para cambiar la contraseña de este usuario.'},
        #                     status=status.HTTP_403_FORBIDDEN)

        # Para este caso, asumimos que solo los administradores podrán cambiar la contraseña de otros.
        # Si quieres que cualquier usuario pueda cambiar la suya, necesitarías otra lógica.
        if not request.user.is_superuser:
             return Response({'detail': 'Solo los administradores pueden cambiar contraseñas de otros usuarios.'},
                             status=status.HTTP_403_FORBIDDEN)


        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_password = serializer.validated_data['new_password']
        user_to_change.set_password(new_password) # Django hashea la contraseña
        user_to_change.save()

        return Response({'detail': 'Contraseña actualizada exitosamente.'}, status=status.HTTP_200_OK)
