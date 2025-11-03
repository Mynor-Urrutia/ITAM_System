/**
 * Configuración alternativa de Axios para el sistema ITAM.
 *
 * Esta instancia de Axios es una alternativa a la configuración en api.js.
 * Puede usarse para peticiones específicas que requieran configuración diferente.
 * Actualmente incluye configuración básica de autenticación.
 *
 * Características principales:
 * - Timeout de 5 segundos para evitar peticiones colgadas
 * - Headers por defecto para JSON
 * - Interceptor de requests para tokens JWT
 * - Interceptor de responses comentado (puede activarse si es necesario)
 * - Configuración independiente de la instancia principal en api.js
 */

import axios from 'axios';
import { BASE_API_URL } from './config';

/**
 * Instancia de Axios con configuración personalizada.
 * Incluye timeout de 5 segundos y headers por defecto.
 */
const instance = axios.create({
    baseURL: BASE_API_URL,
    timeout: 5000, // Timeout de 5 segundos para todas las peticiones
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor de requests: añade automáticamente el token JWT a las peticiones.
 * Similar al interceptor en api.js pero para esta instancia específica.
 */
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor de responses (comentado): manejo opcional de errores 401/403.
 * Puede activarse para manejar errores de autenticación globalmente.
 * Actualmente desactivado para evitar conflictos con el manejo en api.js.
 */
// instance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//             console.error("Error de autenticación/autorización:", error.response.status);
//             // Podría integrarse con toastify para mostrar mensajes al usuario
//         }
//         return Promise.reject(error);
//     }
// );

export default instance;