"""
Modelos de datos para la gestión de activos tecnológicos en el sistema ITAM.

Este archivo define las estructuras de datos para:
- Activos individuales (equipos tecnológicos)
- Registros de mantenimiento
- Asignaciones de equipos a empleados

Incluye lógica de negocio como cálculo automático de fechas de mantenimiento
y sincronización de estados entre modelos relacionados.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.masterdata.models import TipoActivo, Marca, ModeloActivo, Proveedor, Region, Finca, Departamento, Area
from datetime import timedelta

class Activo(models.Model):
    """
    Modelo principal que representa un activo tecnológico individual.

    Cada activo es un equipo específico (computadora, router, impresora, etc.)
    con toda su información técnica, ubicación organizacional y estado operativo.
    """

    # Relaciones con catálogos de datos maestros
    tipo_activo = models.ForeignKey(
        TipoActivo,
        on_delete=models.PROTECT,  # No permite eliminar tipo si hay activos
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

    # Campos únicos que identifican al activo
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

    # Especificaciones técnicas del activo (pueden sobreescribir los valores por defecto del modelo)
    # Para equipos de cómputo
    procesador = models.CharField(max_length=150, blank=True, null=True, verbose_name="Procesador")
    ram = models.IntegerField(verbose_name="Memoria RAM (GB)", blank=True, null=True)
    almacenamiento = models.CharField(max_length=100, blank=True, null=True, verbose_name="Almacenamiento")
    tarjeta_grafica = models.CharField(max_length=150, blank=True, null=True, verbose_name="Tarjeta Gráfica")
    wifi = models.BooleanField(blank=True, null=True, verbose_name="WIFI")
    ethernet = models.BooleanField(blank=True, null=True, verbose_name="Ethernet")

    # Para equipos de red
    puertos_ethernet = models.CharField(max_length=50, blank=True, null=True, verbose_name="Puertos Ethernet")
    puertos_sfp = models.CharField(max_length=50, blank=True, null=True, verbose_name="Puertos SFP")
    puerto_consola = models.BooleanField(blank=True, null=True, verbose_name="Puerto Consola")
    puertos_poe = models.CharField(max_length=50, blank=True, null=True, verbose_name="Puertos PoE")
    alimentacion = models.CharField(max_length=50, blank=True, null=True, verbose_name="Alimentación")
    administrable = models.BooleanField(blank=True, null=True, verbose_name="Administrable")

    # Para periféricos
    tamano = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tamaño")
    color = models.CharField(max_length=50, blank=True, null=True, verbose_name="Color")
    conectores = models.TextField(blank=True, null=True, verbose_name="Conectores")
    cables = models.TextField(blank=True, null=True, verbose_name="Cables")

    # Estado operativo del activo
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

    # Assignment to user
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        verbose_name="Asignado a",
        blank=True,
        null=True,
        related_name='assigned_assets',
        help_text="Usuario al que está asignado este activo"
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
        """
        Calcula la próxima fecha de mantenimiento: 6 meses + 5 días hábiles desde la fecha dada.

        Esta función implementa la lógica de negocio para programar mantenimientos preventivos
        de equipos tecnológicos según estándares de la industria.
        """
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
    """
    Modelo que registra cada intervención de mantenimiento realizada a un activo.

    Incluye información sobre el técnico que realizó el trabajo, hallazgos encontrados,
    archivos adjuntos y cálculo automático de la próxima fecha de mantenimiento.
    """

    # Relación con el activo que recibió mantenimiento
    activo = models.ForeignKey(
        Activo,
        on_delete=models.CASCADE,  # Si se elimina el activo, se eliminan sus mantenimientos
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
        # Calcula automáticamente la próxima fecha de mantenimiento si no se proporciona
        if not self.next_maintenance_date:
            calculated_date = self.activo.calculate_next_maintenance_date(self.maintenance_date)
            if calculated_date:
                self.next_maintenance_date = calculated_date
        super().save(*args, **kwargs)

        # Actualiza los campos de mantenimiento del activo con los datos de este mantenimiento
        # Esto mantiene sincronizada la información entre el activo y sus mantenimientos
        self.activo.ultimo_mantenimiento = self.maintenance_date
        self.activo.proximo_mantenimiento = self.next_maintenance_date
        self.activo.tecnico_mantenimiento = self.technician
        self.activo.ultimo_mantenimiento_hallazgos = self.findings
        self.activo.save(update_fields=['ultimo_mantenimiento', 'proximo_mantenimiento', 'tecnico_mantenimiento', 'ultimo_mantenimiento_hallazgos'])


class Assignment(models.Model):
    """
    Modelo que registra la asignación temporal de un activo a un empleado.

    Controla el préstamo de equipos tecnológicos, manteniendo un historial
    de quién tuvo qué equipo y cuándo. Incluye lógica para evitar asignaciones
    duplicadas del mismo tipo de activo a un empleado.
    """

    # Relaciones con activo y empleado
    activo = models.ForeignKey(
        Activo,
        on_delete=models.PROTECT,  # No permite eliminar activo si tiene asignaciones
        related_name='assignments',
        verbose_name="Activo"
    )
    employee = models.ForeignKey(
        'employees.Employee',
        on_delete=models.PROTECT,  # No permite eliminar empleado si tiene asignaciones
        related_name='assignments',
        verbose_name="Empleado"
    )

    # Assignment dates
    assigned_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Asignación"
    )
    returned_date = models.DateTimeField(
        verbose_name="Fecha de Devolución",
        blank=True,
        null=True
    )

    # Users who performed actions
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='assignments_made',
        verbose_name="Asignado por"
    )
    returned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='assignments_returned',
        verbose_name="Devuelto por",
        blank=True,
        null=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Asignación"
        verbose_name_plural = "Asignaciones"
        ordering = ['-assigned_date']
        # Ensure no duplicate active assignments for same activo
        unique_together = ['activo', 'employee', 'assigned_date']

    def __str__(self):
        return f"{self.activo.hostname} asignado a {self.employee.first_name} {self.employee.last_name}"

    @property
    def is_active(self):
        """Check if assignment is currently active (not returned)"""
        return self.returned_date is None

    def save(self, *args, **kwargs):
        # Si es una nueva asignación (sin fecha de devolución), establece el assigned_to del activo
        if not self.returned_date and self.employee:
            # Obtiene el usuario asociado con este empleado
            try:
                user = self.employee.user_account.first()  # Obtiene el usuario que tiene este empleado
                if user:
                    self.activo.assigned_to = user
                    self.activo.save(update_fields=['assigned_to'])
            except Exception:
                # Si no se encuentra cuenta de usuario, continúa sin establecer assigned_to
                pass

        # Si esta asignación se está devolviendo, verifica si hay otras asignaciones activas
        elif self.returned_date and self.activo.assigned_to:
            # Verifica si hay otras asignaciones activas para este activo
            other_active_assignments = Assignment.objects.filter(
                activo=self.activo,
                returned_date__isnull=True
            ).exclude(id=self.id)

            # Si no hay otras asignaciones activas, limpia el campo assigned_to
            if not other_active_assignments.exists():
                self.activo.assigned_to = None
                self.activo.save(update_fields=['assigned_to'])

        super().save(*args, **kwargs)

    def return_assignment(self, returned_by_user, return_date=None):
        """
        Marca la asignación como devuelta.

        Actualiza la fecha de devolución y el usuario que realizó la devolución,
        luego guarda los cambios.
        """
        from django.utils import timezone
        self.returned_date = return_date or timezone.now()
        self.returned_by = returned_by_user
        self.save()
