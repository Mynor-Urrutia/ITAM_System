from rest_framework import serializers
from .models import Employee
from apps.masterdata.models import Region, Finca, Departamento, Area

class EmployeeSerializer(serializers.ModelSerializer):
    # Read-only fields for displaying names
    department_name = serializers.CharField(source='department.name', read_only=True)
    area_name = serializers.CharField(source='area.name', read_only=True)
    region_name = serializers.CharField(source='region.name', read_only=True)
    finca_name = serializers.CharField(source='finca.name', read_only=True)
    supervisor_name = serializers.SerializerMethodField()

    # Read-only fields for IDs (needed for form editing)
    department_id = serializers.IntegerField(source='department.id', read_only=True)
    area_id = serializers.IntegerField(source='area.id', read_only=True)
    region_id = serializers.IntegerField(source='region.id', read_only=True)
    finca_id = serializers.IntegerField(source='finca.id', read_only=True)
    supervisor_id = serializers.IntegerField(source='supervisor.id', read_only=True, allow_null=True)

    # Write-only fields for sending IDs
    department = serializers.PrimaryKeyRelatedField(
        queryset=Departamento.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    area = serializers.PrimaryKeyRelatedField(
        queryset=Area.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    region = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    finca = serializers.PrimaryKeyRelatedField(
        queryset=Finca.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    supervisor = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Employee
        fields = [
            'id',
            # Read fields
            'department_name', 'area_name', 'region_name', 'finca_name', 'supervisor_name',
            'department_id', 'area_id', 'region_id', 'finca_id', 'supervisor_id',
            # Write fields
            'department', 'area', 'region', 'finca', 'supervisor',
            # Other fields
            'employee_number', 'first_name', 'last_name', 'start_date', 'document',
            'created_at', 'updated_at'
        ]

    def get_supervisor_name(self, obj):
        """Get the supervisor's full name"""
        if obj.supervisor:
            return f"{obj.supervisor.first_name} {obj.supervisor.last_name}"
        return None