# itam_backend/masterdata/models.py

from django.db import models

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