// C:\Proyectos\ITAM_System\itam_frontend\src\context\AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Keep this, though we're mostly using /users/me/ now for data
import api from '../api'; // Your custom axios instance
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // NEW: State to store user permissions as a Set for efficient lookups
    const [userPermissions, setUserPermissions] = useState(new Set());

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setIsAuthenticated(false);
        setUser(null);
        // NEW: Clear permissions on logout
        setUserPermissions(new Set());
        toast.info('Sesión cerrada.');
        navigate('/login');
    }, [navigate]);

    const fetchUserDetails = useCallback(async () => {
        try {
            const response = await api.get('/users/me/');
            const userData = response.data;
            localStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);

            // NEW: Extract and set user permissions from fetched user data
            if (Array.isArray(userData.user_permissions)) { // Assuming 'user_permissions' field from /users/me/
                setUserPermissions(new Set(userData.user_permissions));
            } else if (Array.isArray(userData.permissions)) { // Fallback if your field is named 'permissions'
                 setUserPermissions(new Set(userData.permissions));
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
        console.log('AuthContext: Attempting to update token. Refresh Token:', refresh_token ? refresh_token.substring(0, 30) + '...' : 'No refresh token');
        if (!refresh_token) {
            logout();
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/login/refresh/', { refresh: refresh_token });
            localStorage.setItem('access_token', response.data.access);
            console.log('AuthContext: Token refreshed successfully. New Access Token:', response.data.access.substring(0, 30) + '...');
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

            console.log('AuthContext: Login successful. Access Token:', access.substring(0, 30) + '...');
            console.log('AuthContext: Refresh Token:', refresh.substring(0, 30) + '...');

            await fetchUserDetails(); // Fetch user details and permissions after successful login

            toast.success('Inicio de sesión exitoso!');
            navigate('/home');
        } catch (err) {
            console.error('Login error:', err.response?.data || err);
            const errorMessage = err.response?.data?.detail || 'Error en las credenciales. Inténtalo de nuevo.';
            toast.error(errorMessage);
            setIsAuthenticated(false);
            setUser(null);
            // NEW: Clear permissions on login failure
            setUserPermissions(new Set());
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
        } finally {
            setLoading(false);
        }
    };

    // NEW: hasPermission function
    const hasPermission = useCallback((permissionCode) => {
        // console.log("Checking permission:", permissionCode, "User permissions:", Array.from(userPermissions)); // For debugging
        return userPermissions.has(permissionCode);
    }, [userPermissions]);

    useEffect(() => {
        const loadInitialAuth = async () => {
            const storedAccessToken = localStorage.getItem('access_token');
            const storedRefreshToken = localStorage.getItem('refresh_token');

            if (storedAccessToken && storedRefreshToken) {
                try {
                    // Attempt to fetch user details first if access token seems valid
                    // This avoids a refresh cycle if the access token is still good
                    const decodedToken = jwtDecode(storedAccessToken);
                    const currentTime = Date.now() / 1000;

                    if (decodedToken.exp > currentTime + 60) { // Token valid for more than 60 seconds
                        console.log("AuthContext: Access token valid, fetching user details.");
                        await fetchUserDetails();
                        setLoading(false); // Set loading to false here if valid
                    } else { // Token expired or expiring soon, try refreshing
                        console.log("AuthContext: Access token expired or expiring, refreshing.");
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
                console.log("AuthContext: Interval triggered token refresh.");
                updateToken();
            }
        }, fourMinutes);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [updateToken, fetchUserDetails, isAuthenticated]); // Added isAuthenticated to dependencies

    const authContextValue = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        fetchUserDetails,
        hasPermission, // NEW: Expose hasPermission
        userPermissions, // Optional: expose for debugging or display
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