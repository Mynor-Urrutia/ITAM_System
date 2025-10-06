# itam_backend/masterdata/urls.py

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegionViewSet, FincaViewSet, DepartamentoViewSet, AreaViewSet, TipoActivoViewSet, MarcaViewSet, ModeloActivoViewSet, ProveedorViewSet, AuditLogViewSet, audit_logs_report_csv


router = DefaultRouter()
router.register(r'regions', RegionViewSet)
router.register(r'fincas', FincaViewSet) # Los endpoints serán /api/masterdata/fincas/
router.register(r'departamentos', DepartamentoViewSet) # Nueva ruta
router.register(r'areas', AreaViewSet)             # Nueva ruta
router.register(r'tipos-activos', TipoActivoViewSet)
router.register(r'marcas', MarcaViewSet)
router.register(r'modelos-activo', ModeloActivoViewSet)
router.register(r'proveedores', ProveedorViewSet)
router.register(r'audit-logs', AuditLogViewSet)

urlpatterns = router.urls + [
    path('reports/audit-logs/csv/', audit_logs_report_csv, name='audit_logs_report_csv'),
]