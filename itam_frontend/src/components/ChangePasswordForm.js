// src/components/ChangePasswordForm.js
import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ChangePasswordForm({ userId, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Estado para confirmPassword
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.post(
        `/users/${userId}/change-password/`,
        {
          new_password: newPassword,
          confirm_new_password: confirmPassword, // <-- ¡Añade este campo!
        }
      );
      toast.success('Contraseña actualizada exitosamente.');
      onClose();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        toast.error('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
        localStorage.clear();
        navigate('/login');
      } else if (err.response && err.response.data) {
        const errorMsg = err.response.data.detail || Object.values(err.response.data).flat().join(' ');
        setError(errorMsg);
        toast.error('Error al cambiar la contraseña: ' + errorMsg);
      } else {
        setError('Error al cambiar la contraseña. Inténtalo de nuevo.');
        toast.error('Error al cambiar la contraseña. Inténtalo de nuevo.');
      }
      console.error("Error changing password:", err.response || err);
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
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

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
          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordForm;