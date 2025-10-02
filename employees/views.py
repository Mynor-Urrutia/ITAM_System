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
    queryset = Employee.objects.select_related(
        'department', 'area', 'region', 'finca', 'supervisor'
    ).all()
    serializer_class = EmployeeSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
    filter_backends = [drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = EmployeeFilter
    search_fields = ['employee_number', 'first_name', 'last_name', 'department__name', 'area__name', 'region__name', 'finca__name']
    ordering_fields = ['employee_number', 'first_name', 'last_name', 'start_date', 'department__name', 'area__name', 'region__name', 'finca__name']
    ordering = ['employee_number']  # Default ordering

    def get_parsers(self):
        if getattr(self, 'action', None) in ['create', 'update', 'partial_update']:
            return [parsers.MultiPartParser(), parsers.FormParser()]
        return super().get_parsers()
