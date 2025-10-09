from rest_framework import serializers
from .models import Activo, Maintenance, Assignment
from apps.masterdata.models import TipoActivo, Marca, ModeloActivo, Proveedor, Region, Finca, Departamento, Area, AuditLog
from apps.employees.models import Employee
from django.contrib.contenttypes.models import ContentType

class ActivoSerializer(serializers.ModelSerializer):
    # Read-only fields for displaying names
    tipo_activo_name = serializers.CharField(source='tipo_activo.name', read_only=True)
    proveedor_name = serializers.CharField(source='proveedor.nombre_empresa', read_only=True)
    marca_name = serializers.CharField(source='marca.name', read_only=True)
    modelo_name = serializers.CharField(source='modelo.name', read_only=True)
    region_name = serializers.CharField(source='region.name', read_only=True)
    finca_name = serializers.CharField(source='finca.name', read_only=True)
    departamento_name = serializers.CharField(source='departamento.name', read_only=True)
    area_name = serializers.CharField(source='area.name', read_only=True)

    # Read-only fields for IDs (needed for form editing)
    tipo_activo_id = serializers.IntegerField(source='tipo_activo.id', read_only=True)
    proveedor_id = serializers.IntegerField(source='proveedor.id', read_only=True)
    marca_id = serializers.IntegerField(source='marca.id', read_only=True)
    modelo_id = serializers.IntegerField(source='modelo.id', read_only=True)
    region_id = serializers.IntegerField(source='region.id', read_only=True)
    finca_id = serializers.IntegerField(source='finca.id', read_only=True)
    departamento_id = serializers.IntegerField(source='departamento.id', read_only=True)
    area_id = serializers.IntegerField(source='area.id', read_only=True)

    # Asset/ModeloActivo fields (prefer asset values, fallback to modelo)
    procesador = serializers.SerializerMethodField()
    ram = serializers.SerializerMethodField()
    almacenamiento = serializers.SerializerMethodField()
    tarjeta_grafica = serializers.SerializerMethodField()
    wifi = serializers.SerializerMethodField()
    ethernet = serializers.SerializerMethodField()
    puertos_ethernet = serializers.SerializerMethodField()
    puertos_sfp = serializers.SerializerMethodField()
    puerto_consola = serializers.SerializerMethodField()
    puertos_poe = serializers.SerializerMethodField()
    alimentacion = serializers.SerializerMethodField()
    administrable = serializers.SerializerMethodField()
    tamano = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    conectores = serializers.SerializerMethodField()
    cables = serializers.SerializerMethodField()

    # Asset type category for conditional display
    asset_type_category = serializers.SerializerMethodField()

    # User who created the asset
    created_by_user = serializers.SerializerMethodField()

    # User who retired the asset
    usuario_baja_name = serializers.CharField(source='usuario_baja.username', read_only=True, allow_null=True)

    # User who the asset is assigned to
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)

    # Maintenance fields
    tecnico_mantenimiento_name = serializers.SerializerMethodField()

    # Latest maintenance attachments
    ultimo_mantenimiento_adjuntos = serializers.SerializerMethodField()

    # Write-only fields for sending IDs
    tipo_activo = serializers.PrimaryKeyRelatedField(
        queryset=TipoActivo.objects.all(),
        write_only=True,
        required=True
    )
    proveedor = serializers.PrimaryKeyRelatedField(
        queryset=Proveedor.objects.all(),
        write_only=True,
        required=True
    )
    marca = serializers.PrimaryKeyRelatedField(
        queryset=Marca.objects.all(),
        write_only=True,
        required=True
    )
    modelo = serializers.PrimaryKeyRelatedField(
        queryset=ModeloActivo.objects.all(),
        write_only=True,
        required=True
    )
    region = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(),
        write_only=True,
        required=True
    )
    finca = serializers.PrimaryKeyRelatedField(
        queryset=Finca.objects.all(),
        write_only=True,
        required=True
    )
    departamento = serializers.PrimaryKeyRelatedField(
        queryset=Departamento.objects.all(),
        write_only=True,
        required=True
    )
    area = serializers.PrimaryKeyRelatedField(
        queryset=Area.objects.all(),
        write_only=True,
        required=True
    )

    class Meta:
        model = Activo
        fields = [
            'id',
            # Read fields
            'tipo_activo_name', 'proveedor_name', 'marca_name', 'modelo_name',
            'region_name', 'finca_name', 'departamento_name', 'area_name',
            'tipo_activo_id', 'proveedor_id', 'marca_id', 'modelo_id',
            'region_id', 'finca_id', 'departamento_id', 'area_id',
            'asset_type_category', 'created_by_user', 'assigned_to_name',
            # Asset/ModeloActivo fields
            'procesador', 'ram', 'almacenamiento', 'tarjeta_grafica', 'wifi', 'ethernet',
            'puertos_ethernet', 'puertos_sfp', 'puerto_consola', 'puertos_poe', 'alimentacion', 'administrable',
            'tamano', 'color', 'conectores', 'cables',
            # Write fields
            'tipo_activo', 'proveedor', 'marca', 'modelo', 'region', 'finca', 'departamento', 'area', 'assigned_to',
            # Other fields
            'serie', 'hostname', 'fecha_registro', 'fecha_fin_garantia',
            'solicitante', 'correo_electronico', 'orden_compra',
            'cuenta_contable', 'tipo_costo', 'cuotas', 'moneda', 'costo',
            'estado', 'fecha_baja', 'motivo_baja', 'usuario_baja_name', 'documentos_baja',
            'ultimo_mantenimiento', 'proximo_mantenimiento', 'tecnico_mantenimiento', 'tecnico_mantenimiento_name',
            'ultimo_mantenimiento_hallazgos', 'ultimo_mantenimiento_adjuntos',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'tipo_activo': {'write_only': True},
            'proveedor': {'write_only': True},
            'marca': {'write_only': True},
            'modelo': {'write_only': True},
            'region': {'write_only': True},
            'finca': {'write_only': True},
            'departamento': {'write_only': True},
            'area': {'write_only': True},
            'assigned_to': {'allow_null': True, 'required': False},
            # Allow null/blank values for optional fields
            'solicitante': {'allow_blank': True, 'allow_null': True, 'required': False},
            'correo_electronico': {'allow_blank': True, 'allow_null': True, 'required': False},
            'orden_compra': {'allow_blank': True, 'allow_null': True, 'required': False},
            'cuenta_contable': {'allow_blank': True, 'allow_null': True, 'required': False},
            'tipo_costo': {'allow_blank': True, 'allow_null': True, 'required': False},
            'cuotas': {'allow_null': True, 'required': False},
            'moneda': {'allow_blank': True, 'allow_null': True, 'required': False},
            'costo': {'allow_null': True, 'required': False},
            # Asset spec fields (writable, optional)
            'procesador': {'allow_blank': True, 'allow_null': True, 'required': False},
            'almacenamiento': {'allow_blank': True, 'allow_null': True, 'required': False},
            'tarjeta_grafica': {'allow_blank': True, 'allow_null': True, 'required': False},
            'puertos_ethernet': {'allow_blank': True, 'allow_null': True, 'required': False},
            'puertos_sfp': {'allow_blank': True, 'allow_null': True, 'required': False},
            'puertos_poe': {'allow_blank': True, 'allow_null': True, 'required': False},
            'alimentacion': {'allow_blank': True, 'allow_null': True, 'required': False},
            'tamano': {'allow_blank': True, 'allow_null': True, 'required': False},
            'color': {'allow_blank': True, 'allow_null': True, 'required': False},
            'conectores': {'allow_blank': True, 'allow_null': True, 'required': False},
            'cables': {'allow_blank': True, 'allow_null': True, 'required': False},
            'ram': {'allow_null': True, 'required': False},
        }

    def get_asset_type_category(self, obj):
        """Get the asset type category from the related modelo"""
        if obj.modelo:
            return obj.modelo.get_asset_type_category()
        return 'periferico'

    def get_created_by_user(self, obj):
        """Get the user who created this asset from audit logs"""
        try:
            content_type = ContentType.objects.get_for_model(obj)
            audit_log = AuditLog.objects.filter(
                content_type=content_type,
                object_id=obj.id,
                activity_type='CREATE'
            ).select_related('user').first()

            if audit_log and audit_log.user:
                return f"{audit_log.user.first_name} {audit_log.user.last_name}".strip() or audit_log.user.username
        except Exception:
            pass
        return "Desconocido"

    def get_tecnico_mantenimiento_name(self, obj):
        """Get the technician name from the latest maintenance"""
        try:
            return obj.tecnico_mantenimiento.username if obj.tecnico_mantenimiento else None
        except Exception:
            return None

    def get_ultimo_mantenimiento_adjuntos(self, obj):
        """Get the attachments from the latest maintenance"""
        try:
            latest_maintenance = obj.maintenances.order_by('-created_at').first()
            return latest_maintenance.attachments if latest_maintenance else None
        except Exception:
            return None

    # Asset spec field getters (prefer asset value, fallback to modelo)
    def get_procesador(self, obj):
        return obj.procesador if obj.procesador is not None else (obj.modelo.procesador if obj.modelo else None)

    def get_ram(self, obj):
        return obj.ram if obj.ram is not None else (obj.modelo.ram if obj.modelo else None)

    def get_almacenamiento(self, obj):
        return obj.almacenamiento if obj.almacenamiento is not None else (obj.modelo.almacenamiento if obj.modelo else None)

    def get_tarjeta_grafica(self, obj):
        return obj.tarjeta_grafica if obj.tarjeta_grafica is not None else (obj.modelo.tarjeta_grafica if obj.modelo else None)

    def get_wifi(self, obj):
        return obj.wifi if obj.wifi is not None else (obj.modelo.wifi if obj.modelo else False)

    def get_ethernet(self, obj):
        return obj.ethernet if obj.ethernet is not None else (obj.modelo.ethernet if obj.modelo else False)

    def get_puertos_ethernet(self, obj):
        return obj.puertos_ethernet if obj.puertos_ethernet is not None else (obj.modelo.puertos_ethernet if obj.modelo else None)

    def get_puertos_sfp(self, obj):
        return obj.puertos_sfp if obj.puertos_sfp is not None else (obj.modelo.puertos_sfp if obj.modelo else None)

    def get_puerto_consola(self, obj):
        return obj.puerto_consola if obj.puerto_consola is not None else (obj.modelo.puerto_consola if obj.modelo else False)

    def get_puertos_poe(self, obj):
        return obj.puertos_poe if obj.puertos_poe is not None else (obj.modelo.puertos_poe if obj.modelo else None)

    def get_alimentacion(self, obj):
        return obj.alimentacion if obj.alimentacion is not None else (obj.modelo.alimentacion if obj.modelo else None)

    def get_administrable(self, obj):
        return obj.administrable if obj.administrable is not None else (obj.modelo.administrable if obj.modelo else False)

    def get_tamano(self, obj):
        return obj.tamano if obj.tamano is not None else (obj.modelo.tamano if obj.modelo else None)

    def get_color(self, obj):
        return obj.color if obj.color is not None else (obj.modelo.color if obj.modelo else None)

    def get_conectores(self, obj):
        return obj.conectores if obj.conectores is not None else (obj.modelo.conectores if obj.modelo else None)

    def get_cables(self, obj):
        return obj.cables if obj.cables is not None else (obj.modelo.cables if obj.modelo else None)


class MaintenanceSerializer(serializers.ModelSerializer):
    technician_name = serializers.CharField(source='technician.username', read_only=True)
    activo_hostname = serializers.CharField(source='activo.hostname', read_only=True)
    activo_serie = serializers.CharField(source='activo.serie', read_only=True)

    class Meta:
        model = Maintenance
        fields = [
            'id', 'activo', 'activo_hostname', 'activo_serie', 'maintenance_date', 'technician', 'technician_name',
            'findings', 'next_maintenance_date', 'attachments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['activo_hostname', 'activo_serie', 'technician_name', 'next_maintenance_date']


class AssignmentSerializer(serializers.ModelSerializer):
    # Read-only fields for displaying names
    activo_id = serializers.IntegerField(source='activo.id', read_only=True)
    activo_hostname = serializers.CharField(source='activo.hostname', read_only=True)
    activo_serie = serializers.CharField(source='activo.serie', read_only=True)
    activo_tipo_activo_name = serializers.CharField(source='activo.tipo_activo.name', read_only=True)
    activo_marca_name = serializers.CharField(source='activo.marca.name', read_only=True)
    activo_modelo_name = serializers.CharField(source='activo.modelo.name', read_only=True)

    # Asset specs (prefer activo value, fallback to modelo)
    activo_procesador = serializers.SerializerMethodField()
    activo_ram = serializers.SerializerMethodField()
    activo_almacenamiento = serializers.SerializerMethodField()
    activo_tarjeta_grafica = serializers.SerializerMethodField()
    activo_wifi = serializers.SerializerMethodField()
    activo_ethernet = serializers.SerializerMethodField()
    activo_puertos_ethernet = serializers.SerializerMethodField()
    activo_puertos_sfp = serializers.SerializerMethodField()
    activo_puerto_consola = serializers.SerializerMethodField()
    activo_puertos_poe = serializers.SerializerMethodField()
    activo_alimentacion = serializers.SerializerMethodField()
    activo_administrable = serializers.SerializerMethodField()
    activo_tamano = serializers.SerializerMethodField()
    activo_color = serializers.SerializerMethodField()
    activo_conectores = serializers.SerializerMethodField()
    activo_cables = serializers.SerializerMethodField()
    employee_name = serializers.SerializerMethodField()
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.username', read_only=True)
    returned_by_name = serializers.CharField(source='returned_by.username', read_only=True, allow_null=True)

    # Write-only fields for sending IDs
    activo = serializers.PrimaryKeyRelatedField(
        queryset=Activo.objects.all(),
        write_only=True,
        required=True
    )
    employee = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        required=True
    )

    class Meta:
        model = Assignment
        fields = [
            'id',
            # Read fields
            'activo_id', 'activo_hostname', 'activo_serie', 'activo_tipo_activo_name', 'activo_marca_name', 'activo_modelo_name',
            'activo_procesador', 'activo_ram', 'activo_almacenamiento', 'activo_tarjeta_grafica', 'activo_wifi', 'activo_ethernet',
            'activo_puertos_ethernet', 'activo_puertos_sfp', 'activo_puerto_consola', 'activo_puertos_poe', 'activo_alimentacion', 'activo_administrable',
            'activo_tamano', 'activo_color', 'activo_conectores', 'activo_cables',
            'employee_name', 'employee_number',
            'assigned_by_name', 'returned_by_name',
            # Write fields
            'activo', 'employee',
            # Other fields
            'assigned_date', 'returned_date', 'assigned_by', 'returned_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'activo_hostname', 'activo_serie', 'activo_tipo_activo_name',
            'employee_name', 'employee_number',
            'assigned_by_name', 'returned_by_name',
            'assigned_date', 'created_at', 'updated_at'
        ]

    def get_employee_name(self, obj):
        """Get the full name of the employee"""
        return f"{obj.employee.first_name} {obj.employee.last_name}".strip()

    # Asset spec getters for assignment serializer
    def get_activo_procesador(self, obj):
        return obj.activo.procesador if obj.activo.procesador is not None else (obj.activo.modelo.procesador if obj.activo.modelo else None)

    def get_activo_ram(self, obj):
        return obj.activo.ram if obj.activo.ram is not None else (obj.activo.modelo.ram if obj.activo.modelo else None)

    def get_activo_almacenamiento(self, obj):
        return obj.activo.almacenamiento if obj.activo.almacenamiento is not None else (obj.activo.modelo.almacenamiento if obj.activo.modelo else None)

    def get_activo_tarjeta_grafica(self, obj):
        return obj.activo.tarjeta_grafica if obj.activo.tarjeta_grafica is not None else (obj.activo.modelo.tarjeta_grafica if obj.activo.modelo else None)

    def get_activo_wifi(self, obj):
        return obj.activo.wifi if obj.activo.wifi is not None else (obj.activo.modelo.wifi if obj.activo.modelo else False)

    def get_activo_ethernet(self, obj):
        return obj.activo.ethernet if obj.activo.ethernet is not None else (obj.activo.modelo.ethernet if obj.activo.modelo else False)

    def get_activo_puertos_ethernet(self, obj):
        return obj.activo.puertos_ethernet if obj.activo.puertos_ethernet is not None else (obj.activo.modelo.puertos_ethernet if obj.activo.modelo else None)

    def get_activo_puertos_sfp(self, obj):
        return obj.activo.puertos_sfp if obj.activo.puertos_sfp is not None else (obj.activo.modelo.puertos_sfp if obj.activo.modelo else None)

    def get_activo_puerto_consola(self, obj):
        return obj.activo.puerto_consola if obj.activo.puerto_consola is not None else (obj.activo.modelo.puerto_consola if obj.activo.modelo else False)

    def get_activo_puertos_poe(self, obj):
        return obj.activo.puertos_poe if obj.activo.puertos_poe is not None else (obj.activo.modelo.puertos_poe if obj.activo.modelo else None)

    def get_activo_alimentacion(self, obj):
        return obj.activo.alimentacion if obj.activo.alimentacion is not None else (obj.activo.modelo.alimentacion if obj.activo.modelo else None)

    def get_activo_administrable(self, obj):
        return obj.activo.administrable if obj.activo.administrable is not None else (obj.activo.modelo.administrable if obj.activo.modelo else False)

    def get_activo_tamano(self, obj):
        return obj.activo.tamano if obj.activo.tamano is not None else (obj.activo.modelo.tamano if obj.activo.modelo else None)

    def get_activo_color(self, obj):
        return obj.activo.color if obj.activo.color is not None else (obj.activo.modelo.color if obj.activo.modelo else None)

    def get_activo_conectores(self, obj):
        return obj.activo.conectores if obj.activo.conectores is not None else (obj.activo.modelo.conectores if obj.activo.modelo else None)

    def get_activo_cables(self, obj):
        return obj.activo.cables if obj.activo.cables is not None else (obj.activo.modelo.cables if obj.activo.modelo else None)

    def validate(self, data):
        """Custom validation for assignment rules"""
        activo = data.get('activo')
        employee = data.get('employee')

        if activo and employee:
            # Check if employee already has an active assignment for this tipo_activo
            existing_assignments = Assignment.objects.filter(
                employee=employee,
                activo__tipo_activo=activo.tipo_activo,
                returned_date__isnull=True
            ).exclude(id=getattr(self.instance, 'id', None))

            if existing_assignments.exists():
                raise serializers.ValidationError(
                    f"El empleado ya tiene asignado un activo del tipo '{activo.tipo_activo.name}'."
                )

            # Check if activo is already assigned and not returned
            if Assignment.objects.filter(
                activo=activo,
                returned_date__isnull=True
            ).exclude(id=getattr(self.instance, 'id', None)).exists():
                raise serializers.ValidationError(
                    f"El activo '{activo.hostname}' ya está asignado a otro empleado."
                )

        return data

    def validate_ram(self, value):
        """Validate RAM is a positive integer"""
        if value is not None and (not isinstance(value, int) or value < 0):
            raise serializers.ValidationError("RAM debe ser un número entero positivo.")
        return value