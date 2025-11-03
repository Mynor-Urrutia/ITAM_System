"""
Modelo de usuario personalizado para el sistema ITAM.

Este archivo define el modelo CustomUser que extiende AbstractUser de Django
para incluir campos adicionales específicos del negocio como departamento,
región, puesto y relación con empleados.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.masterdata.models import Region, Departamento  # Importaciones de datos maestros
from apps.employees.models import Employee

class CustomUser(AbstractUser):
    """
    Modelo de usuario personalizado que extiende AbstractUser de Django.

    Incluye campos adicionales para gestión organizacional y relación
    con el módulo de empleados. El campo is_active se sincroniza automáticamente
    con el campo status personalizado.
    """
    email = models.EmailField(unique=True)

    # Opciones de puesto de trabajo disponibles
    PUESTO_CHOICES = [
        ('Gerente', 'Gerente'), ('Coordinador', 'Coordinador'), ('Analista', 'Analista'),
        ('Técnico', 'Técnico'), ('Desarrollador', 'Desarrollador'), ('Soporte', 'Soporte'), ('Otro', 'Otro'),
    ]

    # Opciones de estado del usuario (afecta is_active automáticamente)
    STATUS_CHOICES = [
        ('Activo', 'Activo'), ('Inactivo', 'Inactivo'), ('Vacaciones', 'Vacaciones'), ('Licencia', 'Licencia'),
    ]

    # Campos adicionales específicos del negocio
    puesto = models.CharField(max_length=50, choices=PUESTO_CHOICES, blank=True, null=True, verbose_name="Puesto")

    # Relaciones con datos maestros (dinámicas, no choices fijos)
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users_in_departamento',  # Nombre único para evitar conflictos
        verbose_name="Departamento"
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users_in_region',
        verbose_name="Región"
    )

    # Estado del usuario (afecta automáticamente el campo is_active de Django)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Activo', verbose_name="Estado")

    # Relación opcional con el módulo de empleados
    employee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_account',
        verbose_name="Empleado Asociado"
    )

    def save(self, *args, **kwargs):
        """
        Sobreescribe el método save para sincronizar is_active con status.

        Cuando el status es 'Activo', el usuario puede iniciar sesión.
        Cuando el status es diferente, el usuario queda inactivo.
        """
        # Sincroniza el campo is_active de Django con nuestro campo status personalizado
        self.is_active = self.status == 'Activo'
        super().save(*args, **kwargs)

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="custom_user_set",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_permissions_set",
        related_query_name="custom_user",
    )

    def __str__(self):
        return self.username