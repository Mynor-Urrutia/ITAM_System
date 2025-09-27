from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

class Command(BaseCommand):
    help = 'Create predefined roles with specific permissions'

    def handle(self, *args, **options):
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