import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await api.get('/auth/profile');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to load user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Attempting login...', { email });
            const response = await api.post('/auth/login', { email, password });
            console.log('Login response:', response.data);
            
            const { token: newToken, user: userData } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || error.message || 'Login failed' 
            };
        }
    };

    const register = async (username, email, password, role = 'user') => {
        try {
            const response = await api.post('/auth/register', { 
                username, 
                email, 
                password,
                role 
            });
            const { token: newToken, user: userData } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // RBAC Helper Functions
    const hasRole = (...roles) => {
        return user && roles.includes(user.role);
    };

    const canModify = () => {
        return user && (user.role === 'admin' || user.role === 'user');
    };

    const isReadOnly = () => {
        return user && user.role === 'read-only';
    };

    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    const isUser = () => {
        return user && user.role === 'user';
    };

    // Permission checks for specific actions
    const canCreateTransaction = () => canModify();
    const canEditTransaction = () => canModify();
    const canDeleteTransaction = () => canModify();
    const canViewAllUsers = () => isAdmin();
    const canManageUsers = () => isAdmin();
    const canViewSystemStats = () => isAdmin();

    // UI Helper functions
    const getRoleColor = () => {
        switch (user?.role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'user': return 'bg-blue-100 text-blue-800';
            case 'read-only': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleDisplayName = () => {
        switch (user?.role) {
            case 'admin': return 'Administrator';
            case 'user': return 'User';
            case 'read-only': return 'Read Only';
            default: return 'Unknown';
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        // Role checks
        hasRole,
        canModify,
        isReadOnly,
        isAdmin,
        isUser,
        // Permission checks
        canCreateTransaction,
        canEditTransaction,
        canDeleteTransaction,
        canViewAllUsers,
        canManageUsers,
        canViewSystemStats,
        // UI helpers
        getRoleColor,
        getRoleDisplayName,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};