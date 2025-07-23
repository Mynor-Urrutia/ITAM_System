// C:\Proyectos\ITAM_System\itam_frontend\src\axiosConfig.js
import axios from 'axios';
// Asegúrate de definir BASE_API_URL en config.js, ej: export const BASE_API_URL = 'http://localhost:8000/api/';
import { BASE_API_URL } from './config'; 

const instance = axios.create({
    baseURL: BASE_API_URL, 
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token a las peticiones
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

// Opcional: Interceptor para manejar errores 401/403 globalmente
// instance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//             // Aquí podrías redirigir al login, refrescar tokens, etc.
//             console.error("Error de autenticación/autorización:", error.response.status);
//             // Puedes usar toastify aquí también: toast.error("Sesión expirada o acceso denegado.");
//         }
//         return Promise.reject(error);
//     }
// );

export default instance;