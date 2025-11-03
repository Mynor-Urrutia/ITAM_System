"""
URLs para la aplicación de datos maestros del sistema ITAM.

Define todas las rutas API para gestión CRUD de entidades de catálogo:
- Regiones, fincas, departamentos, áreas (jerarquía organizacional)
- Tipos de activos, marcas, modelos (clasificación de equipos)
- Proveedores (información de contactos)
- Logs de auditoría (seguimiento de cambios)

Utiliza DefaultRouter de DRF para generar automáticamente las rutas RESTful
estándar (GET, POST, PUT, PATCH, DELETE) para cada ViewSet.
"""

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegionViewSet, FincaViewSet, DepartamentoViewSet, AreaViewSet, TipoActivoViewSet, MarcaViewSet, ModeloActivoViewSet, ProveedorViewSet, AuditLogViewSet, audit_logs_report_csv

# Configuración del router para rutas REST automáticas
router = DefaultRouter()

# Registro de ViewSets con sus rutas correspondientes
# Jerarquía geográfica y organizacional
router.register(r'regions', RegionViewSet)           # /api/masterdata/regions/
router.register(r'fincas', FincaViewSet)             # /api/masterdata/fincas/
router.register(r'departamentos', DepartamentoViewSet) # /api/masterdata/departamentos/
router.register(r'areas', AreaViewSet)               # /api/masterdata/areas/

# Clasificación de activos tecnológicos
router.register(r'tipos-activos', TipoActivoViewSet) # /api/masterdata/tipos-activos/
router.register(r'marcas', MarcaViewSet)             # /api/masterdata/marcas/
router.register(r'modelos-activo', ModeloActivoViewSet) # /api/masterdata/modelos-activo/

# Proveedores y auditoría
router.register(r'proveedores', ProveedorViewSet)    # /api/masterdata/proveedores/
router.register(r'audit-logs', AuditLogViewSet)      # /api/masterdata/audit-logs/

# URLs finales: combina rutas del router con rutas adicionales
urlpatterns = router.urls + [
    # Ruta adicional para exportación CSV de logs de auditoría
    path('reports/audit-logs/csv/', audit_logs_report_csv, name='audit_logs_report_csv'),
]