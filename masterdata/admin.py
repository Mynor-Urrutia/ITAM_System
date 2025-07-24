# itam_backend/masterdata/admin.py

from django.contrib import admin
from .models import Region, Finca, Departamento, Area

admin.site.register(Region)
admin.site.register(Finca)
admin.site.register(Departamento)
admin.site.register(Area)