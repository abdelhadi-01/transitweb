'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Users,
    User,
    Search,
    RefreshCw,
    X,
    Shield,
    UserCheck,
    Trash2,
    Eye,
    Phone,
    AlertCircle,
    Database
} from 'lucide-react';

const normalizeUsers = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

const sortByCreatedAtDesc = (items) =>
    [...items].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchInputRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        clients: 0,
        chauffeurs: 0,
        admins: 0
    });

    const updateStats = useCallback((data) => {
        const total = data.length;
        const clients = data.filter((u) => u.role === 'CLIENT').length;
        const chauffeurs = data.filter((u) => u.role === 'CHAUFFEUR').length;
        const admins = data.filter((u) => u.role === 'ADMIN').length;
        setStats({ total, clients, chauffeurs, admins });
    }, []);

    const loadUsers = useCallback(async (showToast = false) => {
        try {
            setIsRefreshing(true);

            const response = await adminApi.getUsers();
            const data = sortByCreatedAtDesc(normalizeUsers(response.data));

            setUsers(data);
            updateStats(data);

            if (showToast) {
                toast.success(
                    data.length > 0
                        ? 'Utilisateurs chargés depuis la base de données'
                        : 'Aucun utilisateur trouvé dans la base de données'
                );
            }
        } catch (error) {
            console.error('Erreur loadUsers:', error);
            setUsers([]);
            updateStats([]);
            toast.error('Impossible de charger les utilisateurs depuis le backend');
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    }, [updateStats]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadUsers();
        }, 0);

        return () => clearTimeout(timer);
    }, [loadUsers]);

    const handleDeleteUser = async (userId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await adminApi.deleteUser(userId);
            const updatedUsers = users.filter((entry) => entry.id !== userId);
            setUsers(updatedUsers);
            updateStats(updatedUsers);
            toast.success('Utilisateur supprimé');
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    const handleSearchBlur = () => {
        setTimeout(() => {
            setIsSearchFocused(false);
        }, 200);
    };

    const clearSearch = () => {
        setSearchTerm('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const getFilteredUsers = () => {
        let filtered = users;

        if (filterRole !== 'all') {
            filtered = filtered.filter((entry) => entry.role === filterRole.toUpperCase());
        }

        if (searchTerm) {
            filtered = filtered.filter((entry) =>
                entry.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.telephone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.role?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    const getRoleLabel = (role) => {
        const labels = {
            CLIENT: 'Client',
            CHAUFFEUR: 'Chauffeur',
            ADMIN: 'Administrateur'
        };
        return labels[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            CLIENT: 'bg-blue-100 text-blue-700',
            CHAUFFEUR: 'bg-green-100 text-green-700',
            ADMIN: 'bg-purple-100 text-purple-700'
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Chargement des utilisateurs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        <Database className="w-4 h-4" />
                        <span>Affichage des comptes enregistrés en base</span>
                    </div>
                </div>
                <button
                    onClick={() => loadUsers(true)}
                    disabled={isRefreshing}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                        isRefreshing
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Mise à jour...' : 'Actualiser'}
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Clients</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.clients}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Chauffeurs</p>
                            <p className="text-2xl font-bold text-green-600">{stats.chauffeurs}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Admins</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial min-w-[200px] sm:min-w-[280px]">
                        <div className={`relative transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-blue-400 rounded-xl shadow-lg shadow-blue-100' : ''}`}>
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}`} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {[
                            { key: 'all', label: 'Tous' },
                            { key: 'client', label: 'Clients' },
                            { key: 'chauffeur', label: 'Chauffeurs' },
                            { key: 'admin', label: 'Admins' }
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilterRole(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                    filterRole === f.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                    {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} affiché{filteredUsers.length > 1 ? 's' : ''}
                </span>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-gray-400" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun utilisateur trouvé'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {searchTerm
                            ? 'Essayez avec d’autres mots-clés'
                            : 'Les comptes créés apparaissent ici dès qu’ils sont enregistrés en base'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrit le</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                    {entry.nom?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{entry.nom}</p>
                                                    <p className="text-sm text-gray-500">{entry.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(entry.role)}`}>
                                                {getRoleLabel(entry.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-sm">
                                                {entry.telephone && (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {entry.telephone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(entry.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                </button>
                                                {entry.role !== 'ADMIN' && (
                                                    <button
                                                        onClick={() => handleDeleteUser(entry.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
