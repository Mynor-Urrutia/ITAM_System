// itam_frontend/src/pages/UserProfile.js

import React, { useState, useEffect } from 'react';
import { getCurrentUser, getAssignments } from '../api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faEnvelope,
    faIdBadge,
    faBuilding,
    faMapMarkerAlt,
    faCalendarAlt,
    faClock,
    faUserShield,
    faKey,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import ChangePasswordForm from '../components/ChangePasswordForm';

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const [assignedAssets, setAssignedAssets] = useState([]);
    const [assetsLoading, setAssetsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [expandedAssetCards, setExpandedAssetCards] = useState(new Set());
    const { user } = useAuth();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (userData) {
            fetchAssignedAssets();
        }
    }, [userData]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await getCurrentUser();
            setUserData(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError('Error al cargar la información del perfil.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedAssets = async () => {
        if (!userData?.employee_data?.id) return;

        try {
            setAssetsLoading(true);
            const params = {
                employee: userData.employee_data.id,
                active_only: true
            };
            const response = await getAssignments(params);
            setAssignedAssets(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching assigned assets:', error);
        } finally {
            setAssetsLoading(false);
        }
    };

    const toggleAssetCardExpansion = (assetId) => {
        const newExpanded = new Set(expandedAssetCards);
        if (newExpanded.has(assetId)) {
            newExpanded.delete(assetId);
        } else {
            newExpanded.add(assetId);
        }
        setExpandedAssetCards(newExpanded);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        // Handle date-only strings (YYYY-MM-DD) to avoid timezone issues
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            // For date-only strings, create date in local timezone
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day); // month is 0-indexed
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // For datetime strings, use the original method
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Cargando perfil...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="text-red-600 text-lg">{error}</div>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600 text-lg">No se pudo cargar la información del usuario.</div>
                </div>
            </div>
        );
    }

    // Determine if we should display employee data or user data
    const displayData = userData.employee_data ? {
        ...userData.employee_data,
        username: userData.employee_data.employee_number,
        email: userData.email || 'N/A', // Keep user email if available
        puesto: 'Empleado', // Default position for employees
        status: userData.status, // Keep user status
        is_active: userData.is_active,
        last_login: userData.last_login,
        date_joined: userData.employee_data.start_date,
        account_created: userData.date_joined, // Account creation date
        role_name: userData.role_name,
        groups: userData.groups,
        permissions_count: userData.permissions_count,
        audit_logs_count: userData.audit_logs_count,
        assets_count: userData.assets_count
    } : userData;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-600 text-white rounded-full p-3">
                                <FontAwesomeIcon icon={faUser} className="text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {displayData.first_name} {displayData.last_name}
                                </h1>
                                <p className="text-gray-600">@{displayData.username}</p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                displayData.status === 'Activo' ? 'bg-green-100 text-green-800' :
                                displayData.status === 'Inactivo' ? 'bg-red-100 text-red-800' :
                                displayData.status === 'Vacaciones' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {displayData.status || 'Sin estado'}
                            </span>
                            <button
                                onClick={() => setShowChangePasswordModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center transition-colors"
                            >
                                <FontAwesomeIcon icon={faKey} className="mr-2" />
                                Cambiar Contraseña
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <FontAwesomeIcon icon={faUser} className="text-blue-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Tipo de Usuario</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {userData.employee_data ? 'Empleado' : 'Usuario del Sistema'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <FontAwesomeIcon icon={faIdBadge} className="text-green-600 text-xl" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Rol Principal</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {displayData.role_name || 'Sin rol asignado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {userData.employee_data && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <FontAwesomeIcon icon={faBuilding} className="text-purple-600 text-xl" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Activos Asignados</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {assetsLoading ? '...' : assignedAssets.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Information Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Información Personal */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                                <FontAwesomeIcon icon={faUser} className="mr-3 text-blue-600" />
                                Información Personal
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre Completo</label>
                                    <p className="mt-1 text-sm text-gray-900 font-medium">{displayData.first_name} {displayData.last_name}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {userData.employee_data ? 'No. Empleado' : 'Nombre de Usuario'}
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 font-medium">{displayData.username}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Correo Electrónico</label>
                                    <p className="mt-1 text-sm text-gray-900">{displayData.email}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Puesto</label>
                                    <p className="mt-1 text-sm text-gray-900">{displayData.puesto || 'No especificado'}</p>
                                </div>
                                {userData.employee_data && (
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de Inicio</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(displayData.date_joined)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                            <h3 className="text-lg font-semibold text-green-900 flex items-center">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-green-600" />
                                Ubicación
                            </h3>
                        </div>
                        <div className="p-6">
                            {userData.employee_data ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Región</label>
                                        <p className="mt-1 text-sm text-gray-900">{displayData.region_name || 'No asignada'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Finca</label>
                                        <p className="mt-1 text-sm text-gray-900">{displayData.finca_name || 'No asignada'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Departamento</label>
                                        <p className="mt-1 text-sm text-gray-900">{displayData.department_name || 'No asignado'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Área</label>
                                        <p className="mt-1 text-sm text-gray-900">{displayData.area_name || 'No asignada'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Región</label>
                                        <p className="mt-1 text-sm text-gray-900">{displayData.region_name || 'No asignada'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Departamento</label>
                                        <p className="mt-1 text-sm text-gray-900">{displayData.departamento_name || 'No asignado'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del Sistema */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
                                <FontAwesomeIcon icon={faUserShield} className="mr-3 text-purple-600" />
                                Información del Sistema
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {userData.employee_data ? 'Estado del Empleado' : 'Estado de Cuenta'}
                                    </label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                        displayData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {displayData.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {userData.employee_data ? 'Creación de Cuenta' : 'Último Login'}
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {userData.employee_data
                                            ? formatDate(displayData.account_created)
                                            : (displayData.last_login ? formatDate(displayData.last_login) : 'Nunca')
                                        }
                                    </p>
                                </div>
                                {!userData.employee_data && (
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de Registro</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(displayData.date_joined)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Permisos y Roles */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
                            <h3 className="text-lg font-semibold text-orange-900 flex items-center">
                                <FontAwesomeIcon icon={faIdBadge} className="mr-3 text-orange-600" />
                                Roles y Permisos
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Rol Principal</label>
                                <p className="mt-1 text-sm text-gray-900 font-medium">{displayData.role_name || 'Sin rol asignado'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Grupos Adicionales</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {displayData.groups && displayData.groups.length > 0
                                        ? displayData.groups.map(group => group.name).join(', ')
                                        : 'Ninguno'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assigned Assets Section */}
                {userData?.employee_data && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                            <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
                                <FontAwesomeIcon icon={faBuilding} className="mr-3 text-indigo-600" />
                                Activos Asignados
                                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {assetsLoading ? '...' : assignedAssets.length}
                                </span>
                            </h2>
                        </div>

                        {/* Mobile Card View */}
                        <div className="block sm:hidden p-6">
                            {assetsLoading ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">Cargando activos asignados...</div>
                                </div>
                            ) : assignedAssets.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">No hay activos asignados actualmente.</div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignedAssets.map((assignment) => {
                                        const isExpanded = expandedAssetCards.has(assignment.id);
                                        return (
                                            <div key={assignment.id} className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                                {/* Card Header - Always Visible */}
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 text-lg leading-tight">
                                                                {assignment.activo_hostname}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                <span className="font-medium">Serie:</span> {assignment.activo_serie}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end space-y-2">
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                                Asignado
                                                            </span>
                                                            <button
                                                                onClick={() => toggleAssetCardExpansion(assignment.id)}
                                                                className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
                                                                title={isExpanded ? "Contraer detalles" : "Ver más detalles"}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={isExpanded ? faChevronUp : faChevronDown}
                                                                    className="text-sm"
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Asset Type Badge - Always Visible */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                            {assignment.activo_tipo_activo_name}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Expandable Content */}
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 border-t border-gray-200">
                                                        <div className="space-y-3 mt-3">
                                                            <div className="grid grid-cols-1 gap-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Marca:</span>
                                                                    <span className="text-gray-900 font-medium">{assignment.activo_marca_name}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Modelo:</span>
                                                                    <span className="text-gray-900 font-medium">{assignment.activo_modelo_name}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Fecha de Asignación:</span>
                                                                    <span className="text-gray-900 font-medium">
                                                                        {new Date(assignment.assigned_date).toLocaleDateString('es-ES')}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Asset Specs */}
                                                            {(() => {
                                                                const tipo = assignment.activo_tipo_activo_name?.toLowerCase() || '';
                                                                const computoTypes = ['computadora', 'laptop', 'desktop', 'servidor', 'all in one'];
                                                                const redTypes = ['switch', 'router', 'routers', 'firewall', 'ap wifi', 'p2p'];
                                                                const isComputo = computoTypes.some(t => tipo.includes(t));
                                                                const isRed = redTypes.some(t => tipo.includes(t));
                                                                const isPeriferico = !isComputo && !isRed;

                                                                // Check if there are any specs to show for this asset type
                                                                const hasComputoSpecs = isComputo && (
                                                                    (assignment.activo_procesador && assignment.activo_procesador.trim()) ||
                                                                    (assignment.activo_ram && assignment.activo_ram > 0) ||
                                                                    (assignment.activo_almacenamiento && assignment.activo_almacenamiento.trim()) ||
                                                                    (assignment.activo_tarjeta_grafica && assignment.activo_tarjeta_grafica.trim()) ||
                                                                    assignment.activo_wifi !== null ||
                                                                    assignment.activo_ethernet !== null
                                                                );
                                                                const hasRedSpecs = isRed && (
                                                                    (assignment.activo_puertos_ethernet && assignment.activo_puertos_ethernet.trim()) ||
                                                                    (assignment.activo_puertos_sfp && assignment.activo_puertos_sfp.trim()) ||
                                                                    assignment.activo_puerto_consola !== null ||
                                                                    (assignment.activo_puertos_poe && assignment.activo_puertos_poe.trim()) ||
                                                                    (assignment.activo_alimentacion && assignment.activo_alimentacion.trim()) ||
                                                                    assignment.activo_administrable !== null
                                                                );
                                                                const hasPerifericoSpecs = isPeriferico && (
                                                                    (assignment.activo_tamano && assignment.activo_tamano.trim()) ||
                                                                    (assignment.activo_color && assignment.activo_color.trim()) ||
                                                                    (assignment.activo_conectores && assignment.activo_conectores.trim()) ||
                                                                    (assignment.activo_cables && assignment.activo_cables.trim())
                                                                );

                                                                if (!hasComputoSpecs && !hasRedSpecs && !hasPerifericoSpecs) {
                                                                    return null;
                                                                }

                                                                return (
                                                                    <div className="pt-3 border-t border-gray-200">
                                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Especificaciones</p>
                                                                        <div className="space-y-1 text-xs text-gray-600">
                                                                            {/* Computo Specs */}
                                                                            {isComputo && (
                                                                                <>
                                                                                    {assignment.activo_procesador && assignment.activo_procesador.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Procesador:</span>
                                                                                            <span className="font-medium">{assignment.activo_procesador}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_ram && assignment.activo_ram > 0 && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>RAM:</span>
                                                                                            <span className="font-medium">{assignment.activo_ram} GB</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_almacenamiento && assignment.activo_almacenamiento.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Almacenamiento:</span>
                                                                                            <span className="font-medium">{assignment.activo_almacenamiento}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_tarjeta_grafica && assignment.activo_tarjeta_grafica.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Tarjeta Gráfica:</span>
                                                                                            <span className="font-medium">{assignment.activo_tarjeta_grafica}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_wifi !== null && assignment.activo_wifi !== undefined && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>WIFI:</span>
                                                                                            <span className="font-medium">{Boolean(assignment.activo_wifi) ? 'Sí' : 'No'}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_ethernet !== null && assignment.activo_ethernet !== undefined && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Ethernet:</span>
                                                                                            <span className="font-medium">{Boolean(assignment.activo_ethernet) ? 'Sí' : 'No'}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}

                                                                            {/* Red Specs */}
                                                                            {isRed && (
                                                                                <>
                                                                                    {assignment.activo_puertos_ethernet && assignment.activo_puertos_ethernet.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Puertos Ethernet:</span>
                                                                                            <span className="font-medium">{assignment.activo_puertos_ethernet}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_puertos_sfp && assignment.activo_puertos_sfp.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Puertos SFP:</span>
                                                                                            <span className="font-medium">{assignment.activo_puertos_sfp}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_puerto_consola !== null && assignment.activo_puerto_consola !== undefined && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Puerto Consola:</span>
                                                                                            <span className="font-medium">{Boolean(assignment.activo_puerto_consola) ? 'Sí' : 'No'}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_puertos_poe && assignment.activo_puertos_poe.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Puertos PoE:</span>
                                                                                            <span className="font-medium">{assignment.activo_puertos_poe}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_alimentacion && assignment.activo_alimentacion.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Alimentación:</span>
                                                                                            <span className="font-medium">{assignment.activo_alimentacion}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_administrable !== null && assignment.activo_administrable !== undefined && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Administrable:</span>
                                                                                            <span className="font-medium">{Boolean(assignment.activo_administrable) ? 'Sí' : 'No'}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}

                                                                            {/* Periferico Specs */}
                                                                            {isPeriferico && (
                                                                                <>
                                                                                    {assignment.activo_tamano && assignment.activo_tamano.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Tamaño:</span>
                                                                                            <span className="font-medium">{assignment.activo_tamano}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_color && assignment.activo_color.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Color:</span>
                                                                                            <span className="font-medium">{assignment.activo_color}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_conectores && assignment.activo_conectores.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Conectores:</span>
                                                                                            <span className="font-medium">{assignment.activo_conectores}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {assignment.activo_cables && assignment.activo_cables.trim() && (
                                                                                        <div className="flex justify-between">
                                                                                            <span>Cables:</span>
                                                                                            <span className="font-medium">{assignment.activo_cables}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block">
                            <div className="overflow-x-auto">
                                {assetsLoading ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500">Cargando activos asignados...</div>
                                    </div>
                                ) : assignedAssets.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500">No hay activos asignados actualmente.</div>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tipo
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Marca
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Modelo
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Serie
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Hostname
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Fecha de Asignación
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {assignedAssets.map((assignment) => (
                                                <tr key={assignment.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {assignment.activo_tipo_activo_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {assignment.activo_marca_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {assignment.activo_modelo_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                        {assignment.activo_serie}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {assignment.activo_hostname}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(assignment.assigned_date).toLocaleDateString('es-ES')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Change Password Modal */}
            <Modal
                show={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
                title="Cambiar Contraseña"
            >
                <ChangePasswordForm
                    userId={userData.id}
                    onClose={() => setShowChangePasswordModal(false)}
                />
            </Modal>
        </div>
    );
}


export default UserProfile;