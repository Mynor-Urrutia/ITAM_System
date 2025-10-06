import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileCsv,
    faFilter,
    faDownload,
    faLaptop,
    faTools,
    faLink,
    faHistory,
    faCalendarAlt,
    faUser,
    faBuilding,
    faMapMarkerAlt,
    faTags
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
    getTiposActivos,
    getMarcas,
    getModelosActivo,
    getRegions,
    getFincas,
    getDepartamentos,
    getAreas,
    getEmployees,
    getUsers
} from '../api';
import api from '../api';

function ReportsPage() {
    const { hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('assets');
    const [filters, setFilters] = useState({
        assets: {
            estado: 'activo',
            tipo_activo: '',
            marca: '',
            modelo: '',
            region: '',
            finca: '',
            departamento: '',
            area: ''
        },
        maintenance: {
            activo: '',
            technician: '',
            region: '',
            finca: '',
            estado: 'activo',
            fecha_desde: '',
            fecha_hasta: ''
        },
        assignments: {
            employee: '',
            activo: '',
            assigned_by: '',
            fecha_desde: '',
            fecha_hasta: '',
            active_only: 'true'
        },
        audit: {
            activity_type: '',
            user: '',
            fecha_desde: '',
            fecha_hasta: '',
            content_type: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [masterData, setMasterData] = useState({
        tipos_activo: [],
        marcas: [],
        regions: [],
        fincas: [],
        departamentos: [],
        areas: [],
        employees: [],
        users: [],
        content_types: []
    });

    useEffect(() => {
        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
            const [
                tiposData,
                marcasData,
                modelosData,
                regionsData,
                fincasData,
                deptosData,
                areasData,
                employeesData,
                usersData
            ] = await Promise.all([
                getTiposActivos({ page_size: 1000 }),
                getMarcas({ page_size: 1000 }),
                getModelosActivo({ page_size: 1000 }),
                getRegions({ page_size: 1000 }),
                getFincas({ page_size: 1000 }),
                getDepartamentos({ page_size: 1000 }),
                getAreas({ page_size: 1000 }),
                getEmployees({ page_size: 1000 }),
                getUsers({ page_size: 1000 })
            ]);

            setMasterData({
                tipos_activo: tiposData.data.results || tiposData.data,
                marcas: marcasData.data.results || marcasData.data,
                modelos: modelosData.data.results || modelosData.data,
                regions: regionsData.data.results || regionsData.data,
                fincas: fincasData.data.results || fincasData.data,
                departamentos: deptosData.data.results || deptosData.data,
                areas: areasData.data.results || areasData.data,
                employees: employeesData.data.results || employeesData.data,
                users: usersData.data.results || usersData.data,
                content_types: [
                    { id: 'masterdata.region', name: 'Región' },
                    { id: 'masterdata.finca', name: 'Finca' },
                    { id: 'masterdata.departamento', name: 'Departamento' },
                    { id: 'masterdata.area', name: 'Área' },
                    { id: 'masterdata.tipoactivo', name: 'Tipo de Activo' },
                    { id: 'masterdata.marca', name: 'Marca' },
                    { id: 'masterdata.modeloactivo', name: 'Modelo de Activo' },
                    { id: 'masterdata.proveedor', name: 'Proveedor' },
                    { id: 'assets.activo', name: 'Activo' },
                    { id: 'assets.maintenance', name: 'Mantenimiento' },
                    { id: 'assets.assignment', name: 'Asignación' },
                    { id: 'employees.employee', name: 'Empleado' },
                    { id: 'users.customuser', name: 'Usuario' }
                ]
            });
        } catch (error) {
            console.error('Error loading master data:', error);
            toast.error('Error al cargar datos maestros');
        }
    };

    const handleFilterChange = (reportType, field, value) => {
        setFilters(prev => ({
            ...prev,
            [reportType]: {
                ...prev[reportType],
                [field]: value
            }
        }));
    };

    const generateReport = async (reportType) => {
        setLoading(true);
        try {
            const currentFilters = filters[reportType];
            const params = new URLSearchParams();

            // Add filters to params
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value && value !== '') {
                    params.append(key, value);
                }
            });

            let endpoint;
            switch (reportType) {
                case 'assets':
                    endpoint = `assets/reports/assets/csv/?${params}`;
                    break;
                case 'maintenance':
                    endpoint = `assets/reports/maintenance/csv/?${params}`;
                    break;
                case 'assignments':
                    endpoint = `assets/reports/assignments/csv/?${params}`;
                    break;
                case 'audit':
                    endpoint = `masterdata/reports/audit-logs/csv/?${params}`;
                    break;
                default:
                    throw new Error('Tipo de reporte no válido');
            }

            // Make the request with responseType 'blob' to handle file download
            const response = await api.get(endpoint, {
                responseType: 'blob',
                timeout: 30000 // 30 second timeout for large reports
            });

            // Create a blob URL for download (response already includes UTF-8 BOM)
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Reporte generado exitosamente');
        } catch (error) {
            console.error('Error generating report:', error);
            if (error.response?.status === 401) {
                toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            } else if (error.response?.status === 403) {
                toast.error('No tienes permisos para generar este reporte.');
            } else if (error.response?.status === 404) {
                toast.error('No se encontraron datos para el reporte solicitado.');
            } else {
                toast.error('Error al generar el reporte. Inténtalo nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderAssetsFilters = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                <select
                    value={filters.assets.estado}
                    onChange={(e) => handleFilterChange('assets', 'estado', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="activo">Activo</option>
                    <option value="retirado">Retirado</option>
                    <option value="all">Todos</option>
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select
                    value={filters.assets.tipo_activo}
                    onChange={(e) => handleFilterChange('assets', 'tipo_activo', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todos</option>
                    {masterData.tipos_activo?.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>{tipo.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Marca</label>
                <select
                    value={filters.assets.marca}
                    onChange={(e) => handleFilterChange('assets', 'marca', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todas</option>
                    {masterData.marcas?.map(marca => (
                        <option key={marca.id} value={marca.id}>{marca.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Modelo</label>
                <select
                    value={filters.assets.modelo}
                    onChange={(e) => handleFilterChange('assets', 'modelo', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todos</option>
                    {masterData.modelos?.map(modelo => (
                        <option key={modelo.id} value={modelo.id}>{modelo.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Región</label>
                <select
                    value={filters.assets.region}
                    onChange={(e) => handleFilterChange('assets', 'region', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todas</option>
                    {masterData.regions?.map(region => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Finca</label>
                <select
                    value={filters.assets.finca}
                    onChange={(e) => handleFilterChange('assets', 'finca', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todas</option>
                    {masterData.fincas?.map(finca => (
                        <option key={finca.id} value={finca.id}>{finca.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Depto</label>
                <select
                    value={filters.assets.departamento}
                    onChange={(e) => handleFilterChange('assets', 'departamento', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todos</option>
                    {masterData.departamentos?.map(depto => (
                        <option key={depto.id} value={depto.id}>{depto.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Área</label>
                <select
                    value={filters.assets.area}
                    onChange={(e) => handleFilterChange('assets', 'area', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todas</option>
                    {masterData.areas?.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    const renderMaintenanceFilters = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Activo</label>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={filters.maintenance.activo}
                    onChange={(e) => handleFilterChange('maintenance', 'activo', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Técnico</label>
                <select
                    value={filters.maintenance.technician}
                    onChange={(e) => handleFilterChange('maintenance', 'technician', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todos</option>
                    {masterData.users?.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                <select
                    value={filters.maintenance.estado}
                    onChange={(e) => handleFilterChange('maintenance', 'estado', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="activo">Activo</option>
                    <option value="retirado">Retirado</option>
                    <option value="all">Todos</option>
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Región</label>
                <select
                    value={filters.maintenance.region}
                    onChange={(e) => handleFilterChange('maintenance', 'region', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todas</option>
                    {masterData.regions?.map(region => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Finca</label>
                <select
                    value={filters.maintenance.finca}
                    onChange={(e) => handleFilterChange('maintenance', 'finca', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todas</option>
                    {masterData.fincas?.map(finca => (
                        <option key={finca.id} value={finca.id}>{finca.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Desde</label>
                <input
                    type="date"
                    value={filters.maintenance.fecha_desde}
                    onChange={(e) => handleFilterChange('maintenance', 'fecha_desde', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Hasta</label>
                <input
                    type="date"
                    value={filters.maintenance.fecha_hasta}
                    onChange={(e) => handleFilterChange('maintenance', 'fecha_hasta', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
        </div>
    );

    const renderAssignmentsFilters = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Empleado</label>
                <select
                    value={filters.assignments.employee}
                    onChange={(e) => handleFilterChange('assignments', 'employee', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todos</option>
                    {masterData.employees?.map(employee => (
                        <option key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Activo</label>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={filters.assignments.activo}
                    onChange={(e) => handleFilterChange('assignments', 'activo', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Asignado Por</label>
                <select
                    value={filters.assignments.assigned_by}
                    onChange={(e) => handleFilterChange('assignments', 'assigned_by', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todos</option>
                    {masterData.users?.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Desde</label>
                <input
                    type="date"
                    value={filters.assignments.fecha_desde}
                    onChange={(e) => handleFilterChange('assignments', 'fecha_desde', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Hasta</label>
                <input
                    type="date"
                    value={filters.assignments.fecha_hasta}
                    onChange={(e) => handleFilterChange('assignments', 'fecha_hasta', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Solo Activas</label>
                <select
                    value={filters.assignments.active_only}
                    onChange={(e) => handleFilterChange('assignments', 'active_only', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                </select>
            </div>
        </div>
    );

    const renderAuditFilters = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Actividad</label>
                <select
                    value={filters.audit.activity_type}
                    onChange={(e) => handleFilterChange('audit', 'activity_type', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todas</option>
                    <option value="CREATE">Crear</option>
                    <option value="UPDATE">Actualizar</option>
                    <option value="DELETE">Eliminar</option>
                    <option value="LOGIN">Login</option>
                    <option value="RETIRE">Retirar</option>
                    <option value="REACTIVATE">Reactivar</option>
                    <option value="RETURN">Devolver</option>
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Usuario</label>
                <select
                    value={filters.audit.user}
                    onChange={(e) => handleFilterChange('audit', 'user', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todos</option>
                    {masterData.users.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Contenido</label>
                <select
                    value={filters.audit.content_type}
                    onChange={(e) => handleFilterChange('audit', 'content_type', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="">Todos</option>
                    {masterData.content_types?.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Desde</label>
                <input
                    type="date"
                    value={filters.audit.fecha_desde}
                    onChange={(e) => handleFilterChange('audit', 'fecha_desde', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Hasta</label>
                <input
                    type="date"
                    value={filters.audit.fecha_hasta}
                    onChange={(e) => handleFilterChange('audit', 'fecha_hasta', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
        </div>
    );

    const tabs = [
        {
            id: 'assets',
            name: 'Activos',
            icon: faLaptop,
            permission: 'assets.view_activo',
            filters: renderAssetsFilters
        },
        {
            id: 'maintenance',
            name: 'Mantenimiento',
            icon: faTools,
            permission: 'assets.view_activo',
            filters: renderMaintenanceFilters
        },
        {
            id: 'assignments',
            name: 'Asignaciones',
            icon: faLink,
            permission: 'assets.view_assignment',
            filters: renderAssignmentsFilters
        },
        {
            id: 'audit',
            name: 'Auditoría',
            icon: faHistory,
            permission: 'masterdata.view_auditlog',
            filters: renderAuditFilters
        }
    ].filter(tab => hasPermission(tab.permission));

    if (tabs.length === 0) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Reportes</h2>
                    <p className="text-gray-600">No tienes permisos para acceder a los reportes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes</h1>
                <p className="text-gray-600">Genera y descarga reportes en formato CSV con filtros personalizados</p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Active Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Reporte de {tabs.find(tab => tab.id === activeTab)?.name}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Configura los filtros y genera el reporte en formato CSV
                            </p>
                        </div>
                        <button
                            onClick={() => generateReport(activeTab)}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            {loading ? 'Generando...' : 'Generar CSV'}
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <FontAwesomeIcon icon={faFilter} className="mr-2 text-gray-500" />
                            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                        </div>
                        {tabs.find(tab => tab.id === activeTab)?.filters()}
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex">
                            <FontAwesomeIcon icon={faFileCsv} className="text-blue-400 mr-3 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-800">Formato CSV</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    El reporte se descargará automáticamente en formato CSV compatible con Excel y otras aplicaciones de hojas de cálculo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportsPage;