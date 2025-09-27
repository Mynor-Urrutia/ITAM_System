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
export const getRegions = (params = {}) => api.get('masterdata/regions/', { params });
export const createRegion = (regionData) => api.post('masterdata/regions/', regionData);
export const updateRegion = (id, regionData) => api.put(`masterdata/regions/${id}/`, regionData);
export const deleteRegion = (id) => api.delete(`masterdata/regions/${id}/`);

// --- Funciones para la gestión de Fincas ---
export const getFincas = (params = {}) => api.get('masterdata/fincas/', { params });
export const createFinca = (fincaData) => api.post('masterdata/fincas/', fincaData);
export const updateFinca = (id, fincaData) => api.put(`masterdata/fincas/${id}/`, fincaData);
export const deleteFinca = (id) => api.delete(`masterdata/fincas/${id}/`);

// --- ¡NUEVAS FUNCIONES PARA DEPARTAMENTOS! ---
export const getDepartamentos = (params = {}) => api.get('masterdata/departamentos/', { params });
export const createDepartamento = (departamentoData) => api.post('masterdata/departamentos/', departamentoData);
export const updateDepartamento = (id, departamentoData) => api.put(`masterdata/departamentos/${id}/`, departamentoData);
export const deleteDepartamento = (id) => api.delete(`masterdata/departamentos/${id}/`);

// --- ¡NUEVAS FUNCIONES PARA ÁREAS! ---
export const getAreas = (params = {}) => api.get('masterdata/areas/', { params });
export const createArea = (areaData) => api.post('masterdata/areas/', areaData);
export const updateArea = (id, areaData) => api.put(`masterdata/areas/${id}/`, areaData);
export const deleteArea = (id) => api.delete(`masterdata/areas/${id}/`);

// --- Funciones para la gestión de Tipos de Activos ---
export const getTiposActivos = (params = {}) => api.get('masterdata/tipos-activos/', { params });
export const createTipoActivo = (tipoActivoData) => api.post('masterdata/tipos-activos/', tipoActivoData);
export const updateTipoActivo = (id, tipoActivoData) => api.put(`masterdata/tipos-activos/${id}/`, tipoActivoData);
export const deleteTipoActivo = (id) => api.delete(`masterdata/tipos-activos/${id}/`);

// Marcas
export const getMarcas = (params = {}) => api.get('/masterdata/marcas/', { params });
export const createMarca = (data) => api.post('/masterdata/marcas/', data);
export const updateMarca = (id, data) => api.put(`/masterdata/marcas/${id}/`, data);
export const deleteMarca = (id) => api.delete(`/masterdata/marcas/${id}/`);

// --- Funciones para la gestión de Modelos de Activos ---
export const getModelosActivo = (params = {}) => api.get('/masterdata/modelos-activo/', { params });
export const createModeloActivo = (data) => api.post('/masterdata/modelos-activo/', data);
export const updateModeloActivo = (id, data) => api.put(`/masterdata/modelos-activo/${id}/`, data);
export const deleteModeloActivo = (id) => api.delete(`/masterdata/modelos-activo/${id}/`);

// --- Funciones para la gestión de Usuarios ---
export const getUsers = (params = {}) => api.get('/users/', { params });
export const createUser = (userData) => api.post('/users/', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}/`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}/`);
export const getCurrentUser = () => api.get('/users/me/');
export const changeUserPassword = (id, passwordData) => api.post(`/users/${id}/change-password/`, passwordData);

// --- Funciones para la gestión de Roles ---
export const getRoles = (params = {}) => api.get('/roles/', { params });
export const createRole = (roleData) => api.post('/roles/', roleData);
export const updateRole = (id, roleData) => api.put(`/roles/${id}/`, roleData);
export const deleteRole = (id) => api.delete(`/roles/${id}/`);

// --- Funciones para la gestión de Permisos ---
export const getPermissions = (params = {}) => api.get('/permissions/', { params });

// --- Funciones para la gestión de Audit Logs ---
export const getAuditLogs = (params = {}) => api.get('/masterdata/audit-logs/', { params });

export default api;