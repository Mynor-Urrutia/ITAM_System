from rest_framework import serializers
from .models import Activo
from masterdata.models import TipoActivo, Marca, ModeloActivo, Proveedor, Region, Finca, Departamento, Area, AuditLog
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

    # ModeloActivo fields (read-only)
    procesador = serializers.CharField(source='modelo.procesador', read_only=True, allow_null=True)
    ram = serializers.IntegerField(source='modelo.ram', read_only=True, allow_null=True)
    almacenamiento = serializers.CharField(source='modelo.almacenamiento', read_only=True, allow_null=True)
    tarjeta_grafica = serializers.CharField(source='modelo.tarjeta_grafica', read_only=True, allow_null=True)
    wifi = serializers.BooleanField(source='modelo.wifi', read_only=True, allow_null=True)
    ethernet = serializers.BooleanField(source='modelo.ethernet', read_only=True, allow_null=True)
    puertos_ethernet = serializers.CharField(source='modelo.puertos_ethernet', read_only=True, allow_null=True)
    puertos_sfp = serializers.CharField(source='modelo.puertos_sfp', read_only=True, allow_null=True)
    puerto_consola = serializers.BooleanField(source='modelo.puerto_consola', read_only=True, allow_null=True)
    puertos_poe = serializers.CharField(source='modelo.puertos_poe', read_only=True, allow_null=True)
    alimentacion = serializers.CharField(source='modelo.alimentacion', read_only=True, allow_null=True)
    administrable = serializers.BooleanField(source='modelo.administrable', read_only=True, allow_null=True)
    tamano = serializers.CharField(source='modelo.tamano', read_only=True, allow_null=True)
    color = serializers.CharField(source='modelo.color', read_only=True, allow_null=True)
    conectores = serializers.CharField(source='modelo.conectores', read_only=True, allow_null=True)
    cables = serializers.CharField(source='modelo.cables', read_only=True, allow_null=True)

    # Asset type category for conditional display
    asset_type_category = serializers.SerializerMethodField()

    # User who created the asset
    created_by_user = serializers.SerializerMethodField()

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
            'asset_type_category', 'created_by_user',
            # ModeloActivo fields (read-only)
            'procesador', 'ram', 'almacenamiento', 'tarjeta_grafica', 'wifi', 'ethernet',
            'puertos_ethernet', 'puertos_sfp', 'puerto_consola', 'puertos_poe', 'alimentacion', 'administrable',
            'tamano', 'color', 'conectores', 'cables',
            # Write fields
            'tipo_activo', 'proveedor', 'marca', 'modelo', 'region', 'finca', 'departamento', 'area',
            # Other fields
            'serie', 'hostname', 'fecha_registro', 'fecha_fin_garantia',
            'solicitante', 'correo_electronico', 'orden_compra',
            'cuenta_contable', 'tipo_costo', 'cuotas', 'moneda', 'costo',
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
            # Allow null/blank values for optional fields
            'solicitante': {'allow_blank': True, 'allow_null': True, 'required': False},
            'correo_electronico': {'allow_blank': True, 'allow_null': True, 'required': False},
            'orden_compra': {'allow_blank': True, 'allow_null': True, 'required': False},
            'cuenta_contable': {'allow_blank': True, 'allow_null': True, 'required': False},
            'tipo_costo': {'allow_blank': True, 'allow_null': True, 'required': False},
            'cuotas': {'allow_null': True, 'required': False},
            'moneda': {'allow_blank': True, 'allow_null': True, 'required': False},
            'costo': {'allow_null': True, 'required': False},
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