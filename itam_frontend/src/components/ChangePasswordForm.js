/**
 * Componente de formulario para cambio de contraseña de usuarios.
 *
 * Permite a los usuarios cambiar su contraseña con validaciones de seguridad
 * y confirmación. Incluye indicadores visuales de visibilidad de contraseña
 * y manejo completo de errores.
 *
 * Características principales:
 * - Validación de fortaleza de contraseña (8+ caracteres, mayúsculas, minúsculas, números, especiales)
 * - Confirmación de contraseña coincidente
 * - Indicadores visuales para mostrar/ocultar contraseñas
 * - Manejo de errores con mensajes específicos
 * - Redirección automática en caso de sesión expirada
 * - Estados de carga durante el envío
 */

import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ChangePasswordForm({ userId, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Estado para confirmPassword
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!hasUpperCase) {
      return 'La contraseña debe contener al menos una letra mayúscula.';
    }
    if (!hasLowerCase) {
      return 'La contraseña debe contener al menos una letra minúscula.';
    }
    if (!hasNumbers) {
      return 'La contraseña debe contener al menos un número.';
    }
    if (!hasSpecialChar) {
      return 'La contraseña debe contener al menos un carácter especial.';
    }
    return null;
  };

  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Debe ingresar su contraseña actual.');
      toast.error('Debe ingresar su contraseña actual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      setError(strengthError);
      toast.error(strengthError);
      return;
    }

    setLoading(true);
    try {
      await api.post(
        `/users/${userId}/change-password/`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_new_password: confirmPassword,
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

      <div className="relative">
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
        <input
          type={showCurrentPassword ? "text" : "password"}
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 mt-1"
        >
          {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <div className="relative">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
        <input
          type={showNewPassword ? "text" : "password"}
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 mt-1"
        >
          {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <div className="relative">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 mt-1"
        >
          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
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