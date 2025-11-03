/**
 * Contexto de Autenticación para el sistema ITAM - Frontend React.
 *
 * Gestiona el estado global de autenticación, incluyendo:
 * - Login/logout de usuarios
 * - Gestión automática de tokens JWT
 * - Verificación de permisos
 * - Estado de carga y navegación automática
 *
 * Proporciona un sistema completo de autenticación que se integra
 * con el backend Django y maneja automáticamente el refresh de tokens.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Librería para decodificar tokens JWT
import api from '../api'; // Cliente API configurado
import { toast } from 'react-toastify'; // Notificaciones al usuario
import { useNavigate } from 'react-router-dom'; // Navegación programática

// Creación del contexto de autenticación
const AuthContext = createContext();

/**
 * Proveedor del contexto de autenticación.
 *
 * Componente que envuelve la aplicación y proporciona el estado de autenticación
 * a todos los componentes hijos a través del contexto.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Estados principales de autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null); // Datos del usuario incluyendo flags de staff/superuser
    const [loading, setLoading] = useState(true);
    const [userPermissions, setUserPermissions] = useState(new Set()); // Set para búsquedas eficientes de permisos

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setIsAuthenticated(false);
        setUser(null);
        setUserPermissions(new Set());
        toast.info('Sesión cerrada.');
        navigate('/login');
    }, [navigate]);

    const fetchUserDetails = useCallback(async () => {
        try {
            const response = await api.get('/users/me/');
            const userData = response.data;
            localStorage.setItem('user_data', JSON.stringify(userData));
            
            // --- IMPORTANT: Ensure user state includes is_staff and is_superuser ---
            setUser({
                ...userData, // Spread existing user data
                is_staff: userData.is_staff, // Explicitly capture these flags
                is_superuser: userData.is_superuser,
            });
            // ----------------------------------------------------------------------
            
            setIsAuthenticated(true);

            // Extract and set user permissions from fetched user data
            if (Array.isArray(userData.user_permissions)) {
                setUserPermissions(new Set(userData.user_permissions));
            } else {
                setUserPermissions(new Set()); // No permissions or invalid format
            }
            return userData;
        } catch (err) {
            console.error("Error fetching user details:", err);
            logout();
            throw err;
        }
    }, [logout]);

    const updateToken = useCallback(async () => {
        const refresh_token = localStorage.getItem('refresh_token');
        //console.log('AuthContext: Attempting to update token. Refresh Token:', refresh_token ? refresh_token.substring(0, 30) + '...' : 'No refresh token');
        if (!refresh_token) {
            logout();
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/login/refresh/', { refresh: refresh_token });
            localStorage.setItem('access_token', response.data.access);
            //console.log('AuthContext: Token refreshed successfully. New Access Token:', response.data.access.substring(0, 30) + '...');
            await fetchUserDetails(); // Fetch user details and permissions after token refresh

        } catch (err) {
            console.error("Error refreshing token:", err);
            toast.error("Sesión expirada. Por favor, inicia sesión de nuevo.");
            logout();
        } finally {
            setLoading(false);
        }
    }, [logout, fetchUserDetails]);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const tokenResponse = await api.post('/login/', { username, password });
            const { access, refresh } = tokenResponse.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            //console.log('AuthContext: Login successful. Access Token:', access.substring(0, 30) + '...');
            //console.log('AuthContext: Refresh Token:', refresh.substring(0, 30) + '...');

            await fetchUserDetails(); // Fetch user details and permissions after successful login

            toast.success('Inicio de sesión exitoso!');
            navigate('/home');
        } catch (err) {
            console.error('Login error:', err.response?.data || err);
            const errorMessage = err.response?.data?.detail || 'Error en las credenciales. Inténtalo de nuevo.';
            toast.error(errorMessage);
            setIsAuthenticated(false);
            setUser(null);
            setUserPermissions(new Set());
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
        } finally {
            setLoading(false);
        }
    };

    // hasPermission function
    const hasPermission = useCallback((permissionCode) => {
        // Superusers always have all permissions
        if (user && user.is_superuser) {
            return true;
        }
        // Staff users (non-superusers) usually don't have all permissions unless specifically granted
        // If 'is_staff' grants specific permissions, they should be reflected in userPermissions.
        
        return userPermissions.has(permissionCode);
    }, [user, userPermissions]); // Added user to dependencies

    useEffect(() => {
        const loadInitialAuth = async () => {
            const storedAccessToken = localStorage.getItem('access_token');
            const storedRefreshToken = localStorage.getItem('refresh_token');
            const storedUserData = localStorage.getItem('user_data');

            if (storedAccessToken && storedRefreshToken) {
                try {
                    // Try to decode access token locally for quick check
                    const decodedToken = jwtDecode(storedAccessToken);
                    const currentTime = Date.now() / 1000;

                    if (decodedToken.exp > currentTime + 60) { // Token valid for more than 60 seconds
                        //console.log("AuthContext: Access token valid, attempting to use stored user data or fetch.");
                        if (storedUserData) {
                            const parsedUserData = JSON.parse(storedUserData);
                            setUser({
                                ...parsedUserData,
                                is_staff: parsedUserData.is_staff,
                                is_superuser: parsedUserData.is_superuser
                            });
                            setIsAuthenticated(true);
                            if (Array.isArray(parsedUserData.user_permissions)) {
                                setUserPermissions(new Set(parsedUserData.user_permissions));
                            } else {
                                setUserPermissions(new Set());
                            }
                            setLoading(false); // Set loading to false here
                        } else {
                            // If no stored user data, fetch it
                            await fetchUserDetails();
                            setLoading(false);
                        }
                    } else { // Token expired or expiring soon, try refreshing
                        //console.log("AuthContext: Access token expired or expiring, refreshing.");
                        await updateToken();
                    }
                } catch (err) {
                    console.error("Error during initial auth check or token decode:", err);
                    // If decoding fails or any other error, try to refresh
                    await updateToken();
                }
            } else {
                setLoading(false); // No tokens, not authenticated
            }
        };
        loadInitialAuth();

        // Interval for periodic token refresh (every 4 minutes as you had)
        const fourMinutes = 4 * 60 * 1000;
        const interval = setInterval(() => {
            if (localStorage.getItem('refresh_token') && isAuthenticated) { // Only refresh if refresh token exists and user is considered authenticated
                //console.log("AuthContext: Interval triggered token refresh.");
                updateToken();
            }
        }, fourMinutes);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [updateToken, fetchUserDetails, isAuthenticated]);

    const authContextValue = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        fetchUserDetails,
        hasPermission,
        userPermissions,
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-2xl text-gray-700">Cargando autenticación...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};