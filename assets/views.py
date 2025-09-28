from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import ProtectedError
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
import json

from .models import Activo
from .serializers import ActivoSerializer

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
        from masterdata.models import AuditLog, ContentType
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

class ActivoViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Activo.objects.select_related(
        'tipo_activo', 'proveedor', 'marca', 'modelo', 'region', 'finca', 'departamento', 'area'
    ).all()
    serializer_class = ActivoSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
    search_fields = ['serie', 'hostname', 'solicitante', 'correo_electronico', 'orden_compra']
    filterset_fields = [
        'tipo_activo', 'proveedor', 'marca', 'modelo',
        'region', 'finca', 'departamento', 'area'
    ]
