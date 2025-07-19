# C:\Proyectos\ITAM_System\itam_backend\users\serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role_id = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'puesto', 'departamento', 'region',
            'status',      # <-- Tu campo 'status' se mantiene y se expone
            'is_active',   # <-- El campo 'is_active' de Django también se expone
            'role_id', 'role_name'
        ]
        read_only_fields = ['id']

    def get_role_id(self, obj):
        return obj.groups.first().id if obj.groups.exists() else None

    def get_role_name(self, obj):
        return obj.groups.first().name if obj.groups.exists() else 'Sin Rol'

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
            # Puedes añadir otros campos aquí si quieres que se establezcan en el registro
            'puesto',
            'departamento',
            'region',
            'status', # Puedes permitir establecer el status inicial
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
            status=validated_data.get('status', 'Activo'), # Establece el status inicial
            # is_active se establece en True por defecto por create_user
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
    class Meta:
        model = Permission
        fields = ('id', 'name', 'codename', 'content_type')

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