"""
Vistas API para la gestión de datos maestros en el sistema ITAM.

Este archivo contiene ViewSets para todas las entidades de catálogo,
incluyendo auditoría automática, filtros, búsqueda y exportación CSV.
Proporciona endpoints para CRUD completo de datos maestros.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from django.db.models import ProtectedError
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from datetime import datetime
import json
import csv

from .models import Region, Finca, Departamento, Area, TipoActivo, Marca, ModeloActivo, Proveedor, AuditLog
from .serializers import RegionSerializer, FincaSerializer, FincaCreateUpdateSerializer, DepartamentoSerializer, AreaSerializer, TipoActivoSerializer, MarcaSerializer, ModeloActivoSerializer, ProveedorSerializer, AuditLogSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5  # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 200

def serialize_model_data(instance):
    """Serialize model instance data to JSON-compatible format."""
    # Exclude fields that contain model instances (ManyToMany, ForeignKey objects)
    exclude_fields = []
    if hasattr(instance, 'groups'):
        exclude_fields.append('groups')
    if hasattr(instance, 'user_permissions'):
        exclude_fields.append('user_permissions')
    if hasattr(instance, 'permissions'):
        exclude_fields.append('permissions')  # Exclude permissions from Group model
    if hasattr(instance, 'password'):
        exclude_fields.append('password')  # Don't log passwords

    data = model_to_dict(instance, exclude=exclude_fields)

    # Replace foreign key IDs with names for better readability in audit logs
    if hasattr(instance, 'region') and instance.region:
        data['region'] = instance.region.name
    if hasattr(instance, 'departamento') and instance.departamento:
        data['departamento'] = instance.departamento.name
    if hasattr(instance, 'marca') and instance.marca:
        data['marca'] = instance.marca.name
    if hasattr(instance, 'tipo_activo') and instance.tipo_activo:
        data['tipo_activo'] = instance.tipo_activo.name

    return json.loads(json.dumps(data, cls=DjangoJSONEncoder))

def get_changed_fields(old_data, new_data):
    """Return only the fields that changed between old_data and new_data."""
    if not old_data or not new_data:
        return old_data or new_data or {}

    changed = {}
    all_keys = set(old_data.keys()) | set(new_data.keys())

    for key in all_keys:
        old_value = old_data.get(key)
        new_value = new_data.get(key)
        if old_value != new_value:
            changed[key] = {
                'old': old_value,
                'new': new_value
            }

    return changed

# ----------------------------------------------------
# APLICACIÓN DE PERMISOS: Usar permisos específicos del modelo para mayor seguridad.
# ----------------------------------------------------

class AuditLogMixin:
    def perform_create(self, serializer):
        instance = serializer.save()
        self._log_activity('CREATE', instance, old_data=None, new_data=serialize_model_data(instance))

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = serialize_model_data(old_instance)
        instance = serializer.save()
        new_data = serialize_model_data(instance)
        changed_fields = get_changed_fields(old_data, new_data)
        self._log_activity('UPDATE', instance, old_data=old_data, new_data=changed_fields)

    def perform_destroy(self, instance):
        old_data = serialize_model_data(instance)
        self._log_activity('DELETE', instance, old_data=old_data, new_data=None)
        super().perform_destroy(instance)

    def _log_activity(self, activity_type, instance, old_data=None, new_data=None):
        content_type = ContentType.objects.get_for_model(instance)
        AuditLog.objects.create(
            activity_type=activity_type,
            description=f"{activity_type} {instance.__class__.__name__}: {instance}",
            user=self.request.user,
            content_type=content_type,
            object_id=instance.pk,
            old_data=old_data,
            new_data=new_data
        )

class RegionViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    ViewSet para gestión CRUD de regiones geográficas.

    Incluye validación de integridad referencial para evitar eliminación
    de regiones que tienen fincas asignadas.
    """
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        """
        Elimina una región con validación de integridad referencial.

        Verifica que no existan fincas asignadas antes de permitir la eliminación.
        """
        instance = self.get_object()
        # Verificar si hay fincas asociadas
        if instance.fincas.exists():
            return Response(
                {"detail": "No se puede eliminar la región porque tiene fincas asignadas."},
                status=status.HTTP_400_BAD_REQUEST
            )
        self._log_activity('DELETE', instance, old_data=serialize_model_data(instance), new_data=None)
        return super().destroy(request, *args, **kwargs)

class FincaViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Finca.objects.all()
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FincaCreateUpdateSerializer
        return FincaSerializer

    # Usar permisos del modelo: requiere permisos específicos como masterdata.add_finca, etc.
    permission_classes = [permissions.IsAuthenticated]  # Temporarily allow all authenticated users for dropdowns


class DepartamentoViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializer
    pagination_class = StandardResultsSetPagination
    # Usar permisos del modelo: requiere permisos específicos como masterdata.add_departamento, etc.
    permission_classes = [permissions.IsAuthenticated]  # Temporarily allow all authenticated users for dropdowns
    search_fields = ['name']

class AreaViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Area.objects.select_related('departamento').all()
    serializer_class = AreaSerializer
    pagination_class = StandardResultsSetPagination
    # Usar permisos del modelo: requiere permisos específicos como masterdata.add_area, etc.
    permission_classes = [permissions.IsAuthenticated]  # Temporarily allow all authenticated users for dropdowns
    search_fields = ['name', 'departamento__name']
    filterset_fields = ['departamento']

class TipoActivoViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = TipoActivo.objects.all()
    serializer_class = TipoActivoSerializer
    pagination_class = StandardResultsSetPagination
    # Usar permisos del modelo: requiere permisos específicos como masterdata.add_tipoactivo, etc.
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

class MarcaViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    pagination_class = StandardResultsSetPagination
    # Usar permisos del modelo: requiere permisos específicos como masterdata.add_marca, etc.
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

class ModeloActivoViewSet(AuditLogMixin, viewsets.ModelViewSet):
    # Optimización: Usamos select_related para obtener los nombres de Marca y TipoActivo
    queryset = ModeloActivo.objects.select_related('marca', 'tipo_activo').all()
    serializer_class = ModeloActivoSerializer
    pagination_class = StandardResultsSetPagination
    # Usar permisos del modelo: requiere permisos específicos como masterdata.add_modeloactivo, etc.
    permission_classes = [permissions.IsAuthenticated]  # Temporarily allow all authenticated users for dropdowns

    # Permite buscar por nombre del modelo, marca y tipo de activo
    search_fields = ['name', 'marca__name', 'tipo_activo__name']
    filterset_fields = ['marca', 'tipo_activo']

class ProveedorViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    pagination_class = StandardResultsSetPagination
    # Usar permisos del modelo: requiere permisos específicos como masterdata.add_proveedor, etc.
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
    search_fields = ['nombre_empresa', 'nit', 'nombre_contacto']

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('user', 'content_type').order_by('-timestamp')
    serializer_class = AuditLogSerializer
    pagination_class = StandardResultsSetPagination
    # permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]  # Temporarily commented for testing
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['activity_type', 'description', 'user__username']
    filterset_fields = ['activity_type', 'user']


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def audit_logs_report_csv(request):
    """Generate CSV report for audit logs with filters"""
    # Get filter parameters
    activity_type = request.GET.get('activity_type')
    user_id = request.GET.get('user')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    content_type_id = request.GET.get('content_type')

    # Build queryset
    queryset = AuditLog.objects.select_related('user', 'content_type').order_by('-timestamp')

    if activity_type:
        queryset = queryset.filter(activity_type=activity_type)
    if user_id:
        queryset = queryset.filter(user_id=user_id)
    if content_type_id:
        try:
            # content_type_id comes as 'app_label.model' format from frontend
            app_label, model = content_type_id.split('.')
            content_type = ContentType.objects.get(app_label=app_label, model=model)
            queryset = queryset.filter(content_type=content_type)
        except (ValueError, ContentType.DoesNotExist):
            # If parsing fails or content type doesn't exist, return empty queryset
            queryset = queryset.none()

    # Date filtering
    if fecha_desde:
        try:
            fecha_desde = datetime.strptime(fecha_desde, '%Y-%m-%d')
            queryset = queryset.filter(timestamp__gte=fecha_desde)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_hasta = datetime.strptime(fecha_hasta, '%Y-%m-%d')
            # Add one day to include the entire end date
            from datetime import timedelta
            fecha_hasta = fecha_hasta + timedelta(days=1)
            queryset = queryset.filter(timestamp__lt=fecha_hasta)
        except ValueError:
            pass

    # Create CSV response with UTF-8 BOM for Excel compatibility
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="reporte_auditoria.csv"'
    # Add UTF-8 BOM for proper Excel display
    response.write('\ufeff')

    writer = csv.writer(response)
    # Write header
    writer.writerow([
        'ID', 'Fecha/Hora', 'Tipo Actividad', 'Descripción', 'Usuario',
        'Tipo Contenido', 'ID Objeto', 'Datos Anteriores', 'Datos Nuevos'
    ])

    # Write data
    for log in queryset:
        # Format old_data and new_data as JSON strings
        old_data_str = json.dumps(log.old_data, ensure_ascii=False) if log.old_data else ''
        new_data_str = json.dumps(log.new_data, ensure_ascii=False) if log.new_data else ''

        writer.writerow([
            log.id,
            log.timestamp.isoformat(),
            log.activity_type,
            log.description,
            log.user.username if log.user else '',
            log.content_type.name if log.content_type else '',
            log.object_id,
            old_data_str,
            new_data_str
        ])

    return response