'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Users,
    Package,
    Clock,
    CheckCircle,
    Truck,
    DollarSign,
    BarChart3,
    UserPlus,
    Eye,
    Activity,
    Calendar,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import StatCard from '../../components/StatCard';
import { formatCurrency } from '@/lib/currency';

const sortByCreatedAtDesc = (items) =>
    [...items].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

export default function AdminDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTrips: 0,
        pendingTrips: 0,
        inProgressTrips: 0,
        completedTrips: 0,
        totalRevenue: 0,
        activeChauffeurs: 0,
        activeClients: 0
    });
    const [recentTrips, setRecentTrips] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [dailyStats, setDailyStats] = useState({
        todayTrips: 0,
        todayRevenue: 0,
        newUsers: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsRefreshing(true);

            // Charger les données depuis le backend
            const dashboardData = await adminApi.getDashboard();
            const data = dashboardData.data;

            setStats({
                totalUsers: data.totalUsers || 0,
                totalTrips: data.totalTrips || 0,
                pendingTrips: data.pendingTrips || 0,
                inProgressTrips: data.inProgressTrips || 0,
                completedTrips: data.completedTrips || 0,
                totalRevenue: data.totalRevenue || 0,
                activeChauffeurs: data.activeChauffeurs || 0,
                activeClients: data.activeClients || 0
            });

            setDailyStats({
                todayTrips: data.todayTrips || 0,
                todayRevenue: data.todayRevenue || 0,
                newUsers: data.newUsers || 0
            });

            // Charger les trajets récents
            const tripsResponse = await adminApi.getTrips();
            const trips = tripsResponse.data || [];
            setRecentTrips(sortByCreatedAtDesc(trips).slice(0, 5));

            // Charger les utilisateurs récents
            const usersResponse = await adminApi.getUsers();
            const users = usersResponse.data || [];
            setRecentUsers(sortByCreatedAtDesc(users).slice(0, 5));

            setLastUpdate(new Date());

        } catch (error) {
            console.error('Erreur loadData:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours} h`;
        if (diffDays < 7) return `Il y a ${diffDays} j`;
        return date.toLocaleDateString('fr-FR');
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-700',
            'ACCEPTED': 'bg-blue-100 text-blue-700',
            'IN_PROGRESS': 'bg-purple-100 text-purple-700',
            'COMPLETED': 'bg-green-100 text-green-700',
            'CANCELLED': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PENDING': 'En attente',
            'ACCEPTED': 'Accepté',
            'IN_PROGRESS': 'En cours',
            'COMPLETED': 'Terminé',
            'CANCELLED': 'Annulé'
        };
        return labels[status] || status;
    };

    const getRoleLabel = (role) => {
        const labels = {
            'CLIENT': 'Client',
            'CHAUFFEUR': 'Chauffeur',
            'ADMIN': 'Administrateur'
        };
        return labels[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            'CLIENT': 'bg-blue-100 text-blue-700',
            'CHAUFFEUR': 'bg-green-100 text-green-700',
            'ADMIN': 'bg-purple-100 text-purple-700'
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    const statCards = [
        { title: 'Total utilisateurs', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
        { title: 'Total trajets', value: stats.totalTrips, icon: Package, color: 'bg-indigo-500' },
        { title: 'En attente', value: stats.pendingTrips, icon: Clock, color: 'bg-yellow-500' },
        { title: 'En cours', value: stats.inProgressTrips, icon: Activity, color: 'bg-purple-500' },
        { title: 'Terminés', value: stats.completedTrips, icon: CheckCircle, color: 'bg-green-500' },
        { title: 'Chiffre d\'affaires', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-emerald-500' },
        { title: 'Chauffeurs actifs', value: stats.activeChauffeurs, icon: Truck, color: 'bg-purple-500' },
        { title: 'Clients actifs', value: stats.activeClients, icon: Users, color: 'bg-blue-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">👑 Tableau de bord Admin</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500">
                            Gérez l'ensemble de la plateforme
                        </p>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                            <span className="text-xs text-gray-400">
                                {isRefreshing ? 'Mise à jour...' : 'En direct'}
                            </span>
                        </div>
                        {lastUpdate && (
                            <span className="text-xs text-gray-400">
                                • {lastUpdate.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => loadData()}
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

            {/* Stats du jour */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/80">Trajets aujourd'hui</p>
                            <p className="text-2xl font-bold">{dailyStats.todayTrips}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-white/60" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/80">Revenus aujourd'hui</p>
                            <p className="text-2xl font-bold">{formatCurrency(dailyStats.todayRevenue)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-white/60" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/80">Nouveaux utilisateurs</p>
                            <p className="text-2xl font-bold">{dailyStats.newUsers}</p>
                        </div>
                        <UserPlus className="w-8 h-8 text-white/60" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.slice(0, 4).map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trajets récents */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-500" />
                            Trajets récents
                        </h2>
                        <Link href="/dashboard/all-trips" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentTrips.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p>Aucun trajet récent</p>
                            </div>
                        ) : (
                            recentTrips.map((trip) => (
                                <div key={trip.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.statut)}`}>
                                                    {getStatusLabel(trip.statut)}
                                                </span>
                                                <span className="text-xs text-gray-400">#{trip.id?.toString().padStart(6, '0')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                <span className="truncate">{trip.depart}</span>
                                                <span>→</span>
                                                <span className="truncate">{trip.arrivee}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                <span>👤 {trip.clientNom}</span>
                                                <span>💰 {formatCurrency(trip.prix)}</span>
                                                <span>📅 {formatDate(trip.createdAt)}</span>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Utilisateurs récents */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Nouveaux utilisateurs
                        </h2>
                        <Link href="/dashboard/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Voir tout →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentUsers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p>Aucun utilisateur récent</p>
                            </div>
                        ) : (
                            recentUsers.map((user) => (
                                <div key={user.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                {user.nom?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900">{user.nom}</p>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={`px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                                                        {getRoleLabel(user.role)}
                                                    </span>
                                                    <span className="text-gray-400">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(user.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    href="/dashboard/users"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white hover:shadow-lg transition group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/80">Gestion des utilisateurs</p>
                            <p className="text-lg font-semibold mt-1">👥 {stats.totalUsers} utilisateurs</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </Link>
                <Link
                    href="/dashboard/all-trips"
                    className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 text-white hover:shadow-lg transition group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/80">Supervision des trajets</p>
                            <p className="text-lg font-semibold mt-1">🚚 {stats.totalTrips} trajets</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </Link>
                <Link
                    href="/dashboard/stats"
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white hover:shadow-lg transition group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/80">Statistiques globales</p>
                            <p className="text-lg font-semibold mt-1">💰 {formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
