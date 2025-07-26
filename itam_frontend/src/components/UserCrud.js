import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

import Modal from './Modal';
import UserForm from './UserForm';
import UserDetail from './UserDetail';
import ChangePasswordForm from './ChangePasswordForm';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEye,
    faEdit,
    faKey,
    faToggleOn, faToggleOff
} from '@fortawesome/free-solid-svg-icons';

function UserCrud() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]); // Estado para almacenar los roles
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const { user: loggedInUser, fetchUserDetails } = useAuth();

    const effectRan = useRef(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/users/');
            setUsers(response.data);
            // toast.success('Usuarios cargados exitosamente.'); // Descomentar si quieres un toast cada vez que se cargan los usuarios
        } catch (err) {
            if (err.response && err.response.status === 401) {
                toast.error('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
                localStorage.clear();
                navigate('/login');
            } else {
                setError('Error al cargar usuarios: ' + (err.response?.data?.detail || err.message));
                console.error("Error fetching users:", err);
                toast.error('Error al cargar usuarios.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Función para obtener la lista de roles
    const fetchRoles = useCallback(async () => {
        try {
            const response = await api.get('/roles/');
            setRoles(response.data);
        } catch (err) {
            console.error("Error fetching roles:", err);
            toast.error('Error al cargar los roles.');
        }
    }, []);

    useEffect(() => {
        if (effectRan.current === false) {
            fetchUsers();
            fetchRoles(); // Carga los roles al montar el componente
            effectRan.current = true;
        }
    }, [fetchUsers, fetchRoles]);

    const handleCreateUserClick = () => {
        setCurrentUser(null);
        setShowCreateModal(true);
    };

    const handleEditUserClick = (userToEdit) => {
        setCurrentUser(userToEdit);
        setShowEditModal(true);
    };

    const handleViewUserClick = (user) => {
        setCurrentUser(user);
        setShowViewModal(true);
    };

    const handleChangePasswordClick = (user) => {
        setCurrentUser(user);
        setShowChangePasswordModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowViewModal(false);
        setShowChangePasswordModal(false);
        setCurrentUser(null);
    };

    const handleCreateUser = async (newUserData) => {
        try {
            // Asegúrate de que assigned_role_id sea un array de IDs (si no es nulo/vacío)
            const payload = { ...newUserData };
            if (payload.assigned_role_id) {
                payload.assigned_role_id = [parseInt(payload.assigned_role_id, 10)];
            } else {
                payload.assigned_role_id = []; // Si no se selecciona rol, envía un array vacío
            }

            const response = await api.post('/users/', payload);
            toast.success('Usuario creado exitosamente!');
            setUsers(prevUsers => [...prevUsers, response.data]);
            setShowCreateModal(false);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(' ') || 'Error al crear el usuario.';
            toast.error(`Error al crear el usuario: ${errorMsg}`);
            console.error("Error creating user:", err.response || err);
        }
    };

    const handleUpdateUser = async (updatedUserData) => {
        try {
            // Asegúrate de que assigned_role_id sea un array de IDs (si no es nulo/vacío)
            const payload = { ...updatedUserData };
            if (payload.assigned_role_id) {
                payload.assigned_role_id = [parseInt(payload.assigned_role_id, 10)];
            } else {
                payload.assigned_role_id = []; // Si no se selecciona rol, envía un array vacío
            }

            const response = await api.put(`/users/${updatedUserData.id}/`, payload);
            toast.success('Usuario actualizado exitosamente!');
            setUsers(prevUsers => prevUsers.map(u => u.id === updatedUserData.id ? response.data : u));
            setShowEditModal(false);

            if (loggedInUser && loggedInUser.id === updatedUserData.id) {
                console.log("Editando al usuario actual, recargando detalles del usuario...");
                await fetchUserDetails();
                toast.info("Tus propios datos de perfil han sido actualizados.");
            }

        } catch (err) {
            console.error("Error updating user:", err.response || err);
            const errorMsg = err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(' ') || 'Error al actualizar el usuario.';
            setError(errorMsg);
            toast.error(`Error al actualizar el usuario: ${errorMsg}`);
        }
    };

    const handleToggleIsActive = async (userId, currentIsActive) => { // Función para alternar 'is_active'
        const newIsActive = !currentIsActive;
        const actionText = newIsActive ? 'habilitar' : 'deshabilitar';

        if (!window.confirm(`¿Estás seguro de que quieres ${actionText} este usuario (afectará su inicio de sesión)?`)) {
            return;
        }

        try {
            const response = await api.patch(`/users/${userId}/`, { is_active: newIsActive });
            toast.success(`Usuario ${actionText === 'habilitar' ? 'habilitado' : 'deshabilitado'} exitosamente.`);

            setUsers(prevUsers => prevUsers.map(u =>
                u.id === userId ? { ...u, is_active: newIsActive } : u
            ));

            if (loggedInUser && loggedInUser.id === userId) {
                console.log("Alternando el estado de actividad del usuario actual, recargando detalles...");
                await fetchUserDetails();
                toast.info("Tu estado de cuenta ha sido actualizado.");
            }

        } catch (err) {
            if (err.response && err.response.status === 401) {
                toast.error('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
                localStorage.clear();
                navigate('/login');
            } else {
                setError('Error al actualizar el estado de actividad: ' + (err.response?.data?.detail || err.message));
                console.error("Error updating user active status:", err);
                toast.error('Error al actualizar el estado de actividad del usuario.');
            }
        }
    };

    if (loading) return <div className="text-center mt-8">Cargando usuarios...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h1>

            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handleCreateUserClick}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 flex items-center"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Crear Nuevo Usuario
                </button>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Puesto
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Departamento
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Región
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Acceso Activo
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Estado Org.
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{user.username}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{user.email}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{user.first_name} {user.last_name}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{user.puesto || 'N/A'}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {/* CAMBIADO: Usar user.departamento_name */}
                                    <p className="text-gray-900 whitespace-no-wrap">{user.departamento_name || 'N/A'}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {/* CAMBIADO: Usar user.region_name */}
                                    <p className="text-gray-900 whitespace-no-wrap">{user.region_name || 'N/A'}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{user.role_name || 'Sin Rol'}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button
                                        onClick={() => handleToggleIsActive(user.id, user.is_active)}
                                        className={`${
                                            user.is_active ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                                        } p-1 text-2xl`}
                                        title={user.is_active ? 'Deshabilitar acceso' : 'Habilitar acceso'}
                                    >
                                        <FontAwesomeIcon icon={user.is_active ? faToggleOn : faToggleOff} />
                                    </button>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span
                                        className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                                            user.status === 'Activo' ? 'text-green-900' :
                                            user.status === 'Inactivo' ? 'text-red-900' :
                                            'text-blue-900' // O el color que quieras para otros estados
                                        }`}
                                    >
                                        <span
                                            aria-hidden
                                            className={`absolute inset-0 opacity-50 rounded-full ${
                                                user.status === 'Activo' ? 'bg-green-200' :
                                                user.status === 'Inactivo' ? 'bg-red-200' :
                                                'bg-blue-200'
                                            }`}
                                        ></span>
                                        <span className="relative">{user.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleViewUserClick(user)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                            title="Ver Detalles"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button
                                            onClick={() => handleEditUserClick(user)}
                                            className="text-yellow-600 hover:text-yellow-900 p-1"
                                            title="Editar Usuario"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => handleChangePasswordClick(user)}
                                            className="text-purple-600 hover:text-purple-900 p-1"
                                            title="Cambiar Contraseña"
                                        >
                                            <FontAwesomeIcon icon={faKey} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modales */}
            <Modal show={showCreateModal} onClose={closeModal} title="Crear Nuevo Usuario">
                <UserForm onClose={closeModal} onSubmit={handleCreateUser} roles={roles} />
            </Modal>

            <Modal show={showEditModal} onClose={closeModal} title="Editar Usuario">
                <UserForm user={currentUser} onClose={closeModal} onSubmit={handleUpdateUser} roles={roles} />
            </Modal>

            <Modal show={showViewModal} onClose={closeModal} title="Detalles del Usuario">
                <UserDetail user={currentUser} onClose={closeModal} />
            </Modal>

            <Modal show={showChangePasswordModal} onClose={closeModal} title={`Cambiar Contraseña para ${currentUser?.username || ''}`}>
                {currentUser && <ChangePasswordForm userId={currentUser.id} onClose={closeModal} />}
            </Modal>
        </div>
    );
}

export default UserCrud;