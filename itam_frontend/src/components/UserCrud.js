// src/components/UserCrud.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import Modal from './Modal';
import UserForm from './UserForm';
import UserDetail from './UserDetail';
import ChangePasswordForm from './ChangePasswordForm';

// Importa los componentes de Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, // Para crear
  faEye, // Para ver
  faEdit, // Para editar
  faKey, // Para cambiar contraseña
  faToggleOn, faToggleOff // Para habilitar/deshabilitar
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function UserCrud() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return {};
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/`, getAuthHeaders());
      setUsers(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Error al cargar usuarios: ' + (err.response?.data?.detail || err.message));
        console.error("Error fetching users:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUserClick = () => {
    setCurrentUser(null);
    setShowCreateModal(true);
  };

  const handleEditUserClick = (user) => {
    setCurrentUser(user);
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
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    if (!window.confirm(`¿Estás seguro de que quieres cambiar el estado del usuario a "${newStatus}"?`)) {
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/users/${userId}/`, { status: newStatus }, getAuthHeaders());
      alert(`Estado del usuario actualizado a ${newStatus}.`);
      fetchUsers();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Error al actualizar el estado: ' + (err.response?.data?.status || err.message));
        console.error("Error updating user status:", err);
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
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> {/* Icono de más */}
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
                Estado
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
                  <p className="text-gray-900 whitespace-no-wrap">{user.departamento || 'N/A'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{user.region || 'N/A'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      user.status === 'Activo' ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 opacity-50 rounded-full ${
                        user.status === 'Activo' ? 'bg-green-200' : 'bg-red-200'
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
                      <FontAwesomeIcon icon={faEye} /> {/* Icono de ver */}
                    </button>
                    <button
                      onClick={() => handleEditUserClick(user)}
                      className="text-yellow-600 hover:text-yellow-900 p-1"
                      title="Editar Usuario"
                    >
                      <FontAwesomeIcon icon={faEdit} /> {/* Icono de editar */}
                    </button>
                    <button
                      onClick={() => handleChangePasswordClick(user)}
                      className="text-purple-600 hover:text-purple-900 p-1"
                      title="Cambiar Contraseña"
                    >
                      <FontAwesomeIcon icon={faKey} /> {/* Icono de llave/contraseña */}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`${
                        user.status === 'Activo' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      } p-1`}
                      title={user.status === 'Activo' ? 'Deshabilitar' : 'Habilitar'}
                    >
                      <FontAwesomeIcon icon={user.status === 'Activo' ? faToggleOff : faToggleOn} /> {/* Iconos de toggle */}
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
        <UserForm onClose={closeModal} />
      </Modal>

      <Modal show={showEditModal} onClose={closeModal} title="Editar Usuario">
        <UserForm user={currentUser} onClose={closeModal} />
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