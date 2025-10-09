from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ActivoViewSet, MaintenanceViewSet, AssignmentViewSet, dashboard_data, dashboard_models_data, dashboard_warranty_data, dashboard_summary, dashboard_detail_data, maintenance_overview, assets_report_csv, maintenance_report_csv, assignments_report_csv

router = DefaultRouter()
router.register(r'activos', ActivoViewSet)
router.register(r'maintenances', MaintenanceViewSet)
router.register(r'assignments', AssignmentViewSet)

urlpatterns = router.urls + [
    path('dashboard/', dashboard_data, name='dashboard_data'),
    path('dashboard-models/', dashboard_models_data, name='dashboard_models_data'),
    path('dashboard-warranty/', dashboard_warranty_data, name='dashboard_warranty_data'),
    path('dashboard-summary/', dashboard_summary, name='dashboard_summary'),
    path('dashboard-detail/', dashboard_detail_data, name='dashboard_detail_data'),
    path('maintenance-overview/', maintenance_overview, name='maintenance_overview'),
    # CSV Reports
    path('reports/assets/csv/', assets_report_csv, name='assets_report_csv'),
    path('reports/maintenance/csv/', maintenance_report_csv, name='maintenance_report_csv'),
    path('reports/assignments/csv/', assignments_report_csv, name='assignments_report_csv'),
]