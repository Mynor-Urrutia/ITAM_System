# C:\Proyectos\ITAM_System\itam_backend\users\serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role_id = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()
    # NUEVO: Campo para las listas de permisos del usuario
    user_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'puesto', 'departamento', 'region',
            'status',
            'is_active',
            'role_id', 'role_name',
            'user_permissions', # NUEVO: Incluye este campo en la salida
        ]
        read_only_fields = ['id', 'user_permissions'] # user_permissions es de solo lectura

    def get_role_id(self, obj):
        return obj.groups.first().id if obj.groups.exists() else None

    def get_role_name(self, obj):
        return obj.groups.first().name if obj.groups.exists() else 'Sin Rol'

    # NUEVO: Método para obtener todos los permisos del usuario
    def get_user_permissions(self, obj):
        """
        Retorna una lista de todas las 'codenames' de los permisos que el usuario tiene,
        tanto los asignados directamente como los heredados de sus grupos.
        Ejemplo: ['auth.view_group', 'users.view_customuser']
        """
        if not obj.is_active:
            return []

        # Obtener permisos directamente asignados al usuario
        direct_permissions = obj.user_permissions.values_list('content_type__app_label', 'codename')
        direct_permissions = [f"{app_label}.{codename}" for app_label, codename in direct_permissions]

        # Obtener permisos de los grupos a los que pertenece el usuario
        group_permissions = []
        for group in obj.groups.all():
            for perm in group.permissions.all():
                group_permissions.append(f"{perm.content_type.app_label}.{perm.codename}")

        # Combinar y eliminar duplicados usando un set para eficiencia
        all_permissions = set(direct_permissions + group_permissions)
        return sorted(list(all_permissions)) # Retorna como una lista ordenada


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'puesto',
            'departamento',
            'region',
            'status',
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            puesto=validated_data.get('puesto'),
            departamento=validated_data.get('departamento'),
            region=validated_data.get('region'),
            status=validated_data.get('status', 'Activo'),
        )
        return user

class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"new_password": "Las nuevas contraseñas no coinciden."})
        return data

class PermissionSerializer(serializers.ModelSerializer):
    # NUEVO: Campo para obtener el nombre legible del modelo (e.g., 'Group', 'User')
    model_name = serializers.SerializerMethodField()
    # NUEVO: Campo para obtener el nombre legible de la aplicación (e.g., 'Auth', 'Users')
    app_label_display = serializers.SerializerMethodField()
    # NUEVO: Campo para obtener la acción (e.g., 'add', 'change', 'delete', 'view')
    action_type = serializers.SerializerMethodField()


    class Meta:
        model = Permission
        fields = ('id', 'name', 'codename', 'content_type', 'model_name', 'app_label_display', 'action_type')

    def get_model_name(self, obj):
        # Retorna el nombre legible del modelo asociado al permiso
        # Ej: para 'auth.add_group', devuelve 'Group'
        # para 'users.view_customuser', devuelve 'Custom user'
        return obj.content_type.model_class().__name__ if obj.content_type.model_class() else obj.content_type.model

    def get_app_label_display(self, obj):
        # Esto usará el app_label, pero podemos personalizarlo aquí si es necesario
        # Por ejemplo, 'auth' -> 'Autenticación', 'users' -> 'Usuarios'
        app_labels_map = {
            'auth': 'Autenticación y Roles',
            'users': 'Usuarios del Sistema',
            'admin': 'Administración',
            # Añade más si tienes otras apps con permisos
        }
        return app_labels_map.get(obj.content_type.app_label, obj.content_type.app_label.replace('_', ' ').title())

    def get_action_type(self, obj):
        # Extrae el tipo de acción (add, change, delete, view) del codename
        # asumiendo un formato 'app.action_model' o 'app.action'
        parts = obj.codename.split('_')
        if len(parts) > 0:
            return parts[0].capitalize() # Capitaliza la primera palabra (Add, Change, Delete, View)
        return ''

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)

    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        write_only=True,
        source='permissions'
    )

    class Meta:
        model = Group
        fields = ('id', 'name', 'permissions', 'permission_ids')
        read_only_fields = ('permissions',)

    def create(self, validated_data):
        permission_ids = validated_data.pop('permissions', [])
        role = Group.objects.create(**validated_data)
        role.permissions.set(permission_ids)
        return role

    def update(self, instance, validated_data):
        permission_ids = validated_data.pop('permissions', None)
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        if permission_ids is not None:
            instance.permissions.set(permission_ids)
        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        if not user.is_active:
            raise serializers.ValidationError(
                {"detail": "Tu cuenta ha sido deshabilitada. Contacta al administrador."}
            )
        token = super().get_token(user)
        return token