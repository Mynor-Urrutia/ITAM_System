import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getUsers, getRoles, createUser, updateUser, changeUserPassword } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

import Modal from './Modal';
import UserForm from './UserForm';
import UserDetail from './UserDetail';
import ChangePasswordForm from './ChangePasswordForm';
import Pagination from './Pagination';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEye,
    faEdit,
    faKey
} from '@fortawesome/free-solid-svg-icons';

function UserCrud() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]); // Estado para almacenar los roles
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSizeOptions = [5, 10, 25, 50, 100, 200];

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const { user: loggedInUser, fetchUserDetails, hasPermission } = useAuth();

    const canAddUser = hasPermission('users.add_customuser');
    const canChangeUser = hasPermission('users.change_customuser');
    const canDeleteUser = hasPermission('users.delete_customuser');

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: currentPage,
                page_size: pageSize
            };
            const response = await getUsers(params);
            setUsers(response.data.results || response.data);
            setTotalPages(Math.ceil((response.data.count || response.data.length) / pageSize));
            setTotalCount(response.data.count || response.data.length);
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
    };

    // Función para obtener la lista de roles
    const fetchRoles = async () => {
        try {
            const response = await getRoles();
            setRoles(response.data.results || response.data);
        } catch (err) {
            console.error("Error fetching roles:", err);
            toast.error('Error al cargar los roles.');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [currentPage, pageSize]);

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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
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
            const payload = { ...newUserData };
            // assigned_role_ids ya es un array
            payload.assigned_role_ids = payload.assigned_role_ids || [];

            const response = await createUser(payload);
            toast.success('Usuario creado exitosamente!');
            fetchUsers(); // Refresh the list instead of manually updating
            setShowCreateModal(false);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(' ') || 'Error al crear el usuario.';
            toast.error(`Error al crear el usuario: ${errorMsg}`);
            console.error("Error creating user:", err.response || err);
        }
    };

    const handleUpdateUser = async (updatedUserData) => {
        try {
            const payload = { ...updatedUserData };
            // assigned_role_ids ya es un array
            payload.assigned_role_ids = payload.assigned_role_ids || [];

            const response = await updateUser(updatedUserData.id, payload);
            toast.success('Usuario actualizado exitosamente!');
            fetchUsers(); // Refresh the list instead of manually updating
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


    if (loading) return <div className="text-center mt-8">Cargando usuarios...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Usuarios</h1>

            <div className="flex justify-end mb-4">
                {canAddUser && (
                    <button
                        onClick={handleCreateUserClick}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Crear Nuevo Usuario
                    </button>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Puesto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Departamento
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Región
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Roles
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado Org.
                            </th>
                            {(canChangeUser) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeUser) ? 9 : 8} className="px-6 py-4 text-center text-gray-500">
                                    No hay usuarios disponibles.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.first_name} {user.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.puesto || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.departamento_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.region_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.role_names && user.role_names.length > 0 ? user.role_names.join(', ') : 'Sin Roles'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span
                                            className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                                                user.status === 'Activo' ? 'text-green-900' :
                                                user.status === 'Inactivo' ? 'text-red-900' :
                                                'text-blue-900'
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
                                    {canChangeUser && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => handleViewUserClick(user)}
                                                className="text-blue-600 hover:text-blue-900 p-2"
                                                title="Ver Detalles"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button
                                                onClick={() => handleEditUserClick(user)}
                                                className="text-indigo-600 hover:text-indigo-900 p-2"
                                                title="Editar Usuario"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                onClick={() => handleChangePasswordClick(user)}
                                                className="text-purple-600 hover:text-purple-900 p-2 ml-2"
                                                title="Cambiar Contraseña"
                                            >
                                                <FontAwesomeIcon icon={faKey} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Component */}
            {totalCount > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    pageSizeOptions={pageSizeOptions}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

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