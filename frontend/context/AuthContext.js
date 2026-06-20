'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

    const normalizeToken = (token) => (token.startsWith('Bearer ') ? token : `Bearer ${token}`);

    const fetchUser = useCallback(async (token) => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/me', {
                headers: { Authorization: normalizeToken(token) }
            });
            setUser(response.data);
        } catch {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            void fetchUser(localStorage.getItem('token'));
        });
    }, [fetchUser]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            return { success: true, role: user.role };
        } catch (error) {
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
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
