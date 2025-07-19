// C:\Proyectos\ITAM_System\itam_frontend\src\context\AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setIsAuthenticated(false);
        setUser(null);
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
            await fetchUserDetails();

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

            await fetchUserDetails();

            toast.success('Inicio de sesión exitoso!');
            navigate('/home');
        } catch (err) {
            console.error('Login error:', err.response?.data || err);
            const errorMessage = err.response?.data?.detail || 'Error en las credenciales. Inténtalo de nuevo.';
            toast.error(errorMessage);
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialAuth = async () => {
            const storedAccessToken = localStorage.getItem('access_token');
            const storedRefreshToken = localStorage.getItem('refresh_token');

            if (storedAccessToken && storedRefreshToken) {
                try {
                    await updateToken();
                } catch (err) {
                    console.error("Error during initial token refresh:", err);
                }
            } else {
                setLoading(false);
            }
        };
        loadInitialAuth();

        const fourMinutes = 4 * 60 * 1000;
        const interval = setInterval(() => {
            if (localStorage.getItem('refresh_token')) {
                updateToken();
            }
        }, fourMinutes);

        return () => clearInterval(interval);
    }, [updateToken]);

    const authContextValue = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        fetchUserDetails,
    };

    if (loading) {
        return <div>Cargando autenticación...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);