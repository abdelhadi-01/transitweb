'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Package,
    Clock,
    CheckCircle,
    Truck,
    MapPin,
    Calendar,
    TrendingUp,
    Users,
    DollarSign,
    Navigation,
    RefreshCw,
    ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';
import TripCard from '../../components/TripCard';
import TripDetailModal from '../../components/TripDetailModal';
import StatCard from '../../components/StatCard';

export default function ChauffeurDashboard() {
    const { user } = useAuth();
    const [availableTrips, setAvailableTrips] = useState([]);
    const [myTrips, setMyTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc');
    const intervalRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        earnings: 0
    });

    // Fonction de tri
    const sortTrips = (data, order) => {
        return [...data].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return order === 'desc' ? dateB - dateA : dateA - dateB;
        });
    };

    const loadData = async (showToast = false) => {
        try {
            setIsRefreshing(true);
            const [availableRes, myTripsRes] = await Promise.all([
                tripApi.getAvailableTrips(),
                tripApi.getChauffeurTrips()
            ]);
            setAvailableTrips(sortTrips(availableRes.data, sortOrder));
            setMyTrips(sortTrips(myTripsRes.data, sortOrder));
            setLastUpdate(new Date());
            if (showToast) {
                toast.success('🔄 Données mises à jour');
            }
        } catch (error) {
            if (showToast) {
                toast.error('Erreur lors du chargement des données');
            }
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        intervalRef.current = setInterval(() => {
            loadData(false);
        }, 5000);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (myTrips.length > 0) {
            const sorted = sortTrips(myTrips, sortOrder);
            setMyTrips(sorted);
        }
    }, [sortOrder]);

    useEffect(() => {
        const total = myTrips.length;
        const completed = myTrips.filter(t => t.statut === 'COMPLETED').length;
        const inProgress = myTrips.filter(t => t.statut === 'IN_PROGRESS' || t.statut === 'ACCEPTED').length;
        const earnings = myTrips.filter(t => t.statut === 'COMPLETED').reduce((sum, t) => sum + (t.prix || 0), 0);
        setStats({ total, completed, inProgress, earnings });
    }, [myTrips]);

    const handleAcceptTrip = async (tripId) => {
        try {
            await tripApi.acceptTrip(tripId);
            toast.success('Mission acceptée avec succès');
            loadData(false);
        } catch (error) {
            toast.error("Erreur lors de l'acceptation");
        }
    };

    const handleStartTrip = async (tripId) => {
        try {
            await tripApi.startTrip(tripId);
            toast.success('Trajet démarré');
            loadData(false);
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const handleCompleteTrip = async (tripId) => {
        try {
            await tripApi.completeTrip(tripId);
            toast.success('Trajet terminé');
            loadData(false);
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const handleTripClick = (trip) => {
        setSelectedTrip(trip);
        setShowDetailModal(true);
    };

    const handleManualRefresh = () => {
        loadData(true);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    const formatDate = (dateString) => {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Chargement de vos données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Bonjour, {user?.nom} 🚚
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500">
                            Gérez vos missions et suivez vos gains
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
                <div className="flex items-center gap-3">

                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Missions totales" value={stats.total} icon={Package} color="bg-blue-500" />
                <StatCard title="En cours" value={stats.inProgress} icon={Truck} color="bg-purple-500" />
                <StatCard title="Terminées" value={stats.completed} icon={CheckCircle} color="bg-green-500" />
                <StatCard title="Gains totaux" value={`${stats.earnings.toFixed(2)} €`} icon={DollarSign} color="bg-emerald-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Missions disponibles */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Missions disponibles</h2>
                        <span className="text-sm text-blue-600 font-medium">{availableTrips.length} disponibles</span>
                    </div>

                    {availableTrips.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
                            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Aucune mission disponible</p>
                            <p className="text-sm text-gray-400 mt-1">Revenez plus tard</p>
                        </div>
                    ) : (
                        availableTrips.slice(0, 3).map((trip) => (
                            <div key={trip.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Disponible</span>
                                            <span className="text-xs text-gray-400">#{trip.id?.toString().padStart(6, '0')}</span>
                                            <span className="text-xs text-gray-400">{formatDate(trip.createdAt)}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-800">{trip.depart?.split(',')[0]} → {trip.arrivee?.split(',')[0]}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>📦 {trip.poids} kg</span>
                                                {trip.distance && <span>📏 {trip.distance.toFixed(1)} km</span>}
                                                <span>💰 {trip.prix?.toFixed(2)} €</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleAcceptTrip(trip.id); }}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                                    >
                                        Accepter
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    {availableTrips.length > 3 && (
                        <Link href="/dashboard/missions" className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Voir toutes les missions →
                        </Link>
                    )}
                </div>

                {/* Mes missions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Mes missions</h2>
                        <span className="text-sm text-gray-500">{myTrips.length} total</span>
                    </div>

                    {myTrips.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
                            <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Aucune mission en cours</p>
                            <p className="text-sm text-gray-400 mt-1">Acceptez une mission disponible</p>
                        </div>
                    ) : (
                        myTrips.slice(0, 3).map((trip) => (
                            <div key={trip.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 p-4 cursor-pointer" onClick={() => handleTripClick(trip)}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                                                trip.statut === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                trip.statut === 'IN_PROGRESS' || trip.statut === 'ACCEPTED' ? 'bg-purple-100 text-purple-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {trip.statut === 'PENDING' ? 'En attente' :
                                                 trip.statut === 'ACCEPTED' ? 'Accepté' :
                                                 trip.statut === 'IN_PROGRESS' ? 'En cours' :
                                                 'Terminé'}
                                            </span>
                                            <span className="text-xs text-gray-400">#{trip.id?.toString().padStart(6, '0')}</span>
                                            <span className="text-xs text-gray-400">{formatDate(trip.createdAt)}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800">{trip.depart?.split(',')[0]} → {trip.arrivee?.split(',')[0]}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span>📦 {trip.poids} kg</span>
                                            {trip.distance && <span>📏 {trip.distance.toFixed(1)} km</span>}
                                            <span>💰 {trip.prix?.toFixed(2)} €</span>
                                        </div>
                                    </div>
                                    {trip.statut === 'ACCEPTED' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStartTrip(trip.id); }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                                        >
                                            Démarrer
                                        </button>
                                    )}
                                    {trip.statut === 'IN_PROGRESS' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCompleteTrip(trip.id); }}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                                        >
                                            Terminer
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showDetailModal && selectedTrip && (
                <TripDetailModal trip={selectedTrip} onClose={() => { setShowDetailModal(false); setSelectedTrip(null); }} userRole="CHAUFFEUR" />
            )}
        </div>
    );
}