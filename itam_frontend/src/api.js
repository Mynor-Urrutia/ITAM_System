// C:\Proyectos\ITAM_System\itam_frontend\src\api.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Make sure you have jwt-decode installed

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Your Django API base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token'); // Make sure this key matches
        console.log('API Interceptor: Access Token from localStorage:', accessToken ? accessToken.substring(0, 30) + '...' : 'No token'); // Log del token (parcial)
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If the error is 401 Unauthorized and it's not a login/refresh request
        // and we haven't tried to refresh yet for this request
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried
            const refreshToken = localStorage.getItem('refresh_token'); // Make sure this key matches

            if (refreshToken) {
                try {
                    const response = await axios.post('http://127.0.0.1:8000/api/login/refresh/', {
                        refresh: refreshToken,
                    });
                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);

                    // Update the original request's header with the new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest); // Retry the original request with the new token
                } catch (refreshError) {
                    // If refreshing fails, clear tokens and redirect to login
                    console.error('Token refresh failed:', refreshError);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_data'); // Clear user data as well
                    window.location.href = '/login'; // Redirect to login page
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// --- Funciones para la gestión de Regiones (ya deberían existir) ---
// Si no las tienes en este archivo, puedes añadirlas aquí o en otro archivo de servicios
export const getRegions = () => api.get('masterdata/regions/');
export const createRegion = (regionData) => api.post('masterdata/regions/', regionData);
export const updateRegion = (id, regionData) => api.put(`masterdata/regions/${id}/`, regionData);
export const deleteRegion = (id) => api.delete(`masterdata/regions/${id}/`);

// --- ¡NUEVAS FUNCIONES PARA DEPARTAMENTOS! ---
export const getDepartamentos = () => api.get('masterdata/departamentos/');
export const createDepartamento = (departamentoData) => api.post('masterdata/departamentos/', departamentoData);
export const updateDepartamento = (id, departamentoData) => api.put(`masterdata/departamentos/${id}/`, departamentoData);
export const deleteDepartamento = (id) => api.delete(`masterdata/departamentos/${id}/`);

// --- ¡NUEVAS FUNCIONES PARA ÁREAS! ---
export const getAreas = () => api.get('masterdata/areas/');
export const createArea = (areaData) => api.post('masterdata/areas/', areaData);
export const updateArea = (id, areaData) => api.put(`masterdata/areas/${id}/`, areaData);
export const deleteArea = (id) => api.delete(`masterdata/areas/${id}/`);

export default api;