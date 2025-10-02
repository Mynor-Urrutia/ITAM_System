from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_number', 'first_name', 'last_name', 'department', 'area', 'region', 'finca', 'start_date', 'supervisor')
    list_filter = ('department', 'area', 'region', 'finca', 'start_date')
    search_fields = ('employee_number', 'first_name', 'last_name')
    ordering = ('employee_number',)
