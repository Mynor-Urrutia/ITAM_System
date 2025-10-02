from rest_framework import viewsets, permissions, status
from rest_framework import filters as drf_filters
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes, action
from django.db.models import ProtectedError, Count, Q
from datetime import date, timedelta
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
from django.utils import timezone
from django_filters import rest_framework as filters
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from datetime import datetime
import json
import os
import uuid

from .models import Activo, Maintenance
from .serializers import ActivoSerializer, MaintenanceSerializer
from django.contrib.auth import get_user_model

User = get_user_model()
from masterdata.models import TipoActivo, Region

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5  # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 200

class ActivoFilter(filters.FilterSet):
    fecha_garantia_desde = filters.DateFilter(field_name='fecha_fin_garantia', lookup_expr='gte')
    fecha_garantia_hasta = filters.DateFilter(field_name='fecha_fin_garantia', lookup_expr='lte')
    region_name = filters.CharFilter(field_name='region__name', lookup_expr='icontains')

    class Meta:
        model = Activo
        fields = ['estado', 'tipo_activo', 'proveedor', 'marca', 'modelo', 'region', 'finca', 'departamento', 'area']

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

def save_uploaded_documents(files, subfolder='documents'):
    """Save uploaded files and return list of relative paths."""
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
    saved_paths = []

    for file in files:
        if file:
            ext = file.name.split('.')[-1].lower()
            if ext not in allowed_extensions:
                raise ValueError(f"Tipo de archivo no permitido: {ext}. Solo se permiten imágenes, PDF y documentos Word.")

            # Generate unique filename
            unique_name = f"{uuid.uuid4()}.{ext}"
            path = os.path.join(subfolder, unique_name)

            # Save file
            file_path = default_storage.save(path, ContentFile(file.read()))
            saved_paths.append(file_path)

    return saved_paths

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
    filter_backends = [drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = ActivoFilter
    search_fields = ['serie', 'hostname', 'solicitante', 'correo_electronico', 'orden_compra', 'region__name', 'cuenta_contable', 'departamento__name', 'area__name']
    ordering_fields = ['hostname', 'serie', 'tipo_activo__name', 'marca__name', 'modelo__name', 'fecha_fin_garantia', 'region__name', 'finca__name', 'estado']
    ordering = ['hostname']  # Default ordering

    def get_queryset(self):
        queryset = Activo.objects.select_related(
            'tipo_activo', 'proveedor', 'marca', 'modelo', 'region', 'finca', 'departamento', 'area'
        )

        # For detail actions, don't filter by estado to allow operations on retired assets
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'retire', 'reactivate']:
            return queryset

        # For list, filter by estado: default to 'activo', but allow 'all' to include retired
        estado_filter = self.request.query_params.get('estado', 'activo')
        if estado_filter == 'all':
            pass  # Include all
        elif estado_filter == 'retirado':
            queryset = queryset.filter(estado='retirado')
        else:
            queryset = queryset.filter(estado='activo')

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def retire(self, request, pk=None):
        """Retire an asset by setting its estado to 'retirado', fecha_baja to now, and recording motivo, usuario, and documents"""
        activo = self.get_object()

        if activo.estado == 'retirado':
            return Response({'error': 'El activo ya está retirado'}, status=status.HTTP_400_BAD_REQUEST)

        motivo = request.data.get('motivo_baja', '').strip()
        if not motivo:
            return Response({'error': 'El motivo de baja es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle file uploads
        documentos_paths = []
        if 'documentos_baja' in request.FILES:
            files = request.FILES.getlist('documentos_baja')
            try:
                documentos_paths = save_uploaded_documents(files, 'retirement_documents')
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        activo.estado = 'retirado'
        activo.fecha_baja = timezone.now()
        activo.motivo_baja = motivo
        activo.usuario_baja = request.user
        activo.documentos_baja = documentos_paths if documentos_paths else None
        activo.save()

        # Log the retirement
        new_data = {
            'estado': 'retirado',
            'fecha_baja': activo.fecha_baja.isoformat(),
            'motivo_baja': motivo,
            'usuario_baja': request.user.username
        }
        if documentos_paths:
            new_data['documentos_baja'] = documentos_paths

        self._log_activity('RETIRE', activo,
                           old_data={'estado': 'activo'},
                           new_data=new_data)

        serializer = self.get_serializer(activo)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reactivate(self, request, pk=None):
        """Reactivate a retired asset by setting its estado to 'activo' and clearing retirement fields"""
        activo = self.get_object()

        if activo.estado == 'activo':
            return Response({'error': 'El activo ya está activo'}, status=status.HTTP_400_BAD_REQUEST)

        # Store old data including documents for audit log
        old_data = {
            'estado': 'retirado',
            'fecha_baja': activo.fecha_baja.isoformat() if activo.fecha_baja else None,
            'motivo_baja': activo.motivo_baja,
            'usuario_baja': activo.usuario_baja.username if activo.usuario_baja else None,
            'documentos_baja': activo.documentos_baja
        }

        # Delete associated files from filesystem
        if activo.documentos_baja:
            for doc_path in activo.documentos_baja:
                try:
                    if default_storage.exists(doc_path):
                        default_storage.delete(doc_path)
                except Exception as e:
                    # Log the error but don't fail the reactivation
                    print(f"Error deleting file {doc_path}: {e}")

        activo.estado = 'activo'
        activo.fecha_baja = None
        activo.motivo_baja = None
        activo.usuario_baja = None
        activo.documentos_baja = None  # Clear the documents field
        activo.save()

        # Log the reactivation
        self._log_activity('REACTIVATE', activo,
                            old_data=old_data,
                            new_data={
                                'estado': 'activo',
                                'fecha_baja': None,
                                'motivo_baja': None,
                                'usuario_baja': None,
                                'documentos_baja': None
                            })

        serializer = self.get_serializer(activo)
        return Response(serializer.data)


class MaintenanceViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Maintenance.objects.select_related('activo', 'technician').all()
    serializer_class = MaintenanceSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

    def get_queryset(self):
        queryset = Maintenance.objects.select_related('activo', 'technician')
        activo_id = self.request.query_params.get('activo', None)
        if activo_id:
            queryset = queryset.filter(activo_id=activo_id)
        return queryset

    def create(self, request, *args, **kwargs):
        # Handle file uploads for maintenance creation
        attachments_paths = []

        if 'attachments' in request.FILES:
            files = request.FILES.getlist('attachments')
            try:
                attachments_paths = save_uploaded_documents(files, 'maintenance_documents')
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Extract data from request

        data = {
            'asset_identifier': request.data.get('asset_identifier'),  # hostname or serie
            'maintenance_date': request.data.get('maintenance_date'),
            'technician_id': request.data.get('technician'),
            'findings': request.data.get('findings'),
            'attachments': attachments_paths if attachments_paths else None
        }

        # Parse date if it's a string
        if data['maintenance_date'] and isinstance(data['maintenance_date'], str):
            try:
                data['maintenance_date'] = datetime.strptime(data['maintenance_date'], '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        # Validate required fields
        if not all([data['asset_identifier'], data['maintenance_date'], data['technician_id'], data['findings']]):
            return Response({'error': 'Todos los campos son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Find activo by hostname or serie
            activo = Activo.objects.filter(
                Q(hostname=data['asset_identifier']) | Q(serie=data['asset_identifier'])
            ).first()
            if not activo:
                return Response({'error': 'Activo no encontrado con el identificador proporcionado'}, status=status.HTTP_404_NOT_FOUND)

            technician = User.objects.get(id=data['technician_id'])

            # Create maintenance instance
            maintenance = Maintenance(
                activo=activo,
                maintenance_date=data['maintenance_date'],
                technician=technician,
                findings=data['findings'],
                attachments=data['attachments']
            )
            maintenance.save()  # Explicitly call save to ensure next_maintenance_date is calculated

            # Log the maintenance creation
            self._log_activity('CREATE', maintenance,
                               old_data=None,
                               new_data={
                                   'maintenance_date': maintenance.maintenance_date.isoformat(),
                                   'technician': maintenance.technician.username,
                                   'findings': maintenance.findings,
                                   'next_maintenance_date': maintenance.next_maintenance_date.isoformat() if maintenance.next_maintenance_date else None,
                                   'attachments': attachments_paths if attachments_paths else []
                               })

            serializer = self.get_serializer(maintenance)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except Activo.DoesNotExist:
            return Response({'error': 'Activo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'Técnico no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        # This method is now handled in create() above
        pass


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_warranty_data(request):
    # Get assets with warranty expiring within 90 days
    today = date.today()
    ninety_days_from_now = today + timedelta(days=90)

    # Get assets with warranty expiration in the next 90 days (but not today)
    expiring_assets = Activo.objects.filter(
        Q(fecha_fin_garantia__gt=today) & Q(fecha_fin_garantia__lte=ninety_days_from_now),
        estado='activo'
    ).select_related('modelo', 'region').order_by('fecha_fin_garantia')

    # Group by exact expiration date
    warranty_data = {}

    for asset in expiring_assets:
        expiry_date_str = asset.fecha_fin_garantia.isoformat()
        region_name = asset.region.name
        model_name = asset.modelo.name

        if expiry_date_str not in warranty_data:
            warranty_data[expiry_date_str] = {}

        if region_name not in warranty_data[expiry_date_str]:
            warranty_data[expiry_date_str][region_name] = {}

        if model_name not in warranty_data[expiry_date_str][region_name]:
            warranty_data[expiry_date_str][region_name][model_name] = {
                'count': 0,
                'assets': []
            }

        warranty_data[expiry_date_str][region_name][model_name]['count'] += 1
        warranty_data[expiry_date_str][region_name][model_name]['assets'].append({
            'id': asset.id,
            'serie': asset.serie,
            'hostname': asset.hostname
        })

    # Convert to list format for easier frontend consumption
    data = {
        'warranty_info': []
    }

    for expiry_date_str, regions in warranty_data.items():
        for region_name, models in regions.items():
            for model_name, info in models.items():
                data['warranty_info'].append({
                    'expiry_date': expiry_date_str,
                    'region': region_name,
                    'model': model_name,
                    'count': info['count'],
                    'assets': info['assets']
                })

    # Sort by expiry date
    data['warranty_info'].sort(key=lambda x: x['expiry_date'])

    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    # Get summary statistics for dashboard cards
    today = date.today()
    thirty_days_from_now = today + timedelta(days=30)

    # Total assets card
    total_assets = Activo.objects.filter(estado='activo').count()

    # Get all asset types that have assets
    asset_types_data = []
    tipos_activo = TipoActivo.objects.all()

    for tipo in tipos_activo:
        # Count total assets for this type
        total_count = Activo.objects.filter(tipo_activo=tipo, estado='activo').count()

        if total_count > 0:  # Only include types that have assets
            # Assets with valid warranty (>30 days)
            valid_warranty = Activo.objects.filter(
                tipo_activo=tipo,
                estado='activo',
                fecha_fin_garantia__gt=thirty_days_from_now
            ).exclude(fecha_fin_garantia__isnull=True).count()

            # Assets with warranty expiring within 30 days (but not today)
            expiring_warranty = Activo.objects.filter(
                tipo_activo=tipo,
                estado='activo',
                fecha_fin_garantia__gt=today,
                fecha_fin_garantia__lte=thirty_days_from_now
            ).count()

            # Assets without warranty or expired warranty
            no_warranty = Activo.objects.filter(
                Q(tipo_activo=tipo) &
                Q(estado='activo') &
                (Q(fecha_fin_garantia__isnull=True) | Q(fecha_fin_garantia__lte=today))
            ).count()

            asset_types_data.append({
                'tipo_activo': tipo.name,
                'total_equipment': total_count,
                'valid_warranty': valid_warranty,
                'expiring_warranty': expiring_warranty,
                'no_warranty': no_warranty
            })

    data = {
        'total_assets': total_assets,
        'asset_types': asset_types_data
    }

    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_detail_data(request):
    """Get detailed asset data for a specific category with sorting and pagination"""
    category = request.GET.get('category', '')
    ordering = request.GET.get('ordering', 'serie')  # Default sort by serie
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))

    if category == 'total_assets':
        assets = Activo.objects.select_related('tipo_activo', 'marca', 'modelo', 'region').filter(estado='activo')
    elif category == 'valid_warranty':
        today = date.today()
        thirty_days_from_now = today + timedelta(days=30)
        assets = Activo.objects.select_related('tipo_activo', 'marca', 'modelo', 'region').filter(
            estado='activo',
            fecha_fin_garantia__gt=thirty_days_from_now
        ).exclude(fecha_fin_garantia__isnull=True)
    elif category == 'expiring_warranty':
        today = date.today()
        thirty_days_from_now = today + timedelta(days=30)
        assets = Activo.objects.select_related('tipo_activo', 'marca', 'modelo', 'region').filter(
            Q(estado='activo') &
            Q(fecha_fin_garantia__gt=today) & Q(fecha_fin_garantia__lte=thirty_days_from_now)
        )
    elif category == 'no_warranty':
        today = date.today()
        assets = Activo.objects.select_related('tipo_activo', 'marca', 'modelo', 'region').filter(
            Q(estado='activo') &
            (Q(fecha_fin_garantia__isnull=True) | Q(fecha_fin_garantia__lte=today))
        )
    else:
        # Check if category matches an asset type name
        try:
            tipo_activo = TipoActivo.objects.get(name=category)
            assets = Activo.objects.select_related('tipo_activo', 'marca', 'modelo', 'region').filter(
                tipo_activo=tipo_activo,
                estado='activo'
            )
        except TipoActivo.DoesNotExist:
            return Response({'error': 'Invalid category'}, status=400)

    # Apply ordering
    if ordering.startswith('-'):
        assets = assets.order_by(ordering)
    else:
        assets = assets.order_by(ordering)

    # Get total count for pagination
    total_count = assets.count()

    # Apply pagination
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    assets_page = assets[start_index:end_index]

    # Serialize the assets
    data = []
    for asset in assets_page:
        data.append({
            'id': asset.id,
            'serie': asset.serie,
            'hostname': asset.hostname,
            'tipo_activo': asset.tipo_activo.name if asset.tipo_activo else '',
            'marca': asset.marca.name if asset.marca else '',
            'modelo': asset.modelo.name if asset.modelo else '',
            'region': asset.region.name if asset.region else '',
            'fecha_registro': asset.fecha_registro.isoformat() if asset.fecha_registro else None,
            'fecha_fin_garantia': asset.fecha_fin_garantia.isoformat() if asset.fecha_fin_garantia else None,
            'solicitante': asset.solicitante or '',
            'orden_compra': asset.orden_compra or ''
        })

    return Response({
        'assets': data,
        'category': category,
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total_count': total_count,
            'total_pages': (total_count + page_size - 1) // page_size
        }
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_data(request):
    # Get all tipos_activo and regions
    tipos_activo = TipoActivo.objects.all().order_by('name')
    regions = Region.objects.all().order_by('name')

    # Prepare data structure
    data = {
        'tipos_activo': [],
        'regions': [region.name for region in regions],
        'totals': {region.name: 0 for region in regions}
    }

    for tipo in tipos_activo:
        tipo_data = {
            'name': tipo.name,
            'counts': {region.name: 0 for region in regions},
            'total': 0
        }

        # Count assets for this tipo_activo per region
        counts = Activo.objects.filter(tipo_activo=tipo, estado='activo').values('region__name').annotate(count=Count('id'))

        for count_data in counts:
            region_name = count_data['region__name']
            count = count_data['count']
            tipo_data['counts'][region_name] = count
            tipo_data['total'] += count
            data['totals'][region_name] += count

        data['tipos_activo'].append(tipo_data)

    # Add total row
    total_row = {
        'name': 'Total',
        'counts': data['totals'],
        'total': sum(data['totals'].values())
    }
    data['tipos_activo'].append(total_row)

    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_models_data(request):
    from masterdata.models import ModeloActivo

    regions = Region.objects.all().order_by('name')

    # Get all modelos_activo with their total counts
    modelos_with_counts = []
    for modelo in ModeloActivo.objects.select_related('marca', 'tipo_activo').all():
        total_count = Activo.objects.filter(modelo=modelo, estado='activo').count()
        if total_count > 0:  # Only include models that have assets
            modelos_with_counts.append({
                'modelo': modelo,
                'total_count': total_count
            })

    # Sort by total count descending and take top 10
    modelos_with_counts.sort(key=lambda x: x['total_count'], reverse=True)
    top_modelos = modelos_with_counts[:10]
    other_modelos = modelos_with_counts[10:]

    # Prepare data structure
    data = {
        'modelos_activo': [],
        'regions': [region.name for region in regions],
        'totals': {region.name: 0 for region in regions}
    }

    # Process top 10 models
    for item in top_modelos:
        modelo = item['modelo']
        modelo_data = {
            'name': modelo.name,  # Just model name without brand
            'counts': {region.name: 0 for region in regions},
            'total': 0
        }

        # Count assets for this modelo per region
        counts = Activo.objects.filter(modelo=modelo, estado='activo').values('region__name').annotate(count=Count('id'))

        for count_data in counts:
            region_name = count_data['region__name']
            count = count_data['count']
            modelo_data['counts'][region_name] = count
            modelo_data['total'] += count
            data['totals'][region_name] += count

        data['modelos_activo'].append(modelo_data)

    # If there are other models, aggregate them into "Otros modelos"
    if other_modelos:
        otros_data = {
            'name': 'Otros modelos',
            'counts': {region.name: 0 for region in regions},
            'total': 0
        }

        for item in other_modelos:
            modelo = item['modelo']
            counts = Activo.objects.filter(modelo=modelo, estado='activo').values('region__name').annotate(count=Count('id'))

            for count_data in counts:
                region_name = count_data['region__name']
                count = count_data['count']
                otros_data['counts'][region_name] += count
                otros_data['total'] += count
                data['totals'][region_name] += count

        data['modelos_activo'].append(otros_data)

    # Add total row
    total_row = {
        'name': 'Total',
        'counts': data['totals'],
        'total': sum(data['totals'].values())
    }
    data['modelos_activo'].append(total_row)

    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def maintenance_overview(request):
    """Get maintenance overview data for all active assets"""
    from datetime import date
    today = date.today()

    # Get ordering parameter
    ordering = request.GET.get('ordering', 'hostname')  # Default ordering

    activos = Activo.objects.select_related('marca', 'modelo', 'region', 'finca').filter(estado='activo')

    data = []
    for activo in activos:
        # Get the latest maintenance for this activo
        latest_maintenance = Maintenance.objects.filter(activo=activo).select_related('technician').order_by('-created_at').first()

        if latest_maintenance:
            status = 'realizados'
            ultimo_mantenimiento = latest_maintenance.maintenance_date
            proximo_mantenimiento = latest_maintenance.next_maintenance_date
            tecnico_mantenimiento = latest_maintenance.technician.username
        else:
            status = 'nunca'
            ultimo_mantenimiento = None
            proximo_mantenimiento = None
            tecnico_mantenimiento = ''

        data.append({
            'id': activo.id,
            'hostname': activo.hostname,
            'serie': activo.serie,
            'marca': activo.marca.name if activo.marca else '',
            'modelo': activo.modelo.name if activo.modelo else '',
            'ultimo_mantenimiento': ultimo_mantenimiento.isoformat() if ultimo_mantenimiento else None,
            'proximo_mantenimiento': proximo_mantenimiento.isoformat() if proximo_mantenimiento else None,
            'region': activo.region.name if activo.region else '',
            'finca': activo.finca.name if activo.finca else '',
            'tecnico_mantenimiento': tecnico_mantenimiento,
            'status': status,
            'maintenance_id': latest_maintenance.id if latest_maintenance else None
        })

    # Apply sorting
    reverse = ordering.startswith('-')
    sort_key = ordering.lstrip('-')

    def sort_func(item):
        value = item.get(sort_key, '')
        if sort_key in ['ultimo_mantenimiento', 'proximo_mantenimiento']:
            # Handle date sorting
            return value or '9999-12-31'  # Put None values at the end
        elif sort_key == 'status':
            # Custom status ordering: realizados, proximos, nunca
            status_order = {'realizados': 0, 'proximos': 1, 'nunca': 2}
            return status_order.get(value, 3)
        else:
            # String sorting
            return value.lower() if isinstance(value, str) else str(value)

    data.sort(key=sort_func, reverse=reverse)

    return Response(data)
