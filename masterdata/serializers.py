# itam_backend/masterdata/serializers.py

from rest_framework import serializers
from .models import Region, Finca, Departamento, Area # Asegúrate de importar todos tus modelos

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

    class Meta:
        model = Area
        fields = ['id', 'name', 'description', 'departamento', 'departamento_name']
