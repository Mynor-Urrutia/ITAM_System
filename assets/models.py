from django.db import models
from django.conf import settings
from django.utils import timezone
from masterdata.models import TipoActivo, Marca, ModeloActivo, Proveedor, Region, Finca, Departamento, Area
from datetime import timedelta

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
    documentos_baja = models.JSONField(
        verbose_name="Documentos de Baja",
        blank=True,
        null=True,
        help_text="Lista de rutas de archivos subidos al dar de baja el activo"
    )

    # Maintenance tracking fields
    ultimo_mantenimiento = models.DateField(
        verbose_name="Último Mantenimiento",
        blank=True,
        null=True,
        help_text="Fecha del último mantenimiento realizado"
    )
    proximo_mantenimiento = models.DateField(
        verbose_name="Próximo Mantenimiento",
        blank=True,
        null=True,
        help_text="Fecha calculada para el próximo mantenimiento"
    )
    tecnico_mantenimiento = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        verbose_name="Técnico de Mantenimiento",
        blank=True,
        null=True,
        related_name='mantenimientos_realizados',
        help_text="Último técnico que realizó mantenimiento a este activo"
    )
    ultimo_mantenimiento_hallazgos = models.TextField(
        verbose_name="Últimos Hallazgos de Mantenimiento",
        blank=True,
        null=True,
        help_text="Hallazgos del último mantenimiento realizado"
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

    def calculate_next_maintenance_date(self, from_date=None):
        """Calculate next maintenance date: 6 months + 5 business days from given date"""
        if not from_date:
            from_date = self.fecha_registro if self.fecha_registro else timezone.now().date()

        # Add 6 months
        next_date = from_date + timedelta(days=180)  # Approximately 6 months

        # Add 5 business days (Monday-Friday)
        business_days_added = 0
        current_date = next_date

        while business_days_added < 5:
            current_date += timedelta(days=1)
            # Monday = 0, Tuesday = 1, ..., Sunday = 6
            if current_date.weekday() < 5:  # Monday to Friday
                business_days_added += 1

        return current_date


class Maintenance(models.Model):
    # Foreign Key
    activo = models.ForeignKey(
        Activo,
        on_delete=models.CASCADE,
        related_name='maintenances',
        verbose_name="Activo"
    )

    # Maintenance details
    maintenance_date = models.DateField(verbose_name="Fecha de Mantenimiento")
    technician = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        verbose_name="Técnico que realizó el mantenimiento"
    )
    findings = models.TextField(
        verbose_name="Hallazgos",
        help_text="Descripción de los hallazgos encontrados durante el mantenimiento"
    )

    # Next maintenance calculation
    next_maintenance_date = models.DateField(
        verbose_name="Próximo Mantenimiento",
        help_text="Fecha calculada para el próximo mantenimiento"
    )

    # Attachments
    attachments = models.JSONField(
        verbose_name="Archivos Adjuntos",
        blank=True,
        null=True,
        help_text="Lista de rutas de archivos subidos durante el mantenimiento"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Mantenimiento"
        verbose_name_plural = "Mantenimientos"
        ordering = ['-created_at']

    def __str__(self):
        try:
            hostname = self.activo.hostname if self.activo else "Sin activo"
            date_str = str(self.maintenance_date) if self.maintenance_date else "Sin fecha"
            return f"Mantenimiento de {hostname} - {date_str}"
        except Exception as e:
            return f"Mantenimiento ID: {self.pk}"

    def save(self, *args, **kwargs):
        # Auto-calculate next maintenance date if not provided
        if not self.next_maintenance_date:
            calculated_date = self.activo.calculate_next_maintenance_date(self.maintenance_date)
            if calculated_date:
                self.next_maintenance_date = calculated_date
        super().save(*args, **kwargs)

        # Update the Activo's maintenance fields with this maintenance's data
        self.activo.ultimo_mantenimiento = self.maintenance_date
        self.activo.proximo_mantenimiento = self.next_maintenance_date
        self.activo.tecnico_mantenimiento = self.technician
        self.activo.ultimo_mantenimiento_hallazgos = self.findings
        self.activo.save(update_fields=['ultimo_mantenimiento', 'proximo_mantenimiento', 'tecnico_mantenimiento', 'ultimo_mantenimiento_hallazgos'])
