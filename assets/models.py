from django.db import models
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
    solicitante = models.CharField(max_length=255, verbose_name="Solicitante")
    correo_electronico = models.EmailField(verbose_name="Correo Electrónico")
    orden_compra = models.CharField(max_length=255, verbose_name="Orden de Compra")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Activo"
        verbose_name_plural = "Activos"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.hostname} - {self.serie}"
