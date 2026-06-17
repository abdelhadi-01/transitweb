'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log('🔑 Token trouvé dans localStorage');
            fetchUser(token);
        } else {
            console.log('❌ Aucun token trouvé');
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token) => {
        try {
            console.log('📡 Récupération de l\'utilisateur...');
            const response = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Utilisateur récupéré:', response.data);
            setUser(response.data);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('🔐 Tentative de login:', email);
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            console.log('✅ Login réussi, rôle:', user.role);
            localStorage.setItem('token', token);
            setUser(user);
            return { success: true, role: user.role };
        } catch (error) {
            console.error('❌ Erreur de login:', error.response?.data);
            return { success: false, error: error.response?.data?.message || 'Erreur de connexion' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            return { success: true, role: user.role };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || "Erreur d'inscription" };
        }
    };

    const logout = () => {
        console.log('🚪 Déconnexion');
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}