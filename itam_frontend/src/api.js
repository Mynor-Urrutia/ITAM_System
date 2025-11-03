/**
 * API Client para el sistema ITAM - Frontend React
 *
 * Este archivo centraliza todas las llamadas HTTP al backend Django,
 * incluyendo configuración de interceptores para autenticación JWT,
 * manejo automático de refresh tokens y funciones específicas para
 * cada módulo del sistema (usuarios, empleados, activos, datos maestros).
 *
 * Características principales:
 * - Interceptor de requests para añadir tokens JWT automáticamente
 * - Interceptor de responses para refresh automático de tokens
 * - Funciones organizadas por módulo para todas las operaciones CRUD
 * - Manejo de archivos (multipart/form-data) para uploads
 * - Configuración dinámica de URL base
 * - Documentación completa de todas las funciones disponibles
 * - Manejo de errores consistente con toast notifications
 */

import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Librería para decodificar tokens JWT

/**
 * Obtiene la URL base de la API de forma dinámica.
 * En desarrollo usa proxy, en producción puede configurarse dinámicamente.
 */
const getApiBaseUrl = () => {
    // Opción comentada para desarrollo dinámico basado en hostname
    // const currentHost = window.location.hostname;
    // const protocol = window.location.protocol;
    // return `${protocol}//${currentHost}:8000/api/`;

    // URL relativa que funciona con el proxy configurado en package.json
    return '/api/';
};

/**
 * Instancia principal de Axios configurada para el sistema ITAM.
 * Incluye configuración base y headers por defecto.
 */
const api = axios.create({
    baseURL: getApiBaseUrl(), // URL base dinámica de la API Django
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor de requests: añade automáticamente el token JWT a todas las peticiones.
 * Busca el token en localStorage y lo incluye en el header Authorization.
 */
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token');
        // Log comentado para debugging (descomentar si es necesario)
        // console.log('API Interceptor: Access Token from localStorage:', accessToken ? accessToken.substring(0, 30) + '...' : 'No token');

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor de responses: maneja automáticamente el refresh de tokens JWT.
 *
 * Cuando una petición recibe 401 Unauthorized, intenta refrescar el token
 * automáticamente y reintenta la petición original. Si falla, redirige al login.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Verifica si es error 401, no es petición de login/refresh, y no se ha reintentado
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Marca como reintentada para evitar loops
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Endpoint específico para refresh (no usa interceptor para evitar loop)
                    const refreshUrl = '/api/login/refresh/';
                    const response = await axios.post(refreshUrl, {
                        refresh: refreshToken,
                    });

                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);

                    // Actualiza el header de la petición original con el nuevo token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest); // Reintenta la petición original

                } catch (refreshError) {
                    // Si el refresh falla, limpia tokens y redirige a login
                    console.error('Token refresh failed:', refreshError);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No hay refresh token disponible, redirige a login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ==========================================
// FUNCIONES PARA GESTIÓN DE DATOS MAESTROS
// ==========================================

/**
 * Funciones CRUD para la gestión de Regiones geográficas.
 * Las regiones son la división territorial más alta del sistema.
 */
export const getRegions = (params = {}) => api.get('masterdata/regions/', { params });
export const createRegion = (regionData) => api.post('masterdata/regions/', regionData);
export const updateRegion = (id, regionData) => api.put(`masterdata/regions/${id}/`, regionData);
export const deleteRegion = (id) => api.delete(`masterdata/regions/${id}/`);

/**
 * Funciones CRUD para la gestión de Fincas agrícolas.
 * Las fincas pertenecen a regiones y contienen empleados y activos.
 */
export const getFincas = (params = {}) => api.get('masterdata/fincas/', { params });
export const createFinca = (fincaData) => api.post('masterdata/fincas/', fincaData);
export const updateFinca = (id, fincaData) => api.put(`masterdata/fincas/${id}/`, fincaData);
export const deleteFinca = (id) => api.delete(`masterdata/fincas/${id}/`);

/**
 * Funciones CRUD para la gestión de Departamentos organizacionales.
 * Los departamentos son la división funcional de la organización.
 */
export const getDepartamentos = (params = {}) => api.get('masterdata/departamentos/', { params });
export const createDepartamento = (departamentoData) => api.post('masterdata/departamentos/', departamentoData);
export const updateDepartamento = (id, departamentoData) => api.put(`masterdata/departamentos/${id}/`, departamentoData);
export const deleteDepartamento = (id) => api.delete(`masterdata/departamentos/${id}/`);

/**
 * Funciones CRUD para la gestión de Áreas dentro de departamentos.
 * Las áreas son la subdivisión más granular de la organización.
 */
export const getAreas = (params = {}) => api.get('masterdata/areas/', { params });
export const createArea = (areaData) => api.post('masterdata/areas/', areaData);
export const updateArea = (id, areaData) => api.put(`masterdata/areas/${id}/`, areaData);
export const deleteArea = (id) => api.delete(`masterdata/areas/${id}/`);

/**
 * Funciones CRUD para la gestión de Tipos de Activos tecnológicos.
 * Clasifican los equipos en categorías (computadora, red, periférico, etc.).
 */
export const getTiposActivos = (params = {}) => api.get('masterdata/tipos-activos/', { params });
export const createTipoActivo = (tipoActivoData) => api.post('masterdata/tipos-activos/', tipoActivoData);
export const updateTipoActivo = (id, tipoActivoData) => api.put(`masterdata/tipos-activos/${id}/`, tipoActivoData);
export const deleteTipoActivo = (id) => api.delete(`masterdata/tipos-activos/${id}/`);

/**
 * Funciones CRUD para la gestión de Marcas de equipos.
 * Las marcas agrupan modelos de diferentes tipos de activos.
 */
export const getMarcas = (params = {}) => api.get('masterdata/marcas/', { params });
export const createMarca = (data) => api.post('masterdata/marcas/', data);
export const updateMarca = (id, data) => api.put(`masterdata/marcas/${id}/`, data);
export const deleteMarca = (id) => api.delete(`masterdata/marcas/${id}/`);

/**
 * Funciones CRUD para la gestión de Modelos de Activos.
 * Los modelos contienen especificaciones técnicas detalladas por tipo de activo.
 */
export const getModelosActivo = (params = {}) => api.get('masterdata/modelos-activo/', { params });
export const createModeloActivo = (data) => api.post('masterdata/modelos-activo/', data);
export const updateModeloActivo = (id, data) => api.put(`masterdata/modelos-activo/${id}/`, data);
export const deleteModeloActivo = (id) => api.delete(`masterdata/modelos-activo/${id}/`);

/**
 * Funciones CRUD para la gestión de Proveedores de equipos.
 * Contienen información de contacto para soporte y garantías.
 */
export const getProveedores = (params = {}) => api.get('masterdata/proveedores/', { params });
export const createProveedor = (data) => api.post('masterdata/proveedores/', data);
export const updateProveedor = (id, data) => api.put(`masterdata/proveedores/${id}/`, data);
export const deleteProveedor = (id) => api.delete(`masterdata/proveedores/${id}/`);

// ==========================================
// FUNCIONES PARA GESTIÓN DE USUARIOS Y ROLES
// ==========================================

/**
 * Funciones CRUD para la gestión de Usuarios del sistema.
 * Incluye operaciones de perfil y cambio de contraseña.
 */
export const getUsers = (params = {}) => api.get('users/', { params });
export const createUser = (userData) => api.post('users/', userData);
export const updateUser = (id, userData) => api.put(`users/${id}/`, userData);
export const deleteUser = (id) => api.delete(`users/${id}/`);
export const getCurrentUser = () => api.get('users/me/');
export const changeUserPassword = (id, passwordData) => api.post(`users/${id}/change-password/`, passwordData);

/**
 * Funciones CRUD para la gestión de Roles (Grupos de Django).
 * Los roles contienen permisos que se asignan a usuarios.
 */
export const getRoles = (params = {}) => api.get('roles/', { params });
export const createRole = (roleData) => api.post('roles/', roleData);
export const updateRole = (id, roleData) => api.put(`roles/${id}/`, roleData);
export const deleteRole = (id) => api.delete(`roles/${id}/`);

/**
 * Funciones para obtener la lista de permisos disponibles en el sistema.
 * Los permisos se asignan a roles y determinan las acciones permitidas.
 */
export const getPermissions = (params = {}) => api.get('permissions/', { params });

// ==========================================
// FUNCIONES PARA GESTIÓN DE ACTIVOS
// ==========================================

/**
 * Funciones CRUD para la gestión de Activos tecnológicos.
 * Incluye operaciones especiales como retiro y reactivación de equipos.
 */
export const getActivos = (params = {}) => api.get('assets/activos/', { params });
export const createActivo = (activoData) => api.post('assets/activos/', activoData);
export const updateActivo = (id, activoData) => api.put(`assets/activos/${id}/`, activoData);
export const deleteActivo = (id) => api.delete(`assets/activos/${id}/`);

/**
 * Operaciones especiales para retiro de activos.
 * Soporta subida de documentos justificativos (multipart/form-data).
 */
export const retireActivo = (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return api.post(`assets/activos/${id}/retire/`, data, config);
};
export const reactivateActivo = (id) => api.post(`assets/activos/${id}/reactivate/`);

/**
 * Funciones CRUD para la gestión de Mantenimientos de activos.
 * Soporta subida de archivos adjuntos (multipart/form-data).
 */
export const getMaintenances = (params = {}) => api.get('assets/maintenances/', { params });
export const getMaintenance = (id) => api.get(`assets/maintenances/${id}/`);
export const createMaintenance = (maintenanceData) => {
    const config = maintenanceData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return api.post('assets/maintenances/', maintenanceData, config);
};
export const updateMaintenance = (id, maintenanceData) => api.put(`assets/maintenances/${id}/`, maintenanceData);
export const deleteMaintenance = (id) => api.delete(`assets/maintenances/${id}/`);

// ==========================================
// FUNCIONES PARA DASHBOARD Y REPORTES
// ==========================================

/**
 * Funciones para obtener datos del dashboard principal.
 * Incluyen estadísticas, gráficos y listados detallados.
 */
export const getDashboardData = () => api.get('assets/dashboard/');
export const getDashboardModelsData = () => api.get('assets/dashboard-models/');
export const getDashboardWarrantyData = () => api.get('assets/dashboard-warranty/');
export const getDashboardSummary = () => api.get('assets/dashboard-summary/');
export const getDashboardDetailData = (category, ordering = 'serie', page = 1, pageSize = 10) =>
  api.get(`assets/dashboard-detail/?category=${category}&ordering=${ordering}&page=${page}&page_size=${pageSize}`);
export const getMaintenanceOverview = (params = {}) => api.get('assets/maintenance-overview/', { params });

/**
 * Funciones para consultar los logs de auditoría del sistema.
 * Registra todas las operaciones realizadas por usuarios.
 */
export const getAuditLogs = (params = {}) => api.get('masterdata/audit-logs/', { params });

// ==========================================
// FUNCIONES PARA GESTIÓN DE EMPLEADOS
// ==========================================

/**
 * Funciones CRUD para la gestión de Empleados.
 * Los empleados pueden ser asignados a usuarios del sistema.
 */
export const getEmployees = (params = {}) => api.get('employees/employees/', { params });
export const createEmployee = (employeeData, config = {}) => api.post('employees/employees/', employeeData, config);
export const updateEmployee = (id, employeeData, config = {}) => api.put(`employees/employees/${id}/`, employeeData, config);
export const deleteEmployee = (id) => api.delete(`employees/employees/${id}/`);

// ==========================================
// FUNCIONES PARA GESTIÓN DE ASIGNACIONES
// ==========================================

/**
 * Funciones CRUD para la gestión de Asignaciones de activos a empleados.
 * Incluye operaciones especiales como devolución y asignación masiva.
 */
export const getAssignments = (params = {}) => api.get('assets/assignments/', { params });
export const getAssignment = (id) => api.get(`assets/assignments/${id}/`);
export const createAssignment = (assignmentData) => api.post('assets/assignments/', assignmentData);
export const updateAssignment = (id, assignmentData) => api.put(`assets/assignments/${id}/`, assignmentData);
export const deleteAssignment = (id) => api.delete(`assets/assignments/${id}/`);
export const returnAssignment = (id, returnData) => api.post(`assets/assignments/${id}/return_assignment/`, returnData);
export const getAvailableAssets = (params = {}) => api.get('assets/assignments/available_assets/', { params });
export const bulkAssignAssets = (assignmentData) => api.post('assets/assignments/bulk_assign/', assignmentData);

export default api;
