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

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Mi Perfil</h1>

            <div className="w-full">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
                    <div className="flex items-center">
                        <div className="bg-blue-600 text-white rounded-full p-4 mr-6">
                            <FontAwesomeIcon icon={faUser} className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-blue-900">
                                {userData.first_name} {userData.last_name}
                            </h2>
                            <p className="text-blue-700 text-lg">@{userData.username}</p>
                            <div className="flex items-center mt-2 space-x-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    userData.status === 'Activo' ? 'bg-green-100 text-green-800' :
                                    userData.status === 'Inactivo' ? 'bg-red-100 text-red-800' :
                                    userData.status === 'Vacaciones' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {userData.status || 'Sin estado'}
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
                                    Información Personal
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Nombre completo:</span>
                                        <span className="text-sm text-gray-900">{userData.first_name} {userData.last_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Nombre de usuario:</span>
                                        <span className="text-sm text-gray-900">{userData.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Correo electrónico:</span>
                                        <span className="text-sm text-gray-900">{userData.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Puesto:</span>
                                        <span className="text-sm text-gray-900">{userData.puesto || 'No especificado'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-green-600" />
                                    Ubicación
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Región:</span>
                                        <span className="text-sm text-gray-900">{userData.region_name || 'No asignada'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Departamento:</span>
                                        <span className="text-sm text-gray-900">{userData.departamento_name || 'No asignado'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Información del Sistema */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faUserShield} className="mr-3 text-purple-600" />
                                    Información del Sistema
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Estado de cuenta:</span>
                                        <span className={`text-sm font-medium ${
                                            userData.is_active ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {userData.is_active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Último login:</span>
                                        <span className="text-sm text-gray-900">
                                            {userData.last_login ? formatDate(userData.last_login) : 'Nunca'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600">Fecha de registro:</span>
                                        <span className="text-sm text-gray-900">{formatDate(userData.date_joined)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Permisos y Roles */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faIdBadge} className="mr-3 text-orange-600" />
                                    Roles y Permisos
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Rol principal:</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {userData.role_name || 'Sin rol asignado'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Grupos adicionales:</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {userData.groups && userData.groups.length > 0
                                                ? userData.groups.map(group => group.name).join(', ')
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
                                Resumen de Actividad
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {userData.audit_logs_count || 0}
                                    </div>
                                    <div className="text-sm text-blue-700">Acciones registradas</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {userData.assets_count || 0}
                                    </div>
                                    <div className="text-sm text-green-700">Activos gestionados</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {userData.permissions_count || 0}
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
                    userId={user.id}
                    onClose={() => setShowChangePasswordModal(false)}
                />
            </Modal>
        </div>
    );
}

export default UserProfile;