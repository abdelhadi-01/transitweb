'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('admin@transitweb.com');
    const [password, setPassword] = useState('admin');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('🔐 Tentative de login admin:', email);
            const response = await api.post('/auth/login', { email, password });
            console.log('✅ Réponse reçue:', response.data);

            const { token, user } = response.data;

            if (!token || !user) {
                toast.error('Données de connexion invalides');
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success('Connexion admin réussie');
            router.push('/dashboard/admin');

        } catch (error) {
            console.error('❌ Erreur:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            } else if (error.request) {
                console.error('Pas de réponse du serveur');
            }
            toast.error('Erreur de connexion admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        👑 Admin Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Accès réservé aux administrateurs
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email Admin
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                                placeholder="admin@transitweb.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? 'Connexion...' : 'Se connecter Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}