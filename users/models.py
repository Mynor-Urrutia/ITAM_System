# C:\Proyectos\ITAM_System\itam_backend\users\models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    # === ¡ASEGÚRATE DE QUE LAS CHOICES ESTÉN DEFINIDAS AQUÍ! ===
    PUESTO_CHOICES = [
        ('Gerente', 'Gerente'),
        ('Coordinador', 'Coordinador'),
        ('Analista', 'Analista'),
        ('Técnico', 'Técnico'),
        ('Desarrollador', 'Desarrollador'),
        ('Soporte', 'Soporte'),
        ('Otro', 'Otro'),
    ]
    DEPARTAMENTO_CHOICES = [
        ('TI', 'Tecnologías de la Información'),
        ('Recursos Humanos', 'Recursos Humanos'),
        ('Finanzas', 'Finanzas'),
        ('Marketing', 'Marketing'),
        ('Ventas', 'Ventas'),
        ('Operaciones', 'Operaciones'),
        ('Otro', 'Otro'),
    ]
    REGION_CHOICES = [
        ('Norte', 'Norte'),
        ('Centro', 'Centro'),
        ('Sur', 'Sur'),
        ('Este', 'Este'),
        ('Oeste', 'Oeste'),
        ('Nacional', 'Nacional'),
        ('Internacional', 'Internacional'),
        ('Otro', 'Otro'),
    ]
    STATUS_CHOICES = [
        ('Activo', 'Activo'),
        ('Inactivo', 'Inactivo'),
        ('Vacaciones', 'Vacaciones'),
        ('Licencia', 'Licencia'),
    ]
    # =========================================================

    puesto = models.CharField(max_length=50, choices=PUESTO_CHOICES, blank=True, null=True)
    departamento = models.CharField(max_length=50, choices=DEPARTAMENTO_CHOICES, blank=True, null=True)
    region = models.CharField(max_length=50, choices=REGION_CHOICES, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Activo')

    # Las definiciones de groups y user_permissions con related_name deben ir aquí
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