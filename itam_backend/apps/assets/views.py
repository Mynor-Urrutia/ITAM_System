from rest_framework import viewsets, permissions, status
from rest_framework import filters as drf_filters
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes, action
from django.db import models
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
from datetime import datetime, time
from django.http import HttpResponse
import json
import os
import uuid
import csv

from .models import Activo, Maintenance, Assignment
from .serializers import ActivoSerializer, MaintenanceSerializer, AssignmentSerializer
from django.contrib.auth import get_user_model
from apps.users.permissions import CanViewReports

User = get_user_model()
from apps.masterdata.models import TipoActivo, Region

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5  # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 200

class ActivoFilter(filters.FilterSet):
    fecha_garantia_desde = filters.DateFilter(field_name='fecha_fin_garantia', lookup_expr='gte')
    fecha_garantia_hasta = filters.DateFilter(field_name='fecha_fin_garantia', lookup_expr='lte')
    region_name = filters.CharFilter(field_name='region__name', lookup_expr='icontains')
    assigned_to = filters.NumberFilter(field_name='assigned_to', lookup_expr='exact')

    class Meta:
        model = Activo
        fields = ['id', 'estado', 'tipo_activo', 'proveedor', 'marca', 'modelo', 'region', 'finca', 'departamento', 'area', 'assigned_to']

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
    if hasattr(instance, 'area') and instance.area:
        data['area'] = instance.area.name
    if hasattr(instance, 'finca') and instance.finca:
        data['finca'] = instance.finca.name
    if hasattr(instance, 'modelo') and instance.modelo:
        data['modelo'] = str(instance.modelo)
    if hasattr(instance, 'proveedor') and instance.proveedor:
        data['proveedor'] = instance.proveedor.nombre_empresa

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
        from apps.masterdata.models import AuditLog, ContentType
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
    filter_backends = [drf_filters.SearchFilter, drf_filters.OrderingFilter, filters.DjangoFilterBackend]
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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, permissions.DjangoModelPermissions])
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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, permissions.DjangoModelPermissions])
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


class AssignmentViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related(
        'activo', 'employee', 'assigned_by', 'returned_by'
    ).all()
    serializer_class = AssignmentSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
    filter_backends = [drf_filters.SearchFilter, drf_filters.OrderingFilter]
    search_fields = ['activo__hostname', 'activo__serie', 'employee__first_name', 'employee__last_name', 'employee__employee_number']
    ordering_fields = ['assigned_date', 'returned_date', 'activo__hostname', 'employee__first_name']
    ordering = ['-assigned_date']

    def get_queryset(self):
        queryset = Assignment.objects.select_related(
            'activo', 'employee', 'assigned_by', 'returned_by'
        )

        # Filter by employee if provided
        employee_id = self.request.query_params.get('employee', None)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)

        # Filter by activo if provided
        activo_id = self.request.query_params.get('activo', None)
        if activo_id:
            queryset = queryset.filter(activo_id=activo_id)

        # Filter by active assignments only (not returned)
        active_only = self.request.query_params.get('active_only', 'false').lower() == 'true'
        if active_only:
            queryset = queryset.filter(returned_date__isnull=True)

        return queryset

    def perform_create(self, serializer):
        # Set the assigned_by to the current user
        serializer.save(assigned_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def return_assignment(self, request, pk=None):
        """Return an assignment by setting returned_date and returned_by"""
        assignment = self.get_object()

        if assignment.returned_date:
            return Response({'error': 'Esta asignación ya fue devuelta'}, status=status.HTTP_400_BAD_REQUEST)

        return_date = request.data.get('return_date')
        if return_date:
            try:
                if isinstance(return_date, str):
                    parsed_date = datetime.strptime(return_date, '%Y-%m-%d').date()
                    return_date = datetime.combine(parsed_date, time.min)
                    return_date = timezone.make_aware(return_date)
            except ValueError:
                return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return_date = timezone.now()

        # Update the assignment
        old_data = serialize_model_data(assignment)
        assignment.returned_date = return_date
        assignment.returned_by = request.user
        assignment.save()

        # Log the return
        try:
            new_data = serialize_model_data(assignment)
            self._log_activity('RETURN', assignment, old_data=old_data, new_data=new_data)
        except Exception as e:
            print(f"Error logging return assignment: {e}")

        serializer = self.get_serializer(assignment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def available_assets(self, request):
        """Get assets that are not currently assigned (available for assignment)"""
        # Get all active assets that are not currently assigned
        assigned_activo_ids = Assignment.objects.filter(
            returned_date__isnull=True
        ).values_list('activo_id', flat=True)

        available_assets = Activo.objects.filter(
            estado='activo'
        ).exclude(id__in=assigned_activo_ids).select_related(
            'tipo_activo', 'marca', 'modelo', 'region'
        )

        # Apply search filter if provided
        search = request.query_params.get('search', '')
        if search:
            available_assets = available_assets.filter(
                Q(hostname__icontains=search) |
                Q(serie__icontains=search) |
                Q(tipo_activo__name__icontains=search) |
                Q(marca__name__icontains=search) |
                Q(modelo__name__icontains=search)
            )

        # Apply tipo_activo filter if provided (for showing only certain types)
        tipo_activo_id = request.query_params.get('tipo_activo', None)
        if tipo_activo_id:
            available_assets = available_assets.filter(tipo_activo_id=tipo_activo_id)

        # Apply pagination
        paginator = StandardResultsSetPagination()
        paginated_assets = paginator.paginate_queryset(available_assets, request)

        # Serialize using ActivoSerializer
        serializer = ActivoSerializer(paginated_assets, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def bulk_assign(self, request):
        """Assign multiple assets to an employee at once with optional asset updates"""
        employee_id = request.data.get('employee_id')
        activo_ids = request.data.get('activo_ids', [])
        asset_updates = request.data.get('asset_updates', {})  # Dict of activo_id -> update_data

        if not employee_id:
            return Response({'error': 'employee_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        if not activo_ids:
            return Response({'error': 'activo_ids es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from apps.employees.models import Employee
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Validate all assets exist and are available
        activos = Activo.objects.filter(id__in=activo_ids, estado='activo')
        if activos.count() != len(activo_ids):
            return Response({'error': 'Uno o más activos no existen o no están activos'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for already assigned assets
        assigned_activos = Assignment.objects.filter(
            activo_id__in=activo_ids,
            returned_date__isnull=True
        ).values_list('activo_id', flat=True)

        if assigned_activos:
            assigned_hostnames = Activo.objects.filter(id__in=assigned_activos).values_list('hostname', flat=True)
            return Response({
                'error': f'Los siguientes activos ya están asignados: {", ".join(assigned_hostnames)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check assignment rules: one per tipo_activo
        employee_active_assignments = Assignment.objects.filter(
            employee=employee,
            returned_date__isnull=True
        ).select_related('activo__tipo_activo')

        assigned_tipos = {assignment.activo.tipo_activo for assignment in employee_active_assignments}
        conflicting_tipos = []

        for activo in activos:
            if activo.tipo_activo in assigned_tipos:
                conflicting_tipos.append(activo.tipo_activo.name)

        if conflicting_tipos:
            return Response({
                'error': f'El empleado ya tiene asignado activos de los siguientes tipos: {", ".join(set(conflicting_tipos))}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create assignments and update assets
        created_assignments = []
        updated_assets = []

        for activo in activos:
            # Update asset if updates provided
            activo_id_str = str(activo.id)
            asset_updated = False
            if activo_id_str in asset_updates:
                update_data = asset_updates[activo_id_str]
                old_asset_data = serialize_model_data(activo)
                for field, value in update_data.items():
                    # Skip empty strings for integer fields
                    if hasattr(activo, field) and value is not None:
                        field_obj = activo._meta.get_field(field)
                        # Skip empty strings for integer fields
                        if isinstance(field_obj, models.IntegerField) and value == '':
                            continue
                        # Check if value has actually changed
                        if str(getattr(activo, field)) != str(value):
                            setattr(activo, field, value)
                            asset_updated = True

                if asset_updated:
                    activo.save()
                    updated_assets.append(activo)
                    # Log asset update
                    new_asset_data = serialize_model_data(activo)
                    self._log_activity('UPDATE', activo, old_data=old_asset_data, new_data=new_asset_data)

            # Create assignment
            assignment = Assignment.objects.create(
                activo=activo,
                employee=employee,
                assigned_by=request.user
            )
            created_assignments.append(assignment)

            # Log the assignment
            self._log_activity('CREATE', assignment, old_data=None, new_data=serialize_model_data(assignment))

        serializer = self.get_serializer(created_assignments, many=True)
        return Response({
            'assignments': serializer.data,
            'updated_assets': ActivoSerializer(updated_assets, many=True).data if updated_assets else []
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_warranty_data(request):
    # Get assets with warranty expiring within 90 days (past or future)
    today = date.today()
    ninety_days_ago = today - timedelta(days=90)
    ninety_days_from_now = today + timedelta(days=90)

    # Get assets with warranty expiration within 90 days (including expired and upcoming)
    expiring_assets = Activo.objects.filter(
        Q(fecha_fin_garantia__gte=ninety_days_ago) & Q(fecha_fin_garantia__lte=ninety_days_from_now),
        estado='activo'
    ).select_related('modelo', 'marca', 'region', 'tipo_activo').order_by('fecha_fin_garantia')

    # Return individual assets with required fields
    data = {
        'warranty_assets': []
    }

    for asset in expiring_assets:
        data['warranty_assets'].append({
            'id': asset.id,
            'fecha_vencimiento_garantia': asset.fecha_fin_garantia.isoformat(),
            'region': asset.region.name if asset.region else '',
            'marca': asset.marca.name if asset.marca else '',
            'modelo': asset.modelo.name if asset.modelo else '',
            'tipo_activo': asset.tipo_activo.name if asset.tipo_activo else '',
            'serie': asset.serie,
            'hostname': asset.hostname
        })

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
    from apps.masterdata.models import ModeloActivo

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
    from datetime import date, timedelta
    today = date.today()

    # Get filters
    region_filter = request.GET.getlist('regions', [])
    tipo_filter = request.GET.getlist('tipos', [])
    status_filter = request.GET.getlist('status', [])

    # Get all active assets
    activos = Activo.objects.select_related('tipo_activo', 'marca', 'modelo', 'region', 'finca', 'tecnico_mantenimiento').filter(estado='activo')

    # Get filter options from all active assets
    all_activos = Activo.objects.filter(estado='activo')
    unique_regions = list(all_activos.values_list('region__name', flat=True).distinct().exclude(region__name__isnull=True).order_by('region__name'))
    unique_tipos = list(all_activos.values_list('tipo_activo__name', flat=True).distinct().exclude(tipo_activo__name__isnull=True).order_by('tipo_activo__name'))

    # Apply region filter if specified
    if region_filter:
        activos = activos.filter(region__name__in=region_filter)

    # Apply tipo filter if specified
    if tipo_filter:
        activos = activos.filter(tipo_activo__name__in=tipo_filter)

    data = []
    for activo in activos:
        # Use the maintenance dates stored directly on the Activo model (these are updated by Maintenance.save())
        ultimo_mantenimiento = activo.ultimo_mantenimiento
        proximo_mantenimiento = activo.proximo_mantenimiento
        tecnico_mantenimiento = activo.tecnico_mantenimiento.username if activo.tecnico_mantenimiento else ''

        # If Activo fields are empty, check Maintenance records as fallback
        if not ultimo_mantenimiento or not proximo_mantenimiento:
            latest_maintenance = Maintenance.objects.filter(activo=activo).select_related('technician').order_by('-created_at').first()
            if latest_maintenance:
                ultimo_mantenimiento = latest_maintenance.maintenance_date
                proximo_mantenimiento = latest_maintenance.next_maintenance_date
                tecnico_mantenimiento = latest_maintenance.technician.username if latest_maintenance.technician else ''

        # Determine status based on maintenance dates - COMPREHENSIVE LOGIC
        if not ultimo_mantenimiento and not proximo_mantenimiento:
            # No maintenance history at all
            status = 'nunca'
        elif ultimo_mantenimiento and not proximo_mantenimiento:
            # Has maintenance history but no next scheduled
            status = 'realizados'
        elif proximo_mantenimiento:
            # Has next maintenance scheduled
            if proximo_mantenimiento < today:
                # Next maintenance is overdue
                status = 'vencidos'
            elif proximo_mantenimiento <= today + timedelta(days=30):
                # Next maintenance is within 30 days (extended from 15)
                status = 'proximos'
            else:
                # Next maintenance is scheduled but not urgent
                status = 'realizados'
        else:
            # Fallback case - has last maintenance
            status = 'realizados'

        data.append({
            'id': activo.id,
            'hostname': activo.hostname,
            'serie': activo.serie,
            'tipo': activo.tipo_activo.name if activo.tipo_activo else '',
            'marca': activo.marca.name if activo.marca else '',
            'modelo': activo.modelo.name if activo.modelo else '',
            'ultimo_mantenimiento': ultimo_mantenimiento.isoformat() if ultimo_mantenimiento else None,
            'proximo_mantenimiento': proximo_mantenimiento.isoformat() if proximo_mantenimiento else None,
            'region': activo.region.name if activo.region else '',
            'finca': activo.finca.name if activo.finca else '',
            'tecnico_mantenimiento': tecnico_mantenimiento,
            'usuario': activo.tecnico_mantenimiento.username if activo.tecnico_mantenimiento else '',
            'status': status,
            'maintenance_id': None  # Not needed for this view
        })

    # Apply custom sorting or user-specified ordering
    ordering = request.GET.get('ordering')
    if ordering:
        reverse = ordering.startswith('-')
        field = ordering.lstrip('-')
        def sort_key(item):
            value = item.get(field)
            if value is None:
                # None values always at end for ascending, beginning for descending
                return ('z' * 100,)
            return (value,)
        data.sort(key=sort_key, reverse=reverse)
    else:
        # Default sorting: status priority (nunca, vencidos, proximos, realizados) then by proximo_mantenimiento date
        def sort_func(item):
            # Status priority: nunca (0), vencidos (1), proximos (2), realizados (3)
            status_priority = {'nunca': 0, 'vencidos': 1, 'proximos': 2, 'realizados': 3}
            status_value = status_priority.get(item.get('status'), 4)

            # For date sorting, use proximo_mantenimiento, put None values at the end
            date_value = item.get('proximo_mantenimiento') or '9999-12-31'

            return (status_value, date_value)

        data.sort(key=sort_func)
    
        # Apply status filter if specified
        if status_filter:
            data = [item for item in data if item['status'] in status_filter]

    # Apply pagination
    paginator = StandardResultsSetPagination()
    paginated_data = paginator.paginate_queryset(data, request)
    response = paginator.get_paginated_response(paginated_data)

    # Add filter options to response
    response.data['filter_options'] = {
        'regions': unique_regions,
        'tipos': unique_tipos,
        'statuses': ['nunca', 'proximos', 'vencidos', 'realizados']
    }

    return response


# CSV Report Generation Functions
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def assets_report_csv(request):
    """Generate CSV report for assets with filters"""
    # Get filter parameters
    estado = request.GET.get('estado', 'activo')
    tipo_activo = request.GET.get('tipo_activo')
    marca = request.GET.get('marca')
    modelo = request.GET.get('modelo')
    region = request.GET.get('region')
    finca = request.GET.get('finca')
    departamento = request.GET.get('departamento')
    area = request.GET.get('area')

    # Build queryset
    queryset = Activo.objects.select_related(
        'tipo_activo', 'proveedor', 'marca', 'modelo', 'region', 'finca', 'departamento', 'area'
    )

    if estado == 'all':
        pass  # Include all
    elif estado == 'retirado':
        queryset = queryset.filter(estado='retirado')
    else:
        queryset = queryset.filter(estado='activo')

    if tipo_activo:
        queryset = queryset.filter(tipo_activo_id=tipo_activo)
    if marca:
        queryset = queryset.filter(marca_id=marca)
    if modelo:
        queryset = queryset.filter(modelo_id=modelo)
    if region:
        queryset = queryset.filter(region_id=region)
    if finca:
        queryset = queryset.filter(finca_id=finca)
    if departamento:
        queryset = queryset.filter(departamento_id=departamento)
    if area:
        queryset = queryset.filter(area_id=area)

    # Create CSV response with UTF-8 BOM for Excel compatibility
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="reporte_activos.csv"'
    # Add UTF-8 BOM for proper Excel display
    response.write('\ufeff')

    writer = csv.writer(response)
    # Write header
    writer.writerow([
        'ID', 'Serie', 'Hostname', 'Tipo Activo', 'Marca', 'Modelo', 'Proveedor',
        'Región', 'Finca', 'Departamento', 'Área', 'Fecha Registro', 'Fecha Fin Garantía',
        'Estado', 'Solicitante', 'Correo Electrónico', 'Orden Compra', 'Cuenta Contable',
        'Tipo Costo', 'Cuotas', 'Moneda', 'Costo', 'Procesador', 'RAM', 'Almacenamiento',
        'Tarjeta Gráfica', 'WIFI', 'Ethernet', 'Puertos Ethernet', 'Puertos SFP',
        'Puerto Consola', 'Puertos PoE', 'Alimentación', 'Administrable', 'Tamaño',
        'Color', 'Conectores', 'Cables'
    ])

    # Write data
    for activo in queryset:
        writer.writerow([
            activo.id,
            activo.serie,
            activo.hostname,
            activo.tipo_activo.name if activo.tipo_activo else '',
            activo.marca.name if activo.marca else '',
            activo.modelo.name if activo.modelo else '',
            activo.proveedor.nombre_empresa if activo.proveedor else '',
            activo.region.name if activo.region else '',
            activo.finca.name if activo.finca else '',
            activo.departamento.name if activo.departamento else '',
            activo.area.name if activo.area else '',
            activo.fecha_registro.isoformat() if activo.fecha_registro else '',
            activo.fecha_fin_garantia.isoformat() if activo.fecha_fin_garantia else '',
            activo.estado,
            activo.solicitante or '',
            activo.correo_electronico or '',
            activo.orden_compra or '',
            activo.cuenta_contable or '',
            activo.tipo_costo or '',
            activo.cuotas or '',
            activo.moneda or '',
            activo.costo or '',
            activo.procesador or '',
            activo.ram or '',
            activo.almacenamiento or '',
            activo.tarjeta_grafica or '',
            'Sí' if activo.wifi else 'No',
            'Sí' if activo.ethernet else 'No',
            activo.puertos_ethernet or '',
            activo.puertos_sfp or '',
            'Sí' if activo.puerto_consola else 'No',
            activo.puertos_poe or '',
            activo.alimentacion or '',
            'Sí' if activo.administrable else 'No',
            activo.tamano or '',
            activo.color or '',
            activo.conectores or '',
            activo.cables or ''
        ])

    return response


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def maintenance_report_csv(request):
    """Generate CSV report for maintenance with date range and filters"""
    # Get filter parameters
    activo_id = request.GET.get('activo')
    technician_id = request.GET.get('technician')
    estado = request.GET.get('estado', 'activo')
    region = request.GET.get('region')
    finca = request.GET.get('finca')
    tipos_activos = request.GET.getlist('tipos_activos', [])
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')

    # Build queryset
    queryset = Maintenance.objects.select_related('activo', 'technician')

    # Apply filters
    if activo_id:
        queryset = queryset.filter(activo_id=activo_id)
    if technician_id:
        queryset = queryset.filter(technician_id=technician_id)

    # Filter by activo's estado
    if estado == 'all':
        pass  # Include all
    elif estado == 'retirado':
        queryset = queryset.filter(activo__estado='retirado')
    else:
        queryset = queryset.filter(activo__estado='activo')

    # Filter by activo's region
    if region:
        queryset = queryset.filter(activo__region_id=region)

    # Filter by activo's finca
    if finca:
        queryset = queryset.filter(activo__finca_id=finca)

    # Filter by activo's tipos_activos (multiple selection)
    if tipos_activos:
        queryset = queryset.filter(activo__tipo_activo__name__in=tipos_activos)

    # Date filtering
    if fecha_desde:
        try:
            fecha_desde = datetime.strptime(fecha_desde, '%Y-%m-%d').date()
            queryset = queryset.filter(maintenance_date__gte=fecha_desde)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_hasta = datetime.strptime(fecha_hasta, '%Y-%m-%d').date()
            queryset = queryset.filter(maintenance_date__lte=fecha_hasta)
        except ValueError:
            pass

    # Create CSV response with UTF-8 BOM for Excel compatibility
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="reporte_mantenimiento.csv"'
    # Add UTF-8 BOM for proper Excel display
    response.write('\ufeff')

    writer = csv.writer(response)
    # Write header
    writer.writerow([
        'ID', 'Activo Hostname', 'Activo Serie', 'Fecha Mantenimiento', 'Técnico',
        'Próximo Mantenimiento', 'Hallazgos', 'Archivos Adjuntos', 'Fecha Creación'
    ])

    # Write data
    for maintenance in queryset.order_by('-maintenance_date'):
        writer.writerow([
            maintenance.id,
            maintenance.activo.hostname,
            maintenance.activo.serie,
            maintenance.maintenance_date.isoformat(),
            maintenance.technician.username,
            maintenance.next_maintenance_date.isoformat() if maintenance.next_maintenance_date else '',
            maintenance.findings,
            ', '.join(maintenance.attachments) if maintenance.attachments else '',
            maintenance.created_at.isoformat()
        ])

    return response


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def assignments_report_csv(request):
    """Generate CSV report for assignments with filters"""
    # Get filter parameters
    employee_id = request.GET.get('employee')
    activo_id = request.GET.get('activo')
    assigned_by_id = request.GET.get('assigned_by')
    fecha_desde = request.GET.get('fecha_desde')
    fecha_hasta = request.GET.get('fecha_hasta')
    active_only = request.GET.get('active_only', 'true').lower() == 'true'

    # Build queryset
    queryset = Assignment.objects.select_related(
        'activo', 'employee', 'assigned_by', 'returned_by'
    )

    if employee_id:
        queryset = queryset.filter(employee_id=employee_id)
    if activo_id:
        queryset = queryset.filter(activo_id=activo_id)
    if assigned_by_id:
        queryset = queryset.filter(assigned_by_id=assigned_by_id)

    # Date filtering
    if fecha_desde:
        try:
            fecha_desde = datetime.strptime(fecha_desde, '%Y-%m-%d')
            queryset = queryset.filter(assigned_date__gte=fecha_desde)
        except ValueError:
            pass

    if fecha_hasta:
        try:
            fecha_hasta = datetime.strptime(fecha_hasta, '%Y-%m-%d')
            queryset = queryset.filter(assigned_date__lte=fecha_hasta)
        except ValueError:
            pass

    if active_only:
        queryset = queryset.filter(returned_date__isnull=True)

    # Create CSV response with UTF-8 BOM for Excel compatibility
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="reporte_asignaciones.csv"'
    # Add UTF-8 BOM for proper Excel display
    response.write('\ufeff')

    writer = csv.writer(response)
    # Write header
    writer.writerow([
        'ID', 'Activo Hostname', 'Activo Serie', 'Tipo Activo', 'Marca', 'Modelo',
        'Empleado', 'Número Empleado', 'Fecha Asignación', 'Asignado Por',
        'Fecha Devolución', 'Devuelto Por', 'Estado'
    ])

    # Write data
    for assignment in queryset.order_by('-assigned_date'):
        writer.writerow([
            assignment.id,
            assignment.activo.hostname,
            assignment.activo.serie,
            assignment.activo.tipo_activo.name if assignment.activo.tipo_activo else '',
            assignment.activo.marca.name if assignment.activo.marca else '',
            assignment.activo.modelo.name if assignment.activo.modelo else '',
            f"{assignment.employee.first_name} {assignment.employee.last_name}",
            assignment.employee.employee_number,
            assignment.assigned_date.isoformat(),
            assignment.assigned_by.username,
            assignment.returned_date.isoformat() if assignment.returned_date else '',
            assignment.returned_by.username if assignment.returned_by else '',
            'Activa' if assignment.returned_date is None else 'Devuelta'
        ])

    return response
