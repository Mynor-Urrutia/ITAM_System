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
    name = models.CharField(max_length=100, unique=True)
    # Puedes añadir más campos como descripción, código, etc.

    class Meta:
        verbose_name = "Departamento"
        verbose_name_plural = "Departamentos"
        ordering = ['name']

    def __str__(self):
        return self.name

class Area(models.Model):
    name = models.CharField(max_length=100, unique=True)
    department = models.ForeignKey(Departamento, on_delete=models.SET_NULL, null=True, blank=True, related_name='areas')
    # Puedes añadir más campos como descripción, tipo de área, etc.

    class Meta:
        verbose_name = "Área"
        verbose_name_plural = "Áreas"
        ordering = ['name']

    def __str__(self):
        return self.name