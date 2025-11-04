"""
Vistas API para la gestión de empleados en el sistema ITAM.

Este archivo contiene el ViewSet principal para operaciones CRUD
de empleados, incluyendo filtros, búsqueda y manejo de archivos.
"""

from rest_framework import viewsets, permissions, parsers
from rest_framework import filters as drf_filters
from rest_framework.pagination import PageNumberPagination
from django_filters import rest_framework as filters

from .models import Employee
from .serializers import EmployeeSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5  # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 200

class EmployeeFilter(filters.FilterSet):
    class Meta:
        model = Employee
        fields = ['department', 'area', 'region', 'finca', 'supervisor']

class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal para gestión CRUD de empleados.

    Proporciona endpoints para:
    - Listar empleados con filtros y búsqueda
    - Crear nuevos empleados
    - Ver, actualizar y eliminar empleados existentes
    - Filtrar empleados disponibles para asignación a usuarios
    - Manejo de archivos (documentos PDF)
    """

    # Query optimizada con select_related para evitar N+1 queries
    queryset = Employee.objects.select_related(
        'department', 'area', 'region', 'finca', 'supervisor'
    ).all()
    serializer_class = EmployeeSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

    # Configuración de filtros y búsqueda
    filter_backends = [drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = EmployeeFilter
    search_fields = ['employee_number', 'first_name', 'last_name', 'department__name', 'area__name', 'region__name', 'finca__name']
    ordering_fields = ['employee_number', 'first_name', 'last_name', 'start_date', 'department__name', 'area__name', 'region__name', 'finca__name']
    ordering = ['employee_number']  # Ordenamiento por defecto

    def get_queryset(self):
        queryset = super().get_queryset()
        available_for_user = self.request.query_params.get('available_for_user', None)
        if available_for_user == 'true':
            queryset = queryset.filter(user_account__isnull=True)
        return queryset

    def get_parsers(self):
        if getattr(self, 'action', None) in ['create', 'update', 'partial_update']:
            return [parsers.MultiPartParser(), parsers.FormParser()]
        return super().get_parsers()

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print("\n❌ ERROR EN UPDATE EMPLOYEE:", str(e))
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
