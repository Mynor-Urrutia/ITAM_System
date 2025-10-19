from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.masterdata.models import Region, Departamento
from apps.employees.models import Employee
from apps.employees.serializers import EmployeeSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar los IDs y nombres de los roles (grupos)
    role_ids = serializers.SerializerMethodField(read_only=True)
    role_names = serializers.SerializerMethodField(read_only=True)
    role_name = serializers.SerializerMethodField(read_only=True)  # Single role name for profile

    # Campo para las listas de permisos del usuario
    user_permissions = serializers.SerializerMethodField()
    permissions_count = serializers.SerializerMethodField(read_only=True)

    # Campo de escritura para asignar los roles (grupos) al usuario
    assigned_role_ids = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), source='groups', many=True, write_only=True, required=False, allow_null=True
    )

    # Campo de departamento y región
    departamento = serializers.PrimaryKeyRelatedField(
        queryset=Departamento.objects.all(), allow_null=True, required=False
    )
    departamento_name = serializers.CharField(source='departamento.name', read_only=True)
    region = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(), allow_null=True, required=False
    )
    region_name = serializers.CharField(source='region.name', read_only=True)
    employee = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), allow_null=True, required=False
    )
    employee_name = serializers.SerializerMethodField(read_only=True)
    employee_data = serializers.SerializerMethodField(read_only=True)

    # Activity counts
    audit_logs_count = serializers.SerializerMethodField(read_only=True)
    assets_count = serializers.SerializerMethodField(read_only=True)

    # Groups for profile display
    groups = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'puesto', 'departamento', 'departamento_name', 'region', 'region_name', 'employee', 'employee_name', 'employee_data',
            'status', 'is_staff', 'is_superuser', 'is_active', 'last_login', 'date_joined',
            'role_ids', 'role_names', 'role_name', 'assigned_role_ids', 'user_permissions', 'permissions_count',
            'audit_logs_count', 'assets_count', 'groups'
        )
        read_only_fields = ('role_ids', 'role_names', 'role_name', 'user_permissions', 'permissions_count', 'audit_logs_count', 'assets_count', 'groups')
        # Crucial: Oculta la contraseña al leer, la hace opcional y añade un mínimo de 8 caracteres
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8, 'required': False}}

    def get_role_ids(self, obj):
        return list(obj.groups.values_list('id', flat=True))

    def get_role_names(self, obj):
        return list(obj.groups.values_list('name', flat=True))

    def get_user_permissions(self, obj):
        return sorted(list(obj.get_all_permissions()))

    def get_role_name(self, obj):
        roles = list(obj.groups.values_list('name', flat=True))
        return roles[0] if roles else None

    def get_permissions_count(self, obj):
        return len(obj.get_all_permissions())

    def get_audit_logs_count(self, obj):
        from apps.masterdata.models import AuditLog
        return AuditLog.objects.filter(user=obj).count()

    def get_assets_count(self, obj):
        from apps.assets.models import Activo
        return Activo.objects.filter(assigned_to=obj, estado='activo').count()

    def get_groups(self, obj):
        return list(obj.groups.values('id', 'name'))

    def get_employee_name(self, obj):
        return str(obj.employee) if obj.employee else 'N/A'

    def get_employee_data(self, obj):
        if obj.employee:
            serializer = EmployeeSerializer(obj.employee)
            return serializer.data
        # Fallback: try to find employee by matching name
        try:
            from apps.employees.models import Employee
            # Try exact name match first
            employee = Employee.objects.filter(
                first_name__iexact=obj.first_name,
                last_name__iexact=obj.last_name
            ).first()

            # If no exact match, try partial name match
            if not employee:
                # Split user first_name and try to match with employee first_name
                user_first_names = obj.first_name.split()
                for first_name_part in user_first_names:
                    if len(first_name_part) > 2:  # Avoid matching very short names
                        employee = Employee.objects.filter(
                            first_name__icontains=first_name_part,
                            last_name__iexact=obj.last_name
                        ).first()
                        if employee:
                            break

            if employee:
                serializer = EmployeeSerializer(employee)
                return serializer.data
        except Exception:
            pass
        return None


    # MÉTODO CRUCIAL PARA LA CREACIÓN (HASHING)
    def create(self, validated_data):
        # 1. Extrae la contraseña y los grupos (roles)
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)

        # 2. Crea el usuario con el resto de los datos
        # Nota: Usamos create_user si es un CustomUser Manager, pero ModelSerializer por defecto llama a objects.create.
        user = User.objects.create(**validated_data)

        # 3. Cifra y guarda la contraseña si se proporcionó
        if password is not None:
            user.set_password(password) # ¡Cifrado de la contraseña!
            user.save()

        # 4. Asigna los grupos (roles)
        if groups is not None:
            user.groups.set(groups)

        return user

    # MÉTODO CRUCIAL PARA LA ACTUALIZACIÓN (HASHING)
    def update(self, instance, validated_data):
        # 1. Extrae la contraseña y los grupos
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)

        # 2. Actualiza todos los demás campos
        instance = super().update(instance, validated_data)

        # 3. Cifra y guarda la contraseña SOLO si se proporcionó en el payload
        if password is not None:
            instance.set_password(password) # ¡Cifrado de la contraseña!
            instance.save()

        # 4. Actualiza los grupos
        if groups is not None:
            instance.groups.set(groups)

        return instance

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    assigned_role_ids = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), source='groups', many=True, write_only=True, required=False, allow_null=True
    )
    # Campo de departamento para registro (recibe ID)
    departamento = serializers.PrimaryKeyRelatedField(
        queryset=Departamento.objects.all(),
        allow_null=True,
        required=False
    )
    # Campo de región para registro (recibe ID)
    region = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(),
        allow_null=True,
        required=False
    )
    employee = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        allow_null=True,
        required=False
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
            'departamento', # <-- Para enviar el ID del departamento
            'region',       # <-- Para enviar el ID de la región
            'employee',     # <-- Para enviar el ID del empleado
            'status',
            'assigned_role_ids',
            'is_staff',
            'is_superuser',
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        groups_data = validated_data.pop('groups', None)
        is_staff_val = validated_data.pop('is_staff', False)
        is_superuser_val = validated_data.pop('is_superuser', False)
        # Los campos `departamento` y `region` ya contienen los objetos de BD
        # porque son PrimaryKeyRelatedField. No necesitas hacer pop y reasignar,
        # solo asegúrate de que se pasen al create_user.
        
        # Modificación: No es necesario hacer pop de 'departamento' y 'region'
        # para luego asignarlos, ya están en validated_data como objetos.
        # Simplemente pasa validated_data directamente.
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            puesto=validated_data.get('puesto'),
            departamento=validated_data.get('departamento'), # Se pasa directamente el objeto
            region=validated_data.get('region'),             # Se pasa directamente el objeto
            employee=validated_data.get('employee'),         # Se pasa directamente el objeto
            status=validated_data.get('status', 'Activo'),
            is_staff=is_staff_val,
            is_superuser=is_superuser_val,
        )

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
            'contenttypes': 'Permisos del Sistema',
        }
        return app_labels_map.get(obj.content_type.app_label, obj.content_type.app_label.replace('_', ' ').title())

    def get_action_type(self, obj):
        # Special handling for custom permissions
        if obj.codename == 'view_api_docs':
            return 'View API Docs'
        elif obj.codename == 'view_reports':
            return 'View Reports'

        # Default handling for standard permissions
        parts = obj.codename.split('_')
        if len(parts) > 0:
            action = parts[0].capitalize()
            # Handle multi-word actions
            if len(parts) > 1 and parts[1] in ['api', 'reports']:
                action += f' {parts[1].capitalize()}'
            return action
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