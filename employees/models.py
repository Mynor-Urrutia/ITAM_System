from django.db import models
from masterdata.models import Region, Finca, Departamento, Area

class Employee(models.Model):
    employee_number = models.CharField(max_length=50, unique=True, verbose_name="No. Empleado")
    first_name = models.CharField(max_length=100, verbose_name="Nombres")
    last_name = models.CharField(max_length=100, verbose_name="Apellidos")

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

    start_date = models.DateField(verbose_name="Inicio de Labores")
    supervisor = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates',
        verbose_name="Jefe Inmediato"
    )

    document = models.FileField(
        upload_to='employee_documents/',
        null=True,
        blank=True,
        verbose_name="Documento PDF"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Empleado"
        verbose_name_plural = "Empleados"
        ordering = ['employee_number']

    def __str__(self):
        return f"{self.employee_number} - {self.first_name} {self.last_name}"
