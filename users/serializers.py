# C:\Proyectos\ITAM_System\itam_backend\users\serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar el ID y nombre del rol (grupo principal)
    role_id = serializers.SerializerMethodField(read_only=True)
    role_name = serializers.SerializerMethodField(read_only=True)
    
    # NUEVO: Campo para las listas de permisos del usuario
    user_permissions = serializers.SerializerMethodField()
    
    # Campo de escritura para asignar el rol (grupo) al usuario
    # Espera una lista de IDs de grupo (aunque en el frontend enviaremos solo uno)
    assigned_role_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), source='groups', many=True, write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'puesto', 'departamento', 'region',
            'status',
            'is_active',
            # --- ¡CAMPOS AÑADIDOS! ---
            'is_staff',       # Permite acceso al admin de Django y uso con IsAdminUser en DRF
            'is_superuser',   # Otorga todos los permisos
            # ------------------------
            'role_id', 'role_name',
            'assigned_role_id',
            'user_permissions',
            'password', 
        ]
        read_only_fields = ['id', 'user_permissions']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            # Asegura que is_staff e is_superuser sean read_only si no quieres que se puedan editar directamente
            # Si quieres que se puedan editar, remueve estas líneas:
            # 'is_staff': {'read_only': True}, 
            # 'is_superuser': {'read_only': True}
        }

    # Sobreescribir el init para manejar el 'username' como read-only en edición
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance: # Si es una instancia existente (edición)
            self.fields['username'].read_only = True
            # Password es manejado por extra_kwargs, pero si fuera necesario aquí también:
            # self.fields['password'].required = False


    def get_role_id(self, obj):
        # Retorna el ID del primer grupo al que pertenece el usuario
        return obj.groups.first().id if obj.groups.exists() else None

    def get_role_name(self, obj):
        # Retorna el nombre del primer grupo al que pertenece el usuario
        return obj.groups.first().name if obj.groups.exists() else 'Sin Rol'

    def get_user_permissions(self, obj):
        """
        Retorna una lista de todas las 'codenames' de los permisos que el usuario tiene,
        tanto los asignados directamente como los heredados de sus grupos.
        """
        if not obj.is_active:
            return []

        # Usar get_all_permissions para obtener todos los permisos incluyendo los de grupos
        all_permissions = obj.get_all_permissions()
        return sorted(list(all_permissions))

    def update(self, instance, validated_data):
        groups_data = validated_data.pop('groups', None)
        password = validated_data.pop('password', None) # Extraer la contraseña
        
        # Primero actualizamos los campos directos del usuario, incluyendo is_staff e is_superuser
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password: # Si se proporcionó una nueva contraseña
            instance.set_password(password)
            
        instance.save()

        # Luego asignamos los grupos (roles)
        if groups_data is not None: # Si se envió información de grupos
            instance.groups.set(groups_data) # Asigna los grupos al usuario

        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # Permite asignar un rol al registrar un usuario
    assigned_role_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), source='groups', many=True, write_only=True, required=False, allow_null=True
    )

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
            'assigned_role_id', # <-- Agregado para el registro
            # --- ¡CAMPOS AÑADIDOS PARA REGISTRO! ---
            'is_staff',
            'is_superuser',
            # -------------------------------------
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Captura el rol/grupo si se envió
        groups_data = validated_data.pop('groups', None)
        
        # --- ¡CAPTURA LOS NUEVOS CAMPOS! ---
        is_staff_val = validated_data.pop('is_staff', False)
        is_superuser_val = validated_data.pop('is_superuser', False)
        # -----------------------------------

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
            # --- ¡ASIGNA LOS NUEVOS CAMPOS AL CREAR EL USUARIO! ---
            is_staff=is_staff_val,
            is_superuser=is_superuser_val,
            # ---------------------------------------------------
        )

        # Asigna el rol al usuario si se proporcionó
        if groups_data:
            user.groups.set(groups_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"new_password": "Las nuevas contraseñas no coinciden."})
        return data

class PermissionSerializer(serializers.ModelSerializer):
    model_name = serializers.SerializerMethodField()
    app_label_display = serializers.SerializerMethodField()
    action_type = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = ('id', 'name', 'codename', 'content_type', 'model_name', 'app_label_display', 'action_type')

    def get_model_name(self, obj):
        return obj.content_type.model_class().__name__ if obj.content_type.model_class() else obj.content_type.model

    def get_app_label_display(self, obj):
        app_labels_map = {
            'auth': 'Autenticación y Roles',
            'users': 'Usuarios del Sistema',
            'admin': 'Administración',
        }
        return app_labels_map.get(obj.content_type.app_label, obj.content_type.app_label.replace('_', ' ').title())

    def get_action_type(self, obj):
        parts = obj.codename.split('_')
        if len(parts) > 0:
            return parts[0].capitalize()
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
        # You can add user details to the token if you still need them here for quick access
        # but for sensitive permissions, relying on /users/me/ is more secure.
        # token['is_staff'] = user.is_staff
        # token['is_superuser'] = user.is_superuser
        # token['username'] = user.username # Example
        return token