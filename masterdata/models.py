# itam_backend/masterdata/models.py

from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict

class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Región"
        verbose_name_plural = "Regiones"
        ordering = ['name']

    def __str__(self):
        return self.name

class Finca(models.Model):
    name = models.CharField(max_length=100, unique=True)
    # foreign key a Region
    region = models.ForeignKey(
        Region,
        on_delete=models.SET_NULL, # Si la región se elimina, la finca no se elimina, su region se pone a NULL
        null=True,                # Permite que la región sea nula (una finca puede no estar asignada inicialmente)
        blank=True,               # Permite que el campo esté vacío en formularios
        related_name='fincas'    # Permite acceder a fincas desde una región (ej: region.fincas.all())
    )
    address = models.CharField(max_length=255, blank=True, null=True)
    # Otros campos que necesites para Finca

    class Meta:
        verbose_name = "Finca"
        verbose_name_plural = "Fincas"
        ordering = ['name']

    def __str__(self):
        return self.name


class Departamento(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Departamento")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción") # <--- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ AQUÍ

    class Meta:
        verbose_name = "Departamento"
        verbose_name_plural = "Departamentos"
        ordering = ['name']

    def __str__(self):
        return self.name

class Area(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre del Área")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    # ForeignKey a Departamento:
    # on_delete=models.CASCADE significa que si un departamento es borrado, todas sus áreas también lo serán.
    # related_name='areas' permite acceder a las áreas desde un departamento (ej: departamento.areas.all())
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.CASCADE,
        related_name='areas',
        verbose_name="Departamento al que pertenece"
    )

    class Meta:
        verbose_name = "Área"
        verbose_name_plural = "Áreas"
        # Asegura que no haya dos áreas con el mismo nombre dentro del mismo departamento
        unique_together = ('name', 'departamento')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.departamento.name})"
    
class TipoActivo(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tipo de Activo"
        verbose_name_plural = "Tipos de Activos"

    def __str__(self):
        return self.name

class Marca(models.Model):
    name = models.CharField(max_length=255, unique=True) 
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"
        ordering = ['name']
        
    def __str__(self):
        return self.name

class ModeloActivo(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Nombre del Modelo")

    # FK a Marca
    marca = models.ForeignKey(
        'Marca',
        on_delete=models.PROTECT,
        related_name='modelos_activo',
        verbose_name="Marca"
    )

    # FK a TipoActivo
    tipo_activo = models.ForeignKey(
        'TipoActivo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='modelos_activo',
        verbose_name="Tipo de Activo"
    )

    # Campos comunes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Campos para Equipo de Computo (computadora, laptop, desktop, servidor, All in one)
    procesador = models.CharField(max_length=150, blank=True, null=True, verbose_name="Procesador")
    ram = models.IntegerField(verbose_name="Memoria RAM (GB)", blank=True, null=True)
    almacenamiento = models.CharField(max_length=100, blank=True, null=True, verbose_name="Almacenamiento")
    tarjeta_grafica = models.CharField(max_length=150, blank=True, null=True, verbose_name="Tarjeta Gráfica")
    wifi = models.BooleanField(default=False, verbose_name="WIFI")
    ethernet = models.BooleanField(default=False, verbose_name="Ethernet")

    # Campos para Equipos de Red (switch, routers, firewall, AP Wifi, P2P)
    puertos_ethernet = models.CharField(max_length=50, blank=True, null=True, verbose_name="Puertos Ethernet")
    puertos_sfp = models.CharField(max_length=50, blank=True, null=True, verbose_name="Puertos SFP")
    puerto_consola = models.BooleanField(default=False, verbose_name="Puerto Consola")
    puertos_poe = models.CharField(max_length=50, blank=True, null=True, verbose_name="Puertos PoE")
    alimentacion = models.CharField(max_length=50, blank=True, null=True, verbose_name="Alimentación")
    administrable = models.BooleanField(default=False, verbose_name="Administrable")

    # Campos para Perifericos (otros tipos)
    tamano = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tamaño")
    color = models.CharField(max_length=50, blank=True, null=True, verbose_name="Color")
    conectores = models.TextField(blank=True, null=True, verbose_name="Conectores")
    cables = models.TextField(blank=True, null=True, verbose_name="Cables")

    class Meta:
        verbose_name = "Modelo de Activo"
        verbose_name_plural = "Modelos de Activo"
        ordering = ['name']

    def __str__(self):
        tipo = self.tipo_activo.name if self.tipo_activo else "Sin tipo"
        return f"{self.marca.name} - {self.name} ({tipo})"

    def get_asset_type_category(self):
        """Retorna la categoría del tipo de activo para determinar qué campos mostrar"""
        if not self.tipo_activo:
            return 'periferico'

        tipo_name = self.tipo_activo.name.lower()

        # Equipos de computo
        computo_types = ['computadora', 'laptop', 'desktop', 'servidor', 'all in one']
        if any(tipo in tipo_name for tipo in computo_types):
            return 'computo'

        # Equipos de red
        red_types = ['switch', 'router', 'routers', 'firewall', 'ap wifi', 'p2p']
        if any(tipo in tipo_name for tipo in red_types):
            return 'red'

        # Perifericos (default)
        return 'periferico'


class Proveedor(models.Model):
    nombre_empresa = models.CharField(max_length=255, unique=True, verbose_name="Nombre de la Empresa")
    nit = models.CharField(max_length=20, unique=True, verbose_name="NIT")
    direccion = models.TextField(verbose_name="Dirección")
    nombre_contacto = models.CharField(max_length=255, verbose_name="Nombre de Contacto")

    # Contacto de ventas
    telefono_ventas = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono de Ventas")
    correo_ventas = models.EmailField(blank=True, null=True, verbose_name="Correo de Ventas")

    # Contacto de soporte
    telefono_soporte = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono de Soporte")
    correo_soporte = models.EmailField(blank=True, null=True, verbose_name="Correo de Soporte")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['nombre_empresa']

    def __str__(self):
        return self.nombre_empresa



class AuditLog(models.Model):
    ACTIVITY_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
    ]

    timestamp = models.DateTimeField(auto_now_add=True)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_CHOICES)
    description = models.TextField()
    user = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')

    # Generic foreign key for the record
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    # Data before and after the change
    old_data = models.JSONField(null=True, blank=True, verbose_name="Datos Anteriores")
    new_data = models.JSONField(null=True, blank=True, verbose_name="Datos Nuevos")

    class Meta:
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.activity_type} by {self.user} at {self.timestamp}"