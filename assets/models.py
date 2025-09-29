from django.db import models
from django.conf import settings
from masterdata.models import TipoActivo, Marca, ModeloActivo, Proveedor, Region, Finca, Departamento, Area

class Activo(models.Model):
    # Foreign Keys
    tipo_activo = models.ForeignKey(
        TipoActivo,
        on_delete=models.PROTECT,
        related_name='activos',
        verbose_name="Tipo de Equipo"
    )
    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.PROTECT,
        related_name='activos',
        verbose_name="Proveedor"
    )
    marca = models.ForeignKey(
        Marca,
        on_delete=models.PROTECT,
        related_name='activos',
        verbose_name="Marca"
    )
    modelo = models.ForeignKey(
        ModeloActivo,
        on_delete=models.PROTECT,
        related_name='activos',
        verbose_name="Modelo"
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.PROTECT,
        related_name='activos',
        verbose_name="Región"
    )
    finca = models.ForeignKey(
        Finca,
        on_delete=models.PROTECT,
        related_name='activos',
        verbose_name="Finca"
    )
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.PROTECT,
        related_name='activos',
        verbose_name="Departamento"
    )
    area = models.ForeignKey(
        Area,
        on_delete=models.PROTECT,
        related_name='activos',
        verbose_name="Área"
    )

    # Unique fields
    serie = models.CharField(max_length=255, unique=True, verbose_name="Serie")
    hostname = models.CharField(max_length=255, unique=True, verbose_name="Hostname")

    # Date fields
    fecha_registro = models.DateField(verbose_name="Fecha de Registro")
    fecha_fin_garantia = models.DateField(verbose_name="Fecha de Fin de Garantía")

    # Other fields
    solicitante = models.CharField(max_length=255, verbose_name="Solicitante", blank=True, null=True)
    correo_electronico = models.EmailField(verbose_name="Correo Electrónico", blank=True, null=True)
    orden_compra = models.CharField(max_length=255, verbose_name="Orden de Compra", blank=True, null=True)
    cuenta_contable = models.CharField(max_length=255, verbose_name="Cuenta Contable", blank=True, null=True)
    tipo_costo = models.CharField(
        max_length=20,
        choices=[('costo', 'Costo'), ('mensualidad', 'Mensualidad')],
        verbose_name="Tipo de Costo",
        blank=True,
        null=True
    )
    cuotas = models.IntegerField(
        choices=[
            (1, '1 mes'), (3, '3 meses'), (6, '6 meses'), (12, '12 meses'),
            (18, '18 meses'), (24, '24 meses'), (36, '36 meses'), (48, '48 meses'), (60, '60 meses')
        ],
        verbose_name="Cuotas",
        blank=True,
        null=True
    )
    moneda = models.CharField(
        max_length=3,
        choices=[('USD', 'Dólares'), ('GTQ', 'Quetzales')],
        verbose_name="Moneda",
        blank=True,
        null=True
    )
    costo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Costo",
        blank=True,
        null=True
    )

    # Estado del activo
    estado = models.CharField(
        max_length=20,
        choices=[('activo', 'Activo'), ('retirado', 'Retirado')],
        default='activo',
        verbose_name="Estado"
    )
    fecha_baja = models.DateTimeField(
        verbose_name="Fecha de Baja",
        blank=True,
        null=True
    )
    motivo_baja = models.TextField(
        verbose_name="Motivo de Baja",
        blank=True,
        null=True
    )
    usuario_baja = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        verbose_name="Usuario que dio de Baja",
        blank=True,
        null=True,
        related_name='activos_retirados'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Activo"
        verbose_name_plural = "Activos"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.hostname} - {self.serie}"
