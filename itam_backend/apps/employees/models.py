"""
Modelo de empleados para el sistema ITAM.

Este archivo define la estructura de datos para gestionar la información
de empleados, incluyendo su jerarquía organizacional, ubicación geográfica
y documentos asociados.
"""

from django.db import models
from apps.masterdata.models import Region, Finca, Departamento, Area

class Employee(models.Model):
    """
    Modelo que representa a un empleado en la organización.

    Incluye información personal, jerarquía organizacional (departamento, área),
    ubicación geográfica (región, finca) y relación jerárquica con supervisores.
    """
    # Información personal del empleado
    employee_number = models.CharField(max_length=50, unique=True, verbose_name="Número de Empleado")
    first_name = models.CharField(max_length=100, verbose_name="Nombres")
    last_name = models.CharField(max_length=100, verbose_name="Apellidos")

    # Jerarquía organizacional
    department = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name="Departamento"
    )
    area = models.ForeignKey(
        Area,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name="Área"
    )

    # Ubicación geográfica
    region = models.ForeignKey(
        Region,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name="Región"
    )
    finca = models.ForeignKey(
        Finca,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name="Finca"
    )

    # Información laboral
    start_date = models.DateField(verbose_name="Fecha de Inicio de Labores")

    # Relación jerárquica (auto-referencial)
    supervisor = models.ForeignKey(
        'self',  # Referencia a la misma clase Employee
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates',  # Permite acceder a subordinados desde el supervisor
        verbose_name="Jefe Inmediato"
    )

    # Documentos asociados
    document = models.FileField(
        upload_to='employee_documents/',  # Carpeta donde se guardan los archivos
        null=True,
        blank=True,
        verbose_name="Documento PDF del Empleado"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Empleado"
        verbose_name_plural = "Empleados"
        ordering = ['employee_number']

    def __str__(self):
        return f"{self.employee_number} - {self.first_name} {self.last_name}"
