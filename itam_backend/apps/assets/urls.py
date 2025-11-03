"""
URLs para la aplicación de activos del sistema ITAM.

Define todas las rutas API para:
- CRUD de activos, mantenimientos y asignaciones
- Dashboards y reportes en tiempo real
- Exportación de datos a CSV
"""

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ActivoViewSet, MaintenanceViewSet, AssignmentViewSet, dashboard_data, dashboard_models_data, dashboard_warranty_data, dashboard_summary, dashboard_detail_data, maintenance_overview, assets_report_csv, maintenance_report_csv, assignments_report_csv

# Router que registra automáticamente las URLs CRUD para los ViewSets
router = DefaultRouter()
router.register(r'activos', ActivoViewSet)          # /api/assets/activos/
router.register(r'maintenances', MaintenanceViewSet) # /api/assets/maintenances/
router.register(r'assignments', AssignmentViewSet)   # /api/assets/assignments/

# URLs adicionales para funcionalidades específicas
urlpatterns = router.urls + [
    # Dashboards y estadísticas
    path('dashboard/', dashboard_data, name='dashboard_data'),                    # Datos generales del dashboard
    path('dashboard-models/', dashboard_models_data, name='dashboard_models_data'), # Dashboard por modelos
    path('dashboard-warranty/', dashboard_warranty_data, name='dashboard_warranty_data'), # Garantías
    path('dashboard-summary/', dashboard_summary, name='dashboard_summary'),      # Resumen de activos
    path('dashboard-detail/', dashboard_detail_data, name='dashboard_detail_data'), # Detalles por categoría
    path('maintenance-overview/', maintenance_overview, name='maintenance_overview'), # Vista general de mantenimientos

    # Reportes CSV descargables
    path('reports/assets/csv/', assets_report_csv, name='assets_report_csv'),        # Reporte de activos
    path('reports/maintenance/csv/', maintenance_report_csv, name='maintenance_report_csv'), # Reporte de mantenimientos
    path('reports/assignments/csv/', assignments_report_csv, name='assignments_report_csv'), # Reporte de asignaciones
]