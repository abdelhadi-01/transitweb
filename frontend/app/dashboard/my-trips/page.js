'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Truck,
    MapPin,
    Calendar,
    Package,
    Clock,
    DollarSign,
    Navigation,
    Filter,
    Search,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    Eye,
    RefreshCw,
    Play,
    Check,
    XCircle,
    MoreHorizontal,
    ChevronDown,
    User,
    Phone,
    MessageCircle,
    Star,
    Sparkles,
    X
} from 'lucide-react';
import Link from 'next/link';
import TripDetailModal from '../../components/TripDetailModal';
import StatCard from '../../components/StatCard';
import { formatCurrency } from '@/lib/currency';

const sortByCreatedAtDesc = (items) =>
    [...items].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

export default function MyTripsPage() {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const intervalRef = useRef(null);
    const searchInputRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        earnings: 0
    });

    // Charger les trajets
    const loadTrips = async (showToast = false) => {
        try {
            setIsRefreshing(true);
            const response = await tripApi.getChauffeurTrips();

            const sortedData = sortByCreatedAtDesc(response.data || []);
            setTrips(sortedData);
            setLastUpdate(new Date());

            const source = response.data || [];
            const total = source.length;
            const completed = source.filter(t => t.statut === 'COMPLETED').length;
            const inProgress = source.filter(t => t.statut === 'IN_PROGRESS' || t.statut === 'ACCEPTED').length;
            const pending = source.filter(t => t.statut === 'PENDING').length;
            const earnings = source.filter(t => t.statut === 'COMPLETED').reduce((sum, t) => sum + (t.prix || 0), 0);
            setStats({ total, completed, inProgress, pending, earnings });

            if (showToast) {
                toast.success('🔄 Trajets mis à jour');
            }
        } catch (error) {
            if (showToast) {
                toast.error('Erreur lors du chargement des trajets');
            }
            console.error('Erreur loadTrips:', error);
        } finally {
            setIsRefreshing(false);
            setLoading(false);
            setActionInProgress(false);
        }
    };

    // Chargement initial et actualisation automatique
    useEffect(() => {
        loadTrips();

        intervalRef.current = setInterval(() => {
            if (!actionInProgress) {
                loadTrips(false);
            }
        }, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Mettre à jour les résultats de recherche en temps réel
    useEffect(() => {
        if (searchTerm.trim()) {
            const results = trips.filter(trip =>
                trip.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.arrivee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.clientNom?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(sortByCreatedAtDesc(results));
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [searchTerm, trips]);

    // Mettre à jour le statut d'un trajet
    const updateTripStatus = async (tripId, newStatus) => {
        if (actionInProgress) return;

        setActionInProgress(true);
        setUpdatingStatus(tripId);

        try {
            let response;
            let successMessage = '';

            switch (newStatus) {
                case 'ACCEPTED':
                    response = await tripApi.acceptTrip(tripId);
                    successMessage = '✅ Mission acceptée !';
                    break;
                case 'IN_PROGRESS':
                    response = await tripApi.startTrip(tripId);
                    successMessage = '🚀 Trajet démarré !';
                    break;
                case 'COMPLETED':
                    response = await tripApi.completeTrip(tripId);
                    successMessage = '✅ Trajet terminé !';
                    break;
                default:
                    return;
            }

            toast.success(successMessage);
            window.dispatchEvent(new Event('notifications:refresh'));
            await loadTrips(false);

        } catch (error) {
            toast.error("❌ Erreur lors de la mise à jour du statut");
            console.error('Erreur updateTripStatus:', error);
        } finally {
            setUpdatingStatus(null);
            setActionInProgress(false);
        }
    };

    const handleTripClick = (trip) => {
        setSelectedTrip(trip);
        setShowDetailModal(true);
        setShowResults(false);
        setSearchTerm('');
    };

    const handleManualRefresh = () => {
        loadTrips(true);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setShowResults(false);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        if (searchTerm.trim()) {
            setShowResults(true);
        }
    };

    const handleSearchBlur = () => {
        // Délai pour permettre le clic sur un résultat
        setTimeout(() => {
            setIsSearchFocused(false);
            setShowResults(false);
        }, 200);
    };

    const getFilteredTrips = () => {
        let filtered = trips;

        if (filter === 'pending') {
            filtered = filtered.filter(t => t.statut === 'PENDING');
        } else if (filter === 'active') {
            filtered = filtered.filter(t => t.statut === 'ACCEPTED' || t.statut === 'IN_PROGRESS');
        } else if (filter === 'completed') {
            filtered = filtered.filter(t => t.statut === 'COMPLETED');
        }

        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.arrivee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.clientNom?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredTrips = sortByCreatedAtDesc(getFilteredTrips());

    // Compteurs par statut
    const statusCounts = {
        all: trips.length,
        pending: trips.filter(t => t.statut === 'PENDING').length,
        active: trips.filter(t => t.statut === 'ACCEPTED' || t.statut === 'IN_PROGRESS').length,
        completed: trips.filter(t => t.statut === 'COMPLETED').length
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            'PENDING': { next: 'ACCEPTED', label: 'Accepter', icon: Check, color: 'green', bg: 'bg-green-600 hover:bg-green-700' },
            'ACCEPTED': { next: 'IN_PROGRESS', label: 'Démarrer', icon: Play, color: 'blue', bg: 'bg-blue-600 hover:bg-blue-700' },
            'IN_PROGRESS': { next: 'COMPLETED', label: 'Terminer', icon: Check, color: 'purple', bg: 'bg-purple-600 hover:bg-purple-700' },
            'COMPLETED': { next: null, label: 'Terminé', icon: CheckCircle, color: 'gray', bg: 'bg-gray-400' }
        };
        return statusFlow[currentStatus] || null;
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'ACCEPTED': 'bg-blue-100 text-blue-700 border-blue-200',
            'IN_PROGRESS': 'bg-purple-100 text-purple-700 border-purple-200',
            'COMPLETED': 'bg-green-100 text-green-700 border-green-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PENDING': 'En attente',
            'ACCEPTED': 'Accepté',
            'IN_PROGRESS': 'En cours',
            'COMPLETED': 'Terminé'
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        const icons = {
            'PENDING': <Clock className="w-4 h-4" />,
            'ACCEPTED': <Check className="w-4 h-4" />,
            'IN_PROGRESS': <Navigation className="w-4 h-4 animate-pulse" />,
            'COMPLETED': <CheckCircle className="w-4 h-4" />
        };
        return icons[status] || <Clock className="w-4 h-4" />;
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

    // Vérifier si un trajet est nouveau (moins de 5 minutes)
    const isNewTrip = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        return diffMs < 300000; // 5 minutes
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Chargement de vos trajets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🚚 Mes trajets</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500">
                            {trips.length} trajet{trips.length > 1 ? 's' : ''} au total
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

            {/* Statistiques */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total trajets" value={stats.total} icon={Truck} color="bg-blue-500" />
                <StatCard title="En attente" value={stats.pending} icon={Clock} color="bg-yellow-500" />
                <StatCard title="En cours" value={stats.inProgress} icon={Navigation} color="bg-purple-500" />
                <StatCard title="Terminés" value={stats.completed} icon={CheckCircle} color="bg-green-500" />
            </div>

            {/* Gains */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-white/80">Gains totaux</p>
                        <p className="text-3xl font-bold">{formatCurrency(stats.earnings)}</p>
                        <p className="text-xs text-white/60 mt-1">💰 Revenus générés sur toutes vos missions</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Barre de recherche améliorée */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial min-w-[200px] sm:min-w-[280px]">
                        <div className={`relative transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-blue-400 rounded-xl shadow-lg shadow-blue-100' : ''}`}>
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}`} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Rechercher un trajet..."
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

                        {/* Résultats de recherche en temps réel */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-72 overflow-y-auto z-50 py-1 animate-fade-in">
                                <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 bg-gray-50 rounded-t-xl flex items-center justify-between">
                                    <span>
                                        {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                                    </span>
                                    <button
                                        onClick={clearSearch}
                                        className="text-blue-600 hover:text-blue-700 text-xs"
                                    >
                                        Tout voir
                                    </button>
                                </div>
                                {searchResults.slice(0, 5).map((trip) => (
                                    <div
                                        key={trip.id}
                                        className="px-3 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex items-center justify-between transition-colors duration-150 border-b border-gray-50 last:border-b-0"
                                        onClick={() => handleTripClick(trip)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                                                    trip.statut === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                    trip.statut === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                                                    trip.statut === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {getStatusLabel(trip.statut)}
                                                </span>
                                                <span className="text-xs text-gray-400">#{trip.id?.toString().padStart(6, '0')}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-600">
                                                <span className="truncate">{trip.depart?.split(',')[0]}</span>
                                                <span className="text-gray-300">→</span>
                                                <span className="truncate">{trip.arrivee?.split(',')[0]}</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-green-600 ml-4 whitespace-nowrap">
                                            {formatCurrency(trip.prix)}
                                        </span>
                                    </div>
                                ))}
                                {searchResults.length > 5 && (
                                    <div className="px-3 py-2 text-xs text-blue-600 text-center border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                        + {searchResults.length - 5} autre{searchResults.length - 5 > 1 ? 's' : ''} résultat{searchResults.length - 5 > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Message "Aucun résultat" */}
                        {showResults && searchTerm && searchResults.length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 py-6 z-50 animate-fade-in">
                                <div className="text-center">
                                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Aucun résultat trouvé</p>
                                    <p className="text-xs text-gray-400 mt-1">Essayez avec d'autres mots-clés</p>
                                    <button
                                        onClick={clearSearch}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Effacer la recherche
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-1 flex-wrap">
                        {[
                            { key: 'all', label: 'Tous', count: statusCounts.all },
                            { key: 'pending', label: 'En attente', count: statusCounts.pending },
                            { key: 'active', label: 'En cours', count: statusCounts.active },
                            { key: 'completed', label: 'Terminés', count: statusCounts.completed }
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                                    filter === f.key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    filter === f.key ? 'bg-white/20' : 'bg-gray-200'
                                }`}>
                                    {f.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                    {filteredTrips.length} trajet{filteredTrips.length > 1 ? 's' : ''} affiché{filteredTrips.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Indicateur de recherche active */}
            {searchTerm && filteredTrips.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <Search className="w-3.5 h-3.5" />
                    Résultats pour : <span className="font-medium">"{searchTerm}"</span>
                    <span className="text-gray-400 text-xs ml-1">
                        ({filteredTrips.length} trajet{filteredTrips.length > 1 ? 's' : ''})
                    </span>
                    <button onClick={clearSearch} className="ml-1 text-blue-400 hover:text-blue-600 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Liste des trajets */}
            {filteredTrips.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-gray-400" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {searchTerm ? 'Aucun résultat pour votre recherche' : filter !== 'all' ? 'Aucun trajet dans cette catégorie' : 'Aucun trajet pour le moment'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {searchTerm
                            ? 'Essayez avec d\'autres mots-clés'
                            : filter !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Acceptez des missions pour commencer'}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Effacer la recherche
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTrips.map((trip) => {
                        const nextStatus = getNextStatus(trip.statut);
                        const isUpdating = updatingStatus === trip.id;
                        const isActionDisabled = actionInProgress && !isUpdating;
                        const isNew = isNewTrip(trip.createdAt);

                        return (
                            <div
                                key={trip.id}
                                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-300 overflow-hidden ${
                                    isUpdating ? 'opacity-70' : ''
                                } ${isNew ? 'border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className="p-5">
                                    {/* En-tête avec statut et prix */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${getStatusColor(trip.statut)}`}>
                                                {getStatusIcon(trip.statut)}
                                                {getStatusLabel(trip.statut)}
                                            </span>
                                            {isNew && (
                                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1 animate-pulse">
                                                    <Sparkles className="w-3 h-3" />
                                                    Nouveau
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400">#{trip.id?.toString().padStart(6, '0')}</span>
                                            <span className="text-xs text-gray-400 ml-2">
                                                {formatDate(trip.createdAt)}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-green-600">
                                            {formatCurrency(trip.prix)}
                                        </span>
                                    </div>

                                    {/* Trajet */}
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => handleTripClick(trip)}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <div className="relative">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                                    <div className="absolute top-4 left-0.5 w-0.5 h-6 bg-gray-300"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-400">Départ</p>
                                                    <p className="text-sm font-medium text-gray-800 truncate">{trip.depart}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-400">Arrivée</p>
                                                    <p className="text-sm font-medium text-gray-800 truncate">{trip.arrivee}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Détails supplémentaires */}
                                        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Package className="w-3.5 h-3.5" />
                                                {trip.poids} kg
                                            </span>
                                            {trip.distance && (
                                                <span className="flex items-center gap-1">
                                                    <Navigation className="w-3.5 h-3.5" />
                                                    {trip.distance.toFixed(1)} km
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(trip.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                            {trip.clientNom && (
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3.5 h-3.5" />
                                                    {trip.clientNom}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex items-center gap-3 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleTripClick(trip)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Détails
                                        </button>

                                        {nextStatus && nextStatus.next && trip.statut !== 'COMPLETED' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateTripStatus(trip.id, nextStatus.next);
                                                }}
                                                disabled={isUpdating || isActionDisabled}
                                                className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition flex items-center justify-center gap-2 ${nextStatus.bg} ${
                                                    (isUpdating || isActionDisabled) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                                                }`}
                                            >
                                                {isUpdating ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <nextStatus.icon className="w-4 h-4" />
                                                        {nextStatus.label}
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {trip.statut === 'COMPLETED' && (
                                            <div className="flex-1 flex items-center justify-center gap-1 text-green-600 font-medium text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                                Mission terminée
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de détails */}
            {showDetailModal && selectedTrip && (
                <TripDetailModal
                    trip={selectedTrip}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedTrip(null);
                    }}
                    userRole="CHAUFFEUR"
                />
            )}
        </div>
    );
}
