/**
 * Página de Documentación de APIs.
 *
 * Interfaz completa para explorar y documentar todos los endpoints
 * disponibles en el sistema ITAM. Incluye búsqueda, filtrado por
 * categorías y acceso directo a pruebas interactivas de APIs.
 *
 * Características principales:
 * - Lista completa de todos los endpoints del sistema
 * - Búsqueda en tiempo real por URL o descripción
 * - Filtrado por categorías (Auth, Users, MasterData, Assets, Employees)
 * - Vista tabular organizada con información clara
 * - Integración con APIDetailModal para pruebas interactivas
 * - Diseño responsive con navegación intuitiva
 * - Estadísticas de resultados filtrados
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faServer, faDatabase, faUsers, faKey, faSearch, faEye } from '@fortawesome/free-solid-svg-icons';
import APIDetailModal from './APIDetailModal';

const APIDocumentationPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);

    // API endpoints data based on backend URL configurations
    const apiEndpoints = [
        // Authentication
        {
            category: 'auth',
            method: 'POST',
            url: '/api/login/',
            description: 'Obtain JWT token pair for authentication',
            icon: faKey
        },
        {
            category: 'auth',
            method: 'POST',
            url: '/api/login/refresh/',
            description: 'Refresh JWT access token',
            icon: faKey
        },
        {
            category: 'auth',
            method: 'POST',
            url: '/api/login/verify/',
            description: 'Verify JWT token validity',
            icon: faKey
        },

        // Users
        {
            category: 'users',
            method: 'GET',
            url: '/api/users/',
            description: 'List all users',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'POST',
            url: '/api/users/',
            description: 'Create a new user',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'GET',
            url: '/api/users/{id}/',
            description: 'Retrieve a specific user',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'PUT',
            url: '/api/users/{id}/',
            description: 'Update a specific user',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'DELETE',
            url: '/api/users/{id}/',
            description: 'Delete a specific user',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'GET',
            url: '/api/users/me/',
            description: 'Get current authenticated user information',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'POST',
            url: '/api/users/{id}/change-password/',
            description: 'Change password for a specific user',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'GET',
            url: '/api/roles/',
            description: 'List all roles',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'POST',
            url: '/api/roles/',
            description: 'Create a new role',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'GET',
            url: '/api/roles/{id}/',
            description: 'Retrieve a specific role',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'PUT',
            url: '/api/roles/{id}/',
            description: 'Update a specific role',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'DELETE',
            url: '/api/roles/{id}/',
            description: 'Delete a specific role',
            icon: faUsers
        },
        {
            category: 'users',
            method: 'GET',
            url: '/api/permissions/',
            description: 'List all permissions',
            icon: faUsers
        },

        // Master Data
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/regions/',
            description: 'List all regions',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'POST',
            url: '/api/masterdata/regions/',
            description: 'Create a new region',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/regions/{id}/',
            description: 'Retrieve a specific region',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'PUT',
            url: '/api/masterdata/regions/{id}/',
            description: 'Update a specific region',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'DELETE',
            url: '/api/masterdata/regions/{id}/',
            description: 'Delete a specific region',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/fincas/',
            description: 'List all farms',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'POST',
            url: '/api/masterdata/fincas/',
            description: 'Create a new farm',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/fincas/{id}/',
            description: 'Retrieve a specific farm',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'PUT',
            url: '/api/masterdata/fincas/{id}/',
            description: 'Update a specific farm',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'DELETE',
            url: '/api/masterdata/fincas/{id}/',
            description: 'Delete a specific farm',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/departamentos/',
            description: 'List all departments',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'POST',
            url: '/api/masterdata/departamentos/',
            description: 'Create a new department',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/departamentos/{id}/',
            description: 'Retrieve a specific department',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'PUT',
            url: '/api/masterdata/departamentos/{id}/',
            description: 'Update a specific department',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'DELETE',
            url: '/api/masterdata/departamentos/{id}/',
            description: 'Delete a specific department',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/areas/',
            description: 'List all areas',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'POST',
            url: '/api/masterdata/areas/',
            description: 'Create a new area',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/areas/{id}/',
            description: 'Retrieve a specific area',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'PUT',
            url: '/api/masterdata/areas/{id}/',
            description: 'Update a specific area',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'DELETE',
            url: '/api/masterdata/areas/{id}/',
            description: 'Delete a specific area',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/tipos-activos/',
            description: 'List all asset types',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'POST',
            url: '/api/masterdata/tipos-activos/',
            description: 'Create a new asset type',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/tipos-activos/{id}/',
            description: 'Retrieve a specific asset type',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'PUT',
            url: '/api/masterdata/tipos-activos/{id}/',
            description: 'Update a specific asset type',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'DELETE',
            url: '/api/masterdata/tipos-activos/{id}/',
            description: 'Delete a specific asset type',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/marcas/',
            description: 'List all brands',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'POST',
            url: '/api/masterdata/marcas/',
            description: 'Create a new brand',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/marcas/{id}/',
            description: 'Retrieve a specific brand',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'PUT',
            url: '/api/masterdata/marcas/{id}/',
            description: 'Update a specific brand',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'DELETE',
            url: '/api/masterdata/marcas/{id}/',
            description: 'Delete a specific brand',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/modelos-activo/',
            description: 'List all asset models',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'POST',
            url: '/api/masterdata/modelos-activo/',
            description: 'Create a new asset model',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/modelos-activo/{id}/',
            description: 'Retrieve a specific asset model',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'PUT',
            url: '/api/masterdata/modelos-activo/{id}/',
            description: 'Update a specific asset model',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'DELETE',
            url: '/api/masterdata/modelos-activo/{id}/',
            description: 'Delete a specific asset model',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/proveedores/',
            description: 'List all suppliers',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'POST',
            url: '/api/masterdata/proveedores/',
            description: 'Create a new supplier',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/proveedores/{id}/',
            description: 'Retrieve a specific supplier',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'PUT',
            url: '/api/masterdata/proveedores/{id}/',
            description: 'Update a specific supplier',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'DELETE',
            url: '/api/masterdata/proveedores/{id}/',
            description: 'Delete a specific supplier',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/audit-logs/',
            description: 'List all audit logs',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/audit-logs/{id}/',
            description: 'Retrieve a specific audit log',
            icon: faDatabase
        },
        {
            category: 'masterdata',
            method: 'GET',
            url: '/api/masterdata/reports/audit-logs/csv/',
            description: 'Download audit logs report in CSV format',
            icon: faDatabase
        },

        // Assets
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/activos/',
            description: 'List all assets',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'POST',
            url: '/api/assets/activos/',
            description: 'Create a new asset',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/activos/{id}/',
            description: 'Retrieve a specific asset',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'PUT',
            url: '/api/assets/activos/{id}/',
            description: 'Update a specific asset',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'DELETE',
            url: '/api/assets/activos/{id}/',
            description: 'Delete a specific asset',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/maintenances/',
            description: 'List all maintenance records',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'POST',
            url: '/api/assets/maintenances/',
            description: 'Create a new maintenance record',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/maintenances/{id}/',
            description: 'Retrieve a specific maintenance record',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'PUT',
            url: '/api/assets/maintenances/{id}/',
            description: 'Update a specific maintenance record',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'DELETE',
            url: '/api/assets/maintenances/{id}/',
            description: 'Delete a specific maintenance record',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/assignments/',
            description: 'List all asset assignments',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'POST',
            url: '/api/assets/assignments/',
            description: 'Create a new asset assignment',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/assignments/{id}/',
            description: 'Retrieve a specific asset assignment',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'PUT',
            url: '/api/assets/assignments/{id}/',
            description: 'Update a specific asset assignment',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'DELETE',
            url: '/api/assets/assignments/{id}/',
            description: 'Delete a specific asset assignment',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/dashboard/',
            description: 'Get dashboard data',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/dashboard-models/',
            description: 'Get dashboard models data',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/dashboard-warranty/',
            description: 'Get dashboard warranty data',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/dashboard-summary/',
            description: 'Get dashboard summary data',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/dashboard-detail/',
            description: 'Get dashboard detail data',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/maintenance-overview/',
            description: 'Get maintenance overview data',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/reports/assets/csv/',
            description: 'Download assets report in CSV format',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/reports/maintenance/csv/',
            description: 'Download maintenance report in CSV format',
            icon: faServer
        },
        {
            category: 'assets',
            method: 'GET',
            url: '/api/assets/reports/assignments/csv/',
            description: 'Download assignments report in CSV format',
            icon: faServer
        },

        // Employees
        {
            category: 'employees',
            method: 'GET',
            url: '/api/employees/employees/',
            description: 'List all employees',
            icon: faUsers
        },
        {
            category: 'employees',
            method: 'POST',
            url: '/api/employees/employees/',
            description: 'Create a new employee',
            icon: faUsers
        },
        {
            category: 'employees',
            method: 'GET',
            url: '/api/employees/employees/{id}/',
            description: 'Retrieve a specific employee',
            icon: faUsers
        },
        {
            category: 'employees',
            method: 'PUT',
            url: '/api/employees/employees/{id}/',
            description: 'Update a specific employee',
            icon: faUsers
        },
        {
            category: 'employees',
            method: 'DELETE',
            url: '/api/employees/employees/{id}/',
            description: 'Delete a specific employee',
            icon: faUsers
        }
    ];

    const categories = [
        { value: 'all', label: 'Todas las APIs', icon: faCode },
        { value: 'auth', label: 'Autenticación', icon: faKey },
        { value: 'users', label: 'Usuarios', icon: faUsers },
        { value: 'masterdata', label: 'Datos Maestros', icon: faDatabase },
        { value: 'assets', label: 'Activos', icon: faServer },
        { value: 'employees', label: 'Empleados', icon: faUsers }
    ];

    const filteredEndpoints = apiEndpoints.filter(endpoint => {
        const matchesSearch = endpoint.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'bg-green-100 text-green-800';
            case 'POST': return 'bg-blue-100 text-blue-800';
            case 'PUT': return 'bg-yellow-100 text-yellow-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleEndpointClick = (endpoint) => {
        setSelectedEndpoint(endpoint);
        setShowDetailModal(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    <FontAwesomeIcon icon={faCode} className="mr-3" />
                    Documentación de APIs
                </h1>
                <p className="text-gray-600">
                    Lista completa de todos los endpoints disponibles en el sistema ITAM.
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar endpoints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map(category => (
                        <button
                            key={category.value}
                            onClick={() => setSelectedCategory(category.value)}
                            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                                selectedCategory === category.value
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <FontAwesomeIcon icon={category.icon} className="mr-2" />
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            <div className="mb-4 text-gray-600">
                Mostrando {filteredEndpoints.length} endpoints
            </div>

            {/* API Endpoints Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Método
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Endpoint
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Categoría
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEndpoints.map((endpoint, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(endpoint.method)}`}>
                                            {endpoint.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {endpoint.url}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {endpoint.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={endpoint.icon} className="mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-900 capitalize">
                                                {categories.find(cat => cat.value === endpoint.category)?.label || endpoint.category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleEndpointClick(endpoint)}
                                            className="text-blue-600 hover:text-blue-900 hover:underline flex items-center"
                                        >
                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredEndpoints.length === 0 && (
                <div className="text-center py-12">
                    <FontAwesomeIcon icon={faCode} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron endpoints</h3>
                    <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
                </div>
            )}

            {/* API Detail Modal */}
            <APIDetailModal
                show={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                endpoint={selectedEndpoint}
            />
        </div>
    );
};

export default APIDocumentationPage;