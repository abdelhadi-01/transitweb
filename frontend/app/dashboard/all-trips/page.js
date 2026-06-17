'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Package,
    Search,
    RefreshCw,
    X,
    MapPin,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Truck,
    User,
    DollarSign,
    Eye,
    Database
} from 'lucide-react';
import Link from 'next/link';
import TripDetailModal from '../../components/TripDetailModal';

export default function AllTripsPage() {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isUsingMockData, setIsUsingMockData] = useState(false);
    const searchInputRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        accepted: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
    });

    // Trajets par défaut
    const defaultTrips = [
        {
            id: 1,
            depart: 'Casablanca, Maroc',
            arrivee: 'Rabat, Maroc',
            description: 'Colis standard - Documents',
            poids: 15.5,
            prix: 45.00,
            statut: 'COMPLETED',
            clientNom: 'Jean Dupont',
            chauffeurNom: 'Ahmed Benjelloun',
            distance: 87.5,
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 2,
            depart: 'Marrakech, Maroc',
            arrivee: 'Casablanca, Maroc',
            description: 'Équipement électronique - Fragile',
            poids: 8.0,
            prix: 60.00,
            statut: 'IN_PROGRESS',
            clientNom: 'Marie Martin',
            chauffeurNom: 'Karim Mansouri',
            distance: 245.0,
            createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
            id: 3,
            depart: 'Fès, Maroc',
            arrivee: 'Tanger, Maroc',
            description: 'Mobilier - Canapé 3 places',
            poids: 50.0,
            prix: 80.00,
            statut: 'PENDING',
            clientNom: 'Pierre Durand',
            chauffeurNom: null,
            distance: 210.0,
            createdAt: new Date(Date.now() - 14400000).toISOString()
        },
        {
            id: 4,
            depart: 'Casablanca, Maroc',
            arrivee: 'Agadir, Maroc',
            description: 'Produits frais - Urgent',
            poids: 30.0,
            prix: 95.00,
            statut: 'ACCEPTED',
            clientNom: 'Sophie Bernard',
            chauffeurNom: 'Ahmed Benjelloun',
            distance: 420.0,
            createdAt: new Date(Date.now() - 21600000).toISOString()
        },
        {
            id: 5,
            depart: 'Rabat, Maroc',
            arrivee: 'Meknès, Maroc',
            description: 'Documents sensibles',
            poids: 2.0,
            prix: 35.00,
            statut: 'CANCELLED',
            clientNom: 'Lucas Moreau',
            chauffeurNom: null,
            distance: 150.0,
            createdAt: new Date(Date.now() - 28800000).toISOString()
        },
        {
            id: 6,
            depart: 'Tanger, Maroc',
            arrivee: 'Casablanca, Maroc',
            description: 'Pièces automobiles',
            poids: 75.0,
            prix: 120.00,
            statut: 'COMPLETED',
            clientNom: 'Ahmed Alaoui',
            chauffeurNom: 'Karim Mansouri',
            distance: 340.0,
            createdAt: new Date(Date.now() - 172800000).toISOString()
        }
    ];

    useEffect(() => {
        loadTrips();
    }, []);

    // Mettre à jour les résultats de recherche en temps réel
    useEffect(() => {
        if (searchTerm.trim()) {
            const results = trips.filter(trip =>
                trip.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.arrivee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.clientNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.chauffeurNom?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [searchTerm, trips]);

    const loadTrips = async (showToast = false) => {
        try {
            setIsRefreshing(true);
            setIsUsingMockData(false);

            // Essayer de charger depuis le backend
            const response = await adminApi.getTrips();

            if (response.data && response.data.length > 0) {
                setTrips(response.data);
                updateStats(response.data);
                if (showToast) {
                    toast.success('🔄 Trajets chargés depuis la base de données');
                }
            } else {
                // Si le backend renvoie une liste vide, utiliser les données par défaut
                setTrips(defaultTrips);
                updateStats(defaultTrips);
                setIsUsingMockData(true);
                if (showToast) {
                    toast.info('📋 Utilisation des trajets par défaut');
                }
            }
        } catch (error) {
            console.error('Erreur loadTrips:', error);
            // En cas d'erreur, utiliser les données par défaut
            setTrips(defaultTrips);
            updateStats(defaultTrips);
            setIsUsingMockData(true);
            if (showToast) {
                toast.info('📋 Utilisation des trajets par défaut (backend indisponible)');
            }
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    };

    const updateStats = (data) => {
        const total = data.length;
        const pending = data.filter(t => t.statut === 'PENDING').length;
        const accepted = data.filter(t => t.statut === 'ACCEPTED').length;
        const inProgress = data.filter(t => t.statut === 'IN_PROGRESS').length;
        const completed = data.filter(t => t.statut === 'COMPLETED').length;
        const cancelled = data.filter(t => t.statut === 'CANCELLED').length;
        setStats({ total, pending, accepted, inProgress, completed, cancelled });
    };

    const handleTripClick = (trip) => {
        setSelectedTrip(trip);
        setShowDetailModal(true);
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        if (searchTerm.trim()) {
            setShowResults(true);
        }
    };

    const handleSearchBlur = () => {
        setTimeout(() => {
            setIsSearchFocused(false);
            setShowResults(false);
        }, 200);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setShowResults(false);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const getFilteredTrips = () => {
        let filtered = trips;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(t => t.statut === filterStatus.toUpperCase());
        }

        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.arrivee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.clientNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.chauffeurNom?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredTrips = getFilteredTrips();

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
                    <p className="mt-4 text-gray-500">Chargement des trajets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec indicateur de source */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🚚 Supervision des trajets</h1>

                </div>
                <button
                    onClick={() => loadTrips(true)}
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

            {/* Statistiques */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                <div className="bg-white rounded-2xl shadow-sm p-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">En attente</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">Acceptés</p>
                    <p className="text-xl font-bold text-blue-600">{stats.accepted}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">En cours</p>
                    <p className="text-xl font-bold text-purple-600">{stats.inProgress}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">Terminés</p>
                    <p className="text-xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-500">Annulés</p>
                    <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
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
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {[
                            { key: 'all', label: 'Tous' },
                            { key: 'pending', label: 'En attente' },
                            { key: 'accepted', label: 'Acceptés' },
                            { key: 'in_progress', label: 'En cours' },
                            { key: 'completed', label: 'Terminés' },
                            { key: 'cancelled', label: 'Annulés' }
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilterStatus(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                    filterStatus === f.key
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
                    {filteredTrips.length} trajet{filteredTrips.length > 1 ? 's' : ''} affiché{filteredTrips.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Liste des trajets */}
            {filteredTrips.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-gray-400" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun trajet trouvé'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {searchTerm
                            ? 'Essayez avec d\'autres mots-clés'
                            : 'Les trajets apparaîtront ici'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTrips.map((trip) => (
                        <div
                            key={trip.id}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-300 overflow-hidden cursor-pointer"
                            onClick={() => handleTripClick(trip)}
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.statut)}`}>
                                                {getStatusLabel(trip.statut)}
                                            </span>
                                            <span className="text-xs text-gray-400">#{trip.id?.toString().padStart(6, '0')}</span>
                                            <span className="text-xs text-gray-400 ml-2">
                                                {formatDate(trip.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <MapPin className="w-4 h-4 text-green-500" />
                                                <span className="font-medium truncate">{trip.depart}</span>
                                            </div>
                                            <span className="hidden sm:block text-gray-300">→</span>
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <MapPin className="w-4 h-4 text-red-500" />
                                                <span className="font-medium truncate">{trip.arrivee}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Package className="w-3.5 h-3.5" />
                                                {trip.poids} kg
                                            </span>
                                            {trip.distance && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {trip.distance.toFixed(1)} km
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                {trip.prix?.toFixed(2)} €
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3.5 h-3.5" />
                                                {trip.clientNom}
                                            </span>
                                            {trip.chauffeurNom && (
                                                <span className="flex items-center gap-1">
                                                    <Truck className="w-3.5 h-3.5" />
                                                    {trip.chauffeurNom}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition ml-4">
                                        <Eye className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
                    userRole="ADMIN"
                />
            )}
        </div>
    );
}