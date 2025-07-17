// src/components/UserForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Opciones para los campos de selección (deben coincidir con tus CHOICES en Django)
const PUESTO_CHOICES = [
  'Gerente', 'Coordinador', 'Analista', 'Técnico', 'Desarrollador', 'Soporte', 'Otro'
];
const DEPARTAMENTO_CHOICES = [
  'TI', 'Recursos Humanos', 'Finanzas', 'Marketing', 'Ventas', 'Operaciones', 'Otro'
];
const REGION_CHOICES = [
  'Norte', 'Centro', 'Sur', 'Este', 'Oeste', 'Nacional', 'Internacional', 'Otro'
];
const STATUS_CHOICES = [
  'Activo', 'Inactivo', 'Vacaciones', 'Licencia'
];


function UserForm({ user, onClose }) {
  // Si 'user' existe, estamos editando; de lo contrario, estamos creando.
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '', // Solo para creación o si quieres permitir cambiar la contraseña al editar
    first_name: '',
    last_name: '',
    puesto: '',
    departamento: '',
    region: '',
    status: 'Activo', // Valor por defecto
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Precargar datos si estamos editando
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // La contraseña no se precarga por seguridad
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        puesto: user.puesto || '',
        departamento: user.departamento || '',
        region: user.region || '',
        status: user.status || 'Activo',
      });
    }
  }, [isEditing, user]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login'); // Redirigir si no hay token
      return {};
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        // Eliminar password si está vacío y estamos editando, para no enviarlo innecesariamente
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password;
        }

        await axios.put(`${API_BASE_URL}/users/${user.id}/`, dataToSend, getAuthHeaders());
        alert('Usuario actualizado exitosamente!');
      } else {
        // Para creación, la contraseña es obligatoria.
        if (!formData.password) {
          setError('La contraseña es obligatoria para nuevos usuarios.');
          setLoading(false);
          return;
        }
        await axios.post(`${API_BASE_URL}/users/`, formData, getAuthHeaders());
        alert('Usuario creado exitosamente!');
      }
      onClose(); // Cierra el modal y refresca la lista de usuarios
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        localStorage.clear();
        navigate('/login');
      } else {
        const errorMsg = err.response?.data
          ? Object.values(err.response.data).flat().join(' ') // Extrae mensajes de error de Django
          : err.message;
        setError('Error: ' + errorMsg);
        console.error("Error submitting user form:", err.response || err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isEditing} // No permitir cambiar el username al editar
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo <span className="text-red-500">*</span></label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* La contraseña es obligatoria solo en la creación */}
      {!isEditing && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña <span className="text-red-500">*</span></label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditing}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
      {isEditing && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña (dejar vacío para no cambiar)</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
      )}

      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          name="first_name"
          id="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Apellido</label>
        <input
          type="text"
          name="last_name"
          id="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Selects para los nuevos campos */}
      <div>
        <label htmlFor="puesto" className="block text-sm font-medium text-gray-700">Puesto</label>
        <select
          name="puesto"
          id="puesto"
          value={formData.puesto}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecciona un puesto</option>
          {PUESTO_CHOICES.map(choice => (
            <option key={choice} value={choice}>{choice}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">Departamento</label>
        <select
          name="departamento"
          id="departamento"
          value={formData.departamento}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecciona un departamento</option>
          {DEPARTAMENTO_CHOICES.map(choice => (
            <option key={choice} value={choice}>{choice}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700">Región</label>
        <select
          name="region"
          id="region"
          value={formData.region}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecciona una región</option>
          {REGION_CHOICES.map(choice => (
            <option key={choice} value={choice}>{choice}</option>
          ))}
        </select>
      </div>

      {isEditing && ( // El status solo se puede cambiar al editar
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {STATUS_CHOICES.map(choice => (
              <option key={choice} value={choice}>{choice}</option>
            ))}
          </select>
        </div>
      )}


      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')}
        </button>
      </div>
    </form>
  );
}

export default UserForm;