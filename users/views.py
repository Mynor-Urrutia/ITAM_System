from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
# Importa get_user_model para obtener tu CustomUser
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission # Importa Group y Permission
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
import json
from .permissions import IsActiveUser # ¡Importa tu permiso personalizado!
# Asume que CustomUser está importado o definido en models.py
from rest_framework.permissions import IsAuthenticated
from masterdata.models import AuditLog

# Obtiene tu CustomUser
User = get_user_model()

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5  # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 200

def serialize_model_data(instance):
    """Serialize model instance data to JSON-compatible format."""
    # Exclude fields that contain model instances (ManyToMany, ForeignKey objects)
    exclude_fields = []
    if hasattr(instance, 'groups'):
        exclude_fields.append('groups')
    if hasattr(instance, 'user_permissions'):
        exclude_fields.append('user_permissions')
    if hasattr(instance, 'permissions'):
        exclude_fields.append('permissions')  # Exclude permissions from Group model
    if hasattr(instance, 'password'):
        exclude_fields.append('password')  # Don't log passwords

    data = model_to_dict(instance, exclude=exclude_fields)

    # Replace foreign key IDs with names for better readability in audit logs
    if hasattr(instance, 'employee') and instance.employee:
        data['employee'] = str(instance.employee)

    return json.loads(json.dumps(data, cls=DjangoJSONEncoder))

def get_changed_fields(old_data, new_data):
    """Return only the fields that changed between old_data and new_data."""
    if not old_data or not new_data:
        return old_data or new_data or {}

    changed = {}
    all_keys = set(old_data.keys()) | set(new_data.keys())

    for key in all_keys:
        old_value = old_data.get(key)
        new_value = new_data.get(key)
        if old_value != new_value:
            changed[key] = {
                'old': old_value,
                'new': new_value
            }

    return changed

# Importa tus serializadores
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer,
    PermissionSerializer, RoleSerializer
)

# Vistas para el CRUD de usuarios
class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions, IsActiveUser]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        instance = serializer.save()
        content_type = ContentType.objects.get_for_model(instance)
        AuditLog.objects.create(
            activity_type='CREATE',
            description=f"CREATE User: {instance}",
            user=self.request.user,
            content_type=content_type,
            object_id=instance.pk,
            old_data=None,
            new_data=serialize_model_data(instance)
        )

class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions, IsActiveUser]

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = serialize_model_data(old_instance)
        instance = serializer.save()
        new_data = serialize_model_data(instance)
        changed_fields = get_changed_fields(old_data, new_data)
        content_type = ContentType.objects.get_for_model(instance)
        AuditLog.objects.create(
            activity_type='UPDATE',
            description=f"UPDATE User: {instance}",
            user=self.request.user,
            content_type=content_type,
            object_id=instance.pk,
            old_data=old_data,
            new_data=changed_fields  # Store only changed fields
        )

    def perform_destroy(self, instance):
        old_data = serialize_model_data(instance)
        content_type = ContentType.objects.get_for_model(instance)
        AuditLog.objects.create(
            activity_type='DELETE',
            description=f"DELETE User: {instance}",
            user=self.request.user,
            content_type=content_type,
            object_id=instance.pk,
            old_data=old_data,
            new_data=None
        )
        super().perform_destroy(instance)

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
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions, IsActiveUser]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        instance = serializer.save()
        content_type = ContentType.objects.get_for_model(instance)
        AuditLog.objects.create(
            activity_type='CREATE',
            description=f"CREATE Role: {instance}",
            user=self.request.user,
            content_type=content_type,
            object_id=instance.pk,
            old_data=None,
            new_data=serialize_model_data(instance)
        )

class RoleRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions, IsActiveUser]

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = serialize_model_data(old_instance)
        instance = serializer.save()
        new_data = serialize_model_data(instance)
        changed_fields = get_changed_fields(old_data, new_data)
        content_type = ContentType.objects.get_for_model(instance)
        AuditLog.objects.create(
            activity_type='UPDATE',
            description=f"UPDATE Role: {instance}",
            user=self.request.user,
            content_type=content_type,
            object_id=instance.pk,
            old_data=old_data,
            new_data=changed_fields  # Store only changed fields
        )

    def perform_destroy(self, instance):
        old_data = serialize_model_data(instance)
        content_type = ContentType.objects.get_for_model(instance)
        AuditLog.objects.create(
            activity_type='DELETE',
            description=f"DELETE Role: {instance}",
            user=self.request.user,
            content_type=content_type,
            object_id=instance.pk,
            old_data=old_data,
            new_data=None
        )
        super().perform_destroy(instance)

# Vista para listar todos los permisos disponibles de Django
class PermissionListAPIView(generics.ListAPIView):
    queryset = Permission.objects.all().order_by('codename')
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions, IsActiveUser]
    pagination_class = None  # Disable pagination for permissions to show all

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

        # Log the password change
        old_data = serialize_model_data(user_to_change)
        user_to_change.set_password(new_password)
        user_to_change.save()
        new_data = serialize_model_data(user_to_change)
        # For password changes, only show that password was changed
        changed_fields = {'password': {'old': '[HIDDEN]', 'new': '[CHANGED]'}}
        content_type = ContentType.objects.get_for_model(user_to_change)
        AuditLog.objects.create(
            activity_type='UPDATE',
            description=f"UPDATE User Password: {user_to_change}",
            user=request.user,
            content_type=content_type,
            object_id=user_to_change.pk,
            old_data=old_data,
            new_data=changed_fields
        )

        return Response({'detail': 'Contraseña actualizada exitosamente.'}, status=status.HTTP_200_OK)

# *** ¡ELIMINA LA SIGUIENTE VISTA! Ya no la necesitas. ***
# class RoleChoicesView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request, *args, **kwargs):
#         role_choices = [choice[0] for choice in CustomUser.ROL_CHOICES]
#         return Response(role_choices, status=status.HTTP_200_OK)