"""
Modelos de datos maestros para el sistema ITAM.

Este archivo contiene todas las entidades de catálogo que sirven como
base para el resto del sistema: regiones, fincas, departamentos, áreas,
tipos de activos, marcas, modelos, proveedores y auditoría.
"""

from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict

class Region(models.Model):
    """
    Modelo que representa una región geográfica.

    Las regiones son la división geográfica más alta en la organización.
    Contienen fincas y sirven para agrupar activos por ubicación geográfica.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la Región")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")

    class Meta:
        verbose_name = "Región"
        verbose_name_plural = "Regiones"
        ordering = ['name']

    def __str__(self):
        return self.name

class Finca(models.Model):
    """
    Modelo que representa una finca agrícola.

    Las fincas pertenecen a una región y contienen empleados y activos.
    Son la unidad operativa básica de la organización agrícola.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la Finca")

    # Relación con región (jerarquía geográfica)
    region = models.ForeignKey(
        Region,
        on_delete=models.SET_NULL,  # Si se elimina la región, la finca queda sin región asignada
        null=True,                  # Permite fincas sin región inicialmente
        blank=True,                 # Campo opcional en formularios
        related_name='fincas'       # Permite acceder a fincas desde región: region.fincas.all()
    )

    # Información adicional de la finca
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name="Dirección")

    class Meta:
        verbose_name = "Finca"
        verbose_name_plural = "Fincas"
        ordering = ['name']

    def __str__(self):
        return self.name


class Departamento(models.Model):
    """
    Modelo que representa un departamento organizacional.

    Los departamentos son la división funcional de la organización.
    Contienen áreas y sirven para agrupar empleados y activos por función.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Departamento")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")

    class Meta:
        verbose_name = "Departamento"
        verbose_name_plural = "Departamentos"
        ordering = ['name']

    def __str__(self):
        return self.name

class Area(models.Model):
    """
    Modelo que representa un área dentro de un departamento.

    Las áreas son la subdivisión más granular de la organización.
    Pertenecen a un departamento y contienen empleados y activos específicos.
    """
    name = models.CharField(max_length=100, verbose_name="Nombre del Área")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")

    # Relación con departamento (jerarquía organizacional)
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.CASCADE,  # Si se elimina el departamento, se eliminan sus áreas
        related_name='areas',      # Permite acceder a áreas desde departamento: departamento.areas.all()
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
    """
    Modelo que representa los tipos de activos tecnológicos.

    Clasifica los equipos en categorías como: computadora, laptop, servidor,
    switch, router, impresora, etc. Los tipos determinan qué campos
    específicos se muestran en el formulario de activos.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Tipo de Activo")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Modificación")

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
    """
    Modelo que representa un modelo específico de activo tecnológico.

    Combina marca + modelo + tipo para crear especificaciones técnicas detalladas.
    Los campos específicos (procesador, RAM, etc.) dependen del tipo de activo.
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Nombre del Modelo")

    # Relaciones jerárquicas
    marca = models.ForeignKey(
        'Marca',
        on_delete=models.PROTECT,  # No permite eliminar marca si tiene modelos
        related_name='modelos_activo',
        verbose_name="Marca"
    )

    tipo_activo = models.ForeignKey(
        'TipoActivo',
        on_delete=models.SET_NULL,  # Si se elimina el tipo, el modelo queda sin tipo
        null=True,
        blank=True,
        related_name='modelos_activo',
        verbose_name="Tipo de Activo"
    )

    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Modificación")

    # Especificaciones técnicas específicas por tipo de activo

    # Campos para Equipos de Cómputo (computadora, laptop, desktop, servidor, All in one)
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

    # Campos para Periféricos (otros tipos de equipos)
    tamano = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tamaño")
    color = models.CharField(max_length=50, blank=True, null=True, verbose_name="Color")
    conectores = models.TextField(blank=True, null=True, verbose_name="Conectores")
    cables = models.TextField(blank=True, null=True, verbose_name="Cables Incluidos")

    class Meta:
        verbose_name = "Modelo de Activo"
        verbose_name_plural = "Modelos de Activo"
        ordering = ['name']

    def __str__(self):
        tipo = self.tipo_activo.name if self.tipo_activo else "Sin tipo"
        return f"{self.marca.name} - {self.name} ({tipo})"

    def get_asset_type_category(self):
        """
        Determina la categoría del tipo de activo para mostrar campos específicos en formularios.

        Esta función clasifica automáticamente los modelos según su tipo para mostrar
        los campos técnicos relevantes (procesador/RAM para cómputo, puertos para red, etc.)
        """
        if not self.tipo_activo:
            return 'periferico'  # Categoría por defecto

        tipo_name = self.tipo_activo.name.lower()

        # Equipos de cómputo
        computo_types = ['computadora', 'laptop', 'desktop', 'servidor', 'all in one']
        if any(tipo in tipo_name for tipo in computo_types):
            return 'computo'

        # Equipos de red
        red_types = ['switch', 'router', 'routers', 'firewall', 'ap wifi', 'p2p']
        if any(tipo in tipo_name for tipo in red_types):
            return 'red'

        # Periféricos (categoría por defecto)
        return 'periferico'


class Proveedor(models.Model):
    """
    Modelo que representa un proveedor de equipos tecnológicos.

    Contiene información completa del proveedor incluyendo contactos
    de ventas y soporte técnico para gestión de garantías y soporte.
    """
    # Información básica de la empresa
    nombre_empresa = models.CharField(max_length=255, unique=True, verbose_name="Nombre de la Empresa")
    nit = models.CharField(max_length=20, unique=True, verbose_name="NIT")
    direccion = models.TextField(verbose_name="Dirección")
    nombre_contacto = models.CharField(max_length=255, verbose_name="Nombre de Contacto Principal")

    # Información de contacto de ventas
    telefono_ventas = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono de Ventas")
    correo_ventas = models.EmailField(blank=True, null=True, verbose_name="Correo de Ventas")

    # Información de contacto de soporte técnico
    telefono_soporte = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono de Soporte")
    correo_soporte = models.EmailField(blank=True, null=True, verbose_name="Correo de Soporte")

    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Modificación")

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['nombre_empresa']

    def __str__(self):
        return self.nombre_empresa



class AuditLog(models.Model):
    """
    Modelo que registra todas las operaciones realizadas en el sistema.

    Proporciona trazabilidad completa de cambios para auditoría, cumplimiento
    y resolución de problemas. Registra qué usuario realizó qué acción,
    cuándo y qué datos cambiaron.
    """

    # Tipos de actividades auditables
    ACTIVITY_CHOICES = [
        ('CREATE', 'Crear'),
        ('UPDATE', 'Actualizar'),
        ('DELETE', 'Eliminar'),
        ('LOGIN', 'Inicio de Sesión'),
        ('RETIRE', 'Retirar Activo'),
        ('REACTIVATE', 'Reactivar Activo'),
        ('RETURN', 'Devolver Asignación'),
    ]

    # Información básica del evento
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Fecha y Hora")
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, verbose_name="Tipo de Actividad")
    description = models.TextField(verbose_name="Descripción de la Actividad")
    user = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs', verbose_name="Usuario")

    # Generic Foreign Key para referenciar cualquier modelo del sistema
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    # Datos del cambio (antes y después)
    old_data = models.JSONField(null=True, blank=True, verbose_name="Datos Anteriores")
    new_data = models.JSONField(null=True, blank=True, verbose_name="Datos Nuevos")

    class Meta:
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.activity_type} by {self.user} at {self.timestamp}"