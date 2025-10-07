from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

class Command(BaseCommand):
    help = 'Create predefined roles with specific permissions'

    def handle(self, *args, **options):
        # Create custom permissions if they don't exist
        # Get or create a content type for the Permission model itself
        permission_content_type = ContentType.objects.get_for_model(Permission)

        # Create view_reports permission
        Permission.objects.get_or_create(
            codename='view_reports',
            name='Can view reports',
            content_type=permission_content_type
        )

        # Define roles and their permissions
        roles_permissions = {
            'Administrador': [
                # All permissions for masterdata
                'add_region', 'change_region', 'delete_region', 'view_region',
                'add_finca', 'change_finca', 'delete_finca', 'view_finca',
                'add_departamento', 'change_departamento', 'delete_departamento', 'view_departamento',
                'add_area', 'change_area', 'delete_area', 'view_area',
                'add_tipoactivo', 'change_tipoactivo', 'delete_tipoactivo', 'view_tipoactivo',
                'add_marca', 'change_marca', 'delete_marca', 'view_marca',
                'add_modeloactivo', 'change_modeloactivo', 'delete_modeloactivo', 'view_modeloactivo',
                # All permissions for users and roles
                'add_customuser', 'change_customuser', 'delete_customuser', 'view_customuser',
                'add_group', 'change_group', 'delete_group', 'view_group',
                'add_permission', 'change_permission', 'delete_permission', 'view_permission',
            ],
            'Gestor de Datos Maestros': [
                # View and edit masterdata
                'add_region', 'change_region', 'view_region',
                'add_finca', 'change_finca', 'view_finca',
                'add_departamento', 'change_departamento', 'view_departamento',
                'add_area', 'change_area', 'view_area',
                'add_tipoactivo', 'change_tipoactivo', 'view_tipoactivo',
                'add_marca', 'change_marca', 'view_marca',
                'add_modeloactivo', 'change_modeloactivo', 'view_modeloactivo',
            ],
            'Visualizador de Datos Maestros': [
                # Only view masterdata
                'view_region', 'view_finca', 'view_departamento', 'view_area',
                'view_tipoactivo', 'view_marca', 'view_modeloactivo',
            ],
            'Gestor de Usuarios': [
                # Manage users
                'add_customuser', 'change_customuser', 'view_customuser',
                'view_group',  # Can view roles
            ],
            'Gestor de Roles': [
                # Manage roles and permissions
                'add_group', 'change_group', 'delete_group', 'view_group',
                'view_permission',
            ],
            'Técnico de IT': [
                # All permissions for assets management
                'add_activo', 'change_activo', 'delete_activo', 'view_activo',
                # All permissions for maintenance
                'add_maintenance', 'change_maintenance', 'delete_maintenance', 'view_maintenance',
                # All permissions for assignments
                'add_assignment', 'change_assignment', 'delete_assignment', 'view_assignment',
                # All permissions for employees
                'add_employee', 'change_employee', 'delete_employee', 'view_employee',
                # Custom permissions for reports (to be created if needed)
                'view_reports',
            ],
            'Analistas': [
                # All permissions for assets management
                'add_activo', 'change_activo', 'delete_activo', 'view_activo',
                # All permissions for maintenance
                'add_maintenance', 'change_maintenance', 'delete_maintenance', 'view_maintenance',
                # All permissions for assignments
                'add_assignment', 'change_assignment', 'delete_assignment', 'view_assignment',
                # All permissions for employees
                'add_employee', 'change_employee', 'delete_employee', 'view_employee',
                # Custom permissions for reports
                'view_reports',
            ],
            'Gestor de Activos': [
                # Only CRUD permissions for assets management
                'add_activo', 'change_activo', 'delete_activo', 'view_activo',
            ],
        }

        for role_name, perm_codenames in roles_permissions.items():
            group, created = Group.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(f'Created role: {role_name}')
            else:
                self.stdout.write(f'Role {role_name} already exists, updating permissions')

            permissions = Permission.objects.filter(codename__in=perm_codenames)
            group.permissions.set(permissions)
            self.stdout.write(f'Assigned {permissions.count()} permissions to {role_name}')

        self.stdout.write(self.style.SUCCESS('Successfully set up roles and permissions'))