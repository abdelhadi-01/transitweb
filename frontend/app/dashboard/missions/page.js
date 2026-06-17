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
    TrendingUp,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    ArrowUpDown,
    Sparkles,
    X
} from 'lucide-react';
import Link from 'next/link';
import TripDetailModal from '../../components/TripDetailModal';

export default function MissionsPage() {
    const { user } = useAuth();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchInputRef = useRef(null);
    const intervalRef = useRef(null);

    // Charger les missions
    const loadMissions = async (showToast = false) => {
        try {
            setIsRefreshing(true);
            const response = await tripApi.getAvailableTrips();

            const sortedData = sortMissions(response.data, sortOrder);
            setMissions(sortedData);
            setLastUpdate(new Date());

            if (showToast) {
                toast.success('🔄 Missions mises à jour');
            }
        } catch (error) {
            if (showToast) {
                toast.error('Erreur lors du chargement des missions');
            }
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    };

    // Fonction de tri des missions
    const sortMissions = (data, order) => {
        return [...data].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return order === 'desc' ? dateB - dateA : dateA - dateB;
        });
    };

    // Mettre à jour les résultats de recherche en temps réel
    useEffect(() => {
        if (searchTerm.trim()) {
            const results = missions.filter(mission =>
                mission.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mission.arrivee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mission.clientNom?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [searchTerm, missions]);

    // Chargement initial
    useEffect(() => {
        loadMissions();

        intervalRef.current = setInterval(() => {
            loadMissions(false);
        }, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Re-trier quand l'ordre change
    useEffect(() => {
        if (missions.length > 0) {
            const sortedData = sortMissions(missions, sortOrder);
            setMissions(sortedData);
        }
    }, [sortOrder]);

    const handleAcceptMission = async (tripId) => {
        try {
            await tripApi.acceptTrip(tripId);
            toast.success('✅ Mission acceptée avec succès !');
            loadMissions(false);
        } catch (error) {
            toast.error("Erreur lors de l'acceptation");
        }
    };

    const handleTripClick = (trip) => {
        setSelectedTrip(trip);
        setShowDetailModal(true);
        setShowResults(false);
        setSearchTerm('');
    };

    const handleManualRefresh = () => {
        loadMissions(true);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
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

    const getFilteredMissions = () => {
        let filtered = missions;

        if (searchTerm) {
            filtered = filtered.filter(m =>
                m.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.arrivee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.clientNom?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredMissions = getFilteredMissions();

    const stats = {
        total: missions.length,
        urgent: missions.filter(m => m.poids > 100).length,
        longDistance: missions.filter(m => m.distance && m.distance > 50).length
    };

    // Fonction pour formater la date
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

    // Vérifier si une mission est nouvelle (moins de 5 minutes)
    const isNewMission = (dateString) => {
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
                    <p className="mt-4 text-gray-500">Chargement des missions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec statut en temps réel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📋 Missions disponibles</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500">
                            {missions.length} mission{missions.length > 1 ? 's' : ''} disponible{missions.length > 1 ? 's' : ''}
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

            {/* Statistiques en temps réel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total missions</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Colis lourds</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <Package className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Longs trajets</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.longDistance}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Navigation className="w-5 h-5 text-purple-600" />
                        </div>
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
                                placeholder="Rechercher une mission..."
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
                                {searchResults.slice(0, 5).map((mission) => (
                                    <div
                                        key={mission.id}
                                        className="px-3 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex items-center justify-between transition-colors duration-150 border-b border-gray-50 last:border-b-0"
                                        onClick={() => handleTripClick(mission)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">
                                                    Disponible
                                                </span>
                                                <span className="text-xs text-gray-400">#{mission.id?.toString().padStart(6, '0')}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-600">
                                                <span className="truncate">{mission.depart?.split(',')[0]}</span>
                                                <span className="text-gray-300">→</span>
                                                <span className="truncate">{mission.arrivee?.split(',')[0]}</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-green-600 ml-4 whitespace-nowrap">
                                            {mission.prix?.toFixed(2)} €
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
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                        {filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''} affichée{filteredMissions.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Indicateur de recherche active */}
            {searchTerm && filteredMissions.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <Search className="w-3.5 h-3.5" />
                    Résultats pour : <span className="font-medium">"{searchTerm}"</span>
                    <span className="text-gray-400 text-xs ml-1">
                        ({filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''})
                    </span>
                    <button onClick={clearSearch} className="ml-1 text-blue-400 hover:text-blue-600 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Indicateur de mise à jour en temps réel */}
            {isRefreshing && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Mise à jour des missions en cours...
                </div>
            )}

            {/* Liste des missions */}
            {filteredMissions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-10 h-10 text-gray-400" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucune mission disponible'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {searchTerm
                            ? 'Essayez avec d\'autres mots-clés'
                            : 'Revenez plus tard, de nouvelles missions seront disponibles'}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredMissions.map((mission) => {
                        const isNew = isNewMission(mission.createdAt);

                        return (
                            <div
                                key={mission.id}
                                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-300 cursor-pointer overflow-hidden ${isNew ? 'border-l-4 border-l-blue-500' : ''}`}
                                onClick={() => handleTripClick(mission)}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Disponible
                                            </span>
                                            {isNew && (
                                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1 animate-pulse">
                                                    <Sparkles className="w-3 h-3" />
                                                    Nouveau
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400">#{mission.id?.toString().padStart(6, '0')}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-bold text-green-600">
                                                {mission.prix?.toFixed(2)} €
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(mission.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="relative">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                                <div className="absolute top-4 left-0.5 w-0.5 h-6 bg-gray-300"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-400">Départ</p>
                                                <p className="text-sm font-medium text-gray-800 truncate">{mission.depart}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-400">Arrivée</p>
                                                <p className="text-sm font-medium text-gray-800 truncate">{mission.arrivee}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Package className="w-3.5 h-3.5" />
                                            {mission.poids} kg
                                        </span>
                                        {mission.distance && (
                                            <span className="flex items-center gap-1">
                                                <Navigation className="w-3.5 h-3.5" />
                                                {mission.distance.toFixed(1)} km
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(mission.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAcceptMission(mission.id);
                                        }}
                                        className="mt-4 w-full py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        <Truck className="w-4 h-4" />
                                        Accepter la mission
                                    </button>
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