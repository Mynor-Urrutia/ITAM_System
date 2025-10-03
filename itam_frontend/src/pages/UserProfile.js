// itam_frontend/src/pages/UserProfile.js

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../api';
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
    faKey
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import ChangePasswordForm from '../components/ChangePasswordForm';

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchUserProfile();
    }, []);

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
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                {userData.employee_data ? 'Perfil del Empleado' : 'Mi Perfil'}
            </h1>

            <div className="w-full">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
                    <div className="flex items-center">
                        <div className="bg-blue-600 text-white rounded-full p-4 mr-6">
                            <FontAwesomeIcon icon={faUser} className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-blue-900">
                                {displayData.first_name} {displayData.last_name}
                            </h2>
                            <p className="text-blue-700 text-lg">@{displayData.username}</p>
                            <div className="flex items-center mt-2 space-x-3">
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
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                                >
                                    <FontAwesomeIcon icon={faKey} className="mr-2" />
                                    Cambiar Contraseña
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Information Cards Grid */}
                    <div className="md:w-2/3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información Personal */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faUser} className="mr-3 text-blue-600" />
                                    {userData.employee_data ? 'Información del Empleado' : 'Información Personal'}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Nombre completo:</span>
                                        <span className="text-sm text-gray-900">{displayData.first_name} {displayData.last_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">{userData.employee_data ? 'No. Empleado:' : 'Nombre de usuario:'}</span>
                                        <span className="text-sm text-gray-900">{displayData.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Correo electrónico:</span>
                                        <span className="text-sm text-gray-900">{displayData.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Puesto:</span>
                                        <span className="text-sm text-gray-900">{displayData.puesto || 'No especificado'}</span>
                                    </div>
                                    {userData.employee_data && (
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Fecha de inicio:</span>
                                            <span className="text-sm text-gray-900">{formatDate(displayData.date_joined)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-green-600" />
                                    Ubicación
                                </h3>
                                <div className="space-y-3">
                                    {userData.employee_data ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Región:</span>
                                                <span className="text-sm text-gray-900">{displayData.region_name || 'No asignada'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Finca:</span>
                                                <span className="text-sm text-gray-900">{displayData.finca_name || 'No asignada'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Departamento:</span>
                                                <span className="text-sm text-gray-900">{displayData.department_name || 'No asignado'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Área:</span>
                                                <span className="text-sm text-gray-900">{displayData.area_name || 'No asignada'}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Región:</span>
                                                <span className="text-sm text-gray-900">{displayData.region_name || 'No asignada'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Departamento:</span>
                                                <span className="text-sm text-gray-900">{displayData.departamento_name || 'No asignado'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Información del Sistema */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faUserShield} className="mr-3 text-purple-600" />
                                    {userData.employee_data ? 'Información de la Cuenta' : 'Información del Sistema'}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            {userData.employee_data ? 'Estado del empleado:' : 'Estado de cuenta:'}
                                        </span>
                                        <span className={`text-sm font-medium ${
                                            displayData.is_active ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {displayData.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            {userData.employee_data ? 'Creación de cuenta:' : 'Último login:'}
                                        </span>
                                        <span className="text-sm text-gray-900">
                                            {userData.employee_data
                                                ? formatDate(displayData.account_created)
                                                : (displayData.last_login ? formatDate(displayData.last_login) : 'Nunca')
                                            }
                                        </span>
                                    </div>
                                    {!userData.employee_data && (
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Fecha de registro:</span>
                                            <span className="text-sm text-gray-900">{formatDate(displayData.date_joined)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Permisos y Roles */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faIdBadge} className="mr-3 text-orange-600" />
                                    {userData.employee_data ? 'Permisos de Acceso' : 'Roles y Permisos'}
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Rol principal:</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {displayData.role_name || 'Sin rol asignado'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Grupos adicionales:</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {displayData.groups && displayData.groups.length > 0
                                                ? displayData.groups.map(group => group.name).join(', ')
                                                : 'Ninguno'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="md:w-1/3">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faClock} className="mr-3 text-indigo-600" />
                                {userData.employee_data ? 'Actividad del Empleado' : 'Resumen de Actividad'}
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {displayData.audit_logs_count || 0}
                                    </div>
                                    <div className="text-sm text-blue-700">Acciones registradas</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {displayData.assets_count || 0}
                                    </div>
                                    <div className="text-sm text-green-700">Activos gestionados</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {displayData.permissions_count || 0}
                                    </div>
                                    <div className="text-sm text-purple-700">Permisos activos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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