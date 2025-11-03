/**
 * Componente de Login del sistema ITAM.
 *
 * Maneja la autenticación de usuarios mediante formulario de credenciales:
 * - Formulario de usuario y contraseña con validación
 * - Integración con AuthContext para gestión de estado de autenticación
 * - Navegación automática después del login exitoso
 * - Manejo de errores con notificaciones toast
 * - Diseño responsivo con gradiente de fondo
 *
 * Características principales:
 * - Validación de campos requeridos
 * - Estados de carga manejados por AuthContext
 * - Notificaciones de error automáticas
 * - Navegación programática post-login
 * - Diseño moderno con Tailwind CSS
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ¡Importa useAuth!
import { toast } from 'react-toastify'; // Importa toast para notificaciones

/**
 * Componente funcional que renderiza el formulario de login.
 * Utiliza el hook useAuth para acceder a la función de login
 * y manejar el estado de autenticación global.
 */
const Login = () => { // Ya no recibe 'onLogin' como prop
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // No necesitamos 'error' o 'loading' aquí, AuthContext los maneja
    // const [error, setError] = useState('');
    // const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Obtén la función 'login' del contexto

    const handleSubmit = async (e) => {
        e.preventDefault();
        // La función 'login' del AuthContext se encarga de la llamada API,
        // guardar tokens, obtener datos del usuario y la navegación.
        try {
            await login(username, password);
            // Si el login es exitoso, la navegación ya se maneja en AuthContext
        } catch (err) {
            // El AuthContext ya debería mostrar un toast.error si falla el login.
            // Puedes dejar un console.error aquí para depuración si lo deseas.
            console.error("Login attempt failed:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>
                {/* El manejo de errores ahora lo hará Toastify a través de AuthContext */}
                {/* {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )} */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario:</label>
                        <input
                            type="text"
                            id="username"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        // 'loading' ya no se define aquí, el botón siempre está habilitado
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;