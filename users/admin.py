# C:\Proyectos\ITAM_System\itam_backend\users\admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser # Asegúrate de importar CustomUser

class CustomUserAdmin(UserAdmin):
    # Esto te permite ver más campos en la lista de usuarios en el admin
    list_display = UserAdmin.list_display + ('puesto', 'departamento', 'region', 'status',)

    # Reemplaza 'is_active' con 'status' en list_filter
    list_filter = ('is_staff', 'is_superuser', 'status', 'groups')

    # Esto te permite editar más campos al editar un usuario existente
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('puesto', 'departamento', 'region', 'status',)}),
    )

    # Esto te permite añadir los campos cuando creas un usuario nuevo desde el admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('puesto', 'departamento', 'region', 'status',)}),
    )

admin.site.register(CustomUser, CustomUserAdmin)

# Si ya tenías tu CustomUser registrado de otra forma, asegúrate de que esté usando CustomUserAdmin