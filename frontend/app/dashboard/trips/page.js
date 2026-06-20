'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    Package,
    Clock,
    CheckCircle,
    Truck,
    Search,
    Filter,
    ArrowLeft,
    Calendar,
    Download,
    Eye,
    MapPin,
    X,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import TripCard from '../../components/TripCard';
import TripDetailModal from '../../components/TripDetailModal';
import { formatCurrency } from '@/lib/currency';

const sortByCreatedAtDesc = (items) =>
    [...items].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

export default function TripsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchInputRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
    });

    useEffect(() => {
        loadTrips();
    }, []);

    useEffect(() => {
        const total = trips.length;
        const pending = trips.filter(t => t.statut === 'PENDING').length;
        const inProgress = trips.filter(t => t.statut === 'IN_PROGRESS' || t.statut === 'ACCEPTED').length;
        const completed = trips.filter(t => t.statut === 'COMPLETED').length;
        setStats({ total, pending, inProgress, completed });
    }, [trips]);

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

    const loadTrips = async () => {
        try {
            const response = await tripApi.getClientTrips();
            setTrips(sortByCreatedAtDesc(response.data || []));
        } catch (error) {
            toast.error('Erreur lors du chargement des trajets');
        } finally {
            setLoading(false);
        }
    };

    const handleTripClick = (trip) => {
        setSelectedTrip(trip);
        setShowDetailModal(true);
        setShowResults(false);
        setSearchTerm('');
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

    const exportToPDF = () => {
        toast.success('📄 Export en cours...');
        // Fonction d'export à implémenter
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement de vos trajets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/client"
                            className="p-2 hover:bg-gray-200 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">📦 Mes trajets</h1>
                            <p className="text-sm text-gray-500">
                                {trips.length} trajet{trips.length > 1 ? 's' : ''} au total
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">

                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">En attente</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">En cours</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Truck className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Terminés</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche améliorée */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
                    <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                        <Calendar className="w-4 h-4" />
                        <span>{filteredTrips.length} trajet{filteredTrips.length > 1 ? 's' : ''} affiché{filteredTrips.length > 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Indicateur de recherche active */}
                {searchTerm && filteredTrips.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 mb-4">
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
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {searchTerm ? 'Aucun résultat pour votre recherche' : filter !== 'all' ? 'Aucun trajet dans cette catégorie' : 'Aucun trajet pour le moment'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm
                                ? 'Essayez avec d\'autres mots-clés'
                                : filter !== 'all'
                                ? 'Essayez de modifier vos filtres'
                                : 'Commencez par créer votre première demande'}
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
                    <div className="grid gap-4">
                        {filteredTrips.map((trip) => (
                            <div
                                key={trip.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 hover:border-blue-300"
                                onClick={() => handleTripClick(trip)}
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <MapPin className="w-4 h-4 text-green-500" />
                                                    <span className="font-medium">{trip.depart?.split(',')[0]}</span>
                                                </div>
                                                <span className="hidden sm:block text-gray-300">→</span>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <MapPin className="w-4 h-4 text-red-500" />
                                                    <span className="font-medium">{trip.arrivee?.split(',')[0]}</span>
                                                </div>
                                            </div>
                                            {trip.description && (
                                                <p className="text-sm text-gray-500 mt-1">{trip.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                                                <span>📦 {trip.poids} kg</span>
                                                {trip.distance && <span>📏 {trip.distance.toFixed(1)} km</span>}
                                                <span>💰 {formatCurrency(trip.prix)}</span>
                                                <span>📅 {new Date(trip.createdAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTripClick(trip);
                                                }}
                                            >
                                                <Eye className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de détails */}
            {showDetailModal && selectedTrip && (
                <TripDetailModal
                    trip={selectedTrip}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedTrip(null);
                    }}
                    userRole="CLIENT"
                />
            )}
        </div>
    );
}
