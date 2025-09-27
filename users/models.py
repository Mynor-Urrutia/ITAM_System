from django.contrib.auth.models import AbstractUser
from django.db import models
from masterdata.models import Region, Departamento # Asegúrate de importar Departamento aquí también

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    PUESTO_CHOICES = [
        ('Gerente', 'Gerente'), ('Coordinador', 'Coordinador'), ('Analista', 'Analista'),
        ('Técnico', 'Técnico'), ('Desarrollador', 'Desarrollador'), ('Soporte', 'Soporte'), ('Otro', 'Otro'),
    ]
    # ELIMINA DEPARTAMENTO_CHOICES ya que será dinámico
    # DEPARTAMENTO_CHOICES = [
    #     ('TI', 'Tecnologías de la Información'), ('Recursos Humanos', 'Recursos Humanos'),
    #     ('Finanzas', 'Finanzas'), ('Marketing', 'Marketing'), ('Ventas', 'Ventas'),
    #     ('Operaciones', 'Operaciones'), ('Otro', 'Otro'),
    # ]
    STATUS_CHOICES = [
        ('Activo', 'Activo'), ('Inactivo', 'Inactivo'), ('Vacaciones', 'Vacaciones'), ('Licencia', 'Licencia'),
    ]

    puesto = models.CharField(max_length=50, choices=PUESTO_CHOICES, blank=True, null=True)
    # CAMBIADO: Ahora es una clave foránea a Departamento
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users_in_departamento' # Nombre de relación para evitar conflictos
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users_in_region'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Activo')

    def save(self, *args, **kwargs):
        # Sync is_active with status
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