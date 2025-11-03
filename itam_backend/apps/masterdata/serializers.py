"""
Serializadores para los modelos de datos maestros del sistema ITAM.

Este archivo contiene todos los serializadores necesarios para convertir
instancias de modelos de datos maestros a JSON y viceversa, incluyendo
campos calculados para mostrar nombres de relaciones y campos de escritura
para enviar IDs durante operaciones CRUD.
"""

from rest_framework import serializers
from .models import Region, Finca, Departamento, Area, TipoActivo, Marca, ModeloActivo, Proveedor, AuditLog
from rest_framework.validators import UniqueTogetherValidator

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__' # Incluirá 'id', 'name', 'description'

class FincaSerializer(serializers.ModelSerializer):
    # Esto es crucial: por defecto, Django REST Framework sólo devolvería el ID de la región.
    # Con StringRelatedField, obtendrás el __str__ de la región (su nombre).
    # Si quieres el objeto completo de la región, usarías RegionSerializer (pero complicaría la escritura).
    # Para poder escribir, usaremos PrimaryKeyRelatedField en FincaCreateUpdateSerializer.
    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = Finca
        fields = '__all__' # Incluirá 'id', 'name', 'region', 'address', 'region_name'

class FincaCreateUpdateSerializer(serializers.ModelSerializer):
    # Usamos PrimaryKeyRelatedField para poder enviar el ID de la región al crear/actualizar una finca
    region = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(), # Asegúrate de que el queryset esté disponible
        allow_null=True,               # Permite asignar NULL si la finca no tiene región
        required=False                 # El campo no es estrictamente requerido en el payload
    )

    class Meta:
        model = Finca
        fields = ['id', 'name', 'region', 'address'] # Define los campos que se pueden crear/actualizar
        
class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = ['id', 'name', 'description']

class AreaSerializer(serializers.ModelSerializer):
    # Para lectura: Mostrar el nombre del departamento
    departamento_name = serializers.CharField(source='departamento.name', read_only=True)
    
    # Para escritura: Aceptar el ID del departamento
    departamento = serializers.PrimaryKeyRelatedField(
        queryset=Departamento.objects.all(), # Permite seleccionar cualquier Departamento existente
        write_only=True,                     # Solo se usa para escribir (enviar el ID)
        required=True                        # Es un campo obligatorio
    )

    # Campo de solo lectura para obtener el ID del departamento (necesario para filtrado en frontend)
    departamento_id = serializers.IntegerField(source='departamento.id', read_only=True)

    class Meta:
        model = Area
        fields = ['id', 'name', 'description', 'departamento', 'departamento_name', 'departamento_id']

class TipoActivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoActivo
        fields = '__all__'
        
class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = '__all__'
        
class ModeloActivoSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar el nombre en el frontend
    marca_name = serializers.CharField(source='marca.name', read_only=True)
    tipo_activo_name = serializers.CharField(source='tipo_activo.name', read_only=True)
    asset_type_category = serializers.SerializerMethodField()

    # Campos de escritura para recibir los IDs de las claves foráneas
    marca = serializers.PrimaryKeyRelatedField(
        queryset=Marca.objects.all(),
        write_only=True,
        required=True
    )
    tipo_activo = serializers.PrimaryKeyRelatedField(
        queryset=TipoActivo.objects.all(),
        allow_null=True,
        required=False,
        write_only=True
    )

    # Campos de solo lectura para obtener los IDs (necesarios para filtrado en frontend)
    marca_id = serializers.IntegerField(source='marca.id', read_only=True)
    tipo_activo_id = serializers.IntegerField(source='tipo_activo.id', read_only=True, allow_null=True)

    class Meta:
        model = ModeloActivo
        fields = [
            'id', 'name',
            'marca', 'marca_name', 'marca_id',
            'tipo_activo', 'tipo_activo_name', 'tipo_activo_id', 'asset_type_category',
            # Campos para equipo de computo
            'procesador', 'ram', 'almacenamiento', 'tarjeta_grafica', 'wifi', 'ethernet',
            # Campos para equipos de red
            'puertos_ethernet', 'puertos_sfp', 'puerto_consola', 'puertos_poe', 'alimentacion', 'administrable',
            # Campos para perifericos
            'tamano', 'color', 'conectores', 'cables',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'marca': {'write_only': True},
            'tipo_activo': {'write_only': True},
        }

    def get_asset_type_category(self, obj):
        return obj.get_asset_type_category()

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    record_model = serializers.CharField(source='content_type.model', read_only=True)
    record_id = serializers.IntegerField(source='object_id', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'timestamp', 'activity_type', 'description', 'user_username', 'record_model', 'record_id', 'old_data', 'new_data']