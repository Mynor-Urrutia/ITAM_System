# itam_backend/masterdata/views.py
# itam_backend/masterdata/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response # Importar Response
from django.db.models import ProtectedError # Importar ProtectedError si lo usas, aunque para tu caso no es necesario para Finca

from .models import Region, Finca, Departamento, Area
from .serializers import RegionSerializer, FincaSerializer, FincaCreateUpdateSerializer, DepartamentoSerializer, AreaSerializer

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [permissions.IsAuthenticated]

    # --- MODIFICACIÓN: Sobrescribir el método destroy ---
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Verificar si hay fincas asociadas a esta región
        if instance.fincas.exists(): # 'fincas' es el related_name definido en Finca.region
            return Response(
                {"detail": "No se puede eliminar la región porque tiene fincas asignadas."},
                status=status.HTTP_400_BAD_REQUEST # O 409 CONFLICT si lo prefieres
            )
        return super().destroy(request, *args, **kwargs)
    # ----------------------------------------------------

class FincaViewSet(viewsets.ModelViewSet):
    queryset = Finca.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FincaCreateUpdateSerializer
        return FincaSerializer
    
    permission_classes = [permissions.IsAuthenticated]

    # Si en el futuro una Finca es padre de otro modelo (ej. 'Activo', 'Lote'),
    # aplicarías una lógica similar aquí:
    # def destroy(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     if instance.activos.exists(): # Suponiendo que Activo tiene una FK a Finca con related_name='activos'
    #         return Response(
    #             {"detail": "No se puede eliminar la finca porque tiene activos asignados."},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
    #     return super().destroy(request, *args, **kwargs)
    
class DepartamentoViewSet(viewsets.ModelViewSet):
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializer
    # Permite buscar departamentos por nombre
    search_fields = ['name']

class AreaViewSet(viewsets.ModelViewSet):
    # Usamos select_related para optimizar la consulta y evitar N+1 problems
    # al acceder al nombre del departamento en el serializador.
    queryset = Area.objects.select_related('departamento').all()
    serializer_class = AreaSerializer
    # Permite buscar áreas por nombre
    search_fields = ['name', 'departamento__name'] # Permite buscar también por nombre de departamento
    # Permite filtrar áreas por departamento_id
    filterset_fields = ['departamento']