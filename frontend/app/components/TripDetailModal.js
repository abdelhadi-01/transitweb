'use client';

import { X, MapPin, Package, Weight, Calendar, User, Euro, Clock, Truck, CheckCircle, Navigation, Phone, Mail, MessageCircle, ArrowLeft, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import TripRouteMap from './TripRouteMap';

export default function TripDetailModal({ trip, onClose, userRole }) {
    const [showFullAddress, setShowFullAddress] = useState(false);

    if (!trip) return null;

    const getStatusText = (status) => {
        const statusMap = {
            PENDING: 'En attente',
            ACCEPTED: 'Accepté',
            IN_PROGRESS: 'En cours',
            COMPLETED: 'Terminé',
            CANCELLED: 'Annulé'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
            IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
            COMPLETED: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100';
    };

    const getStatusIcon = (status) => {
        const icons = {
            PENDING: <Clock className="w-5 h-5" />,
            ACCEPTED: <Truck className="w-5 h-5" />,
            IN_PROGRESS: <Navigation className="w-5 h-5 animate-pulse" />,
            COMPLETED: <CheckCircle className="w-5 h-5" />,
            CANCELLED: <X className="w-5 h-5" />
        };
        return icons[status] || <Clock className="w-5 h-5" />;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (date) => {
        if (!date) return '-';
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        return 'À l\'instant';
    };

    // Vérifier si on a les coordonnées
    const hasCoordinates = trip.startLat && trip.startLng && trip.endLat && trip.endLng;

    // Fonctions de notification
    const showNotification = (message) => {
        toast(message);
    };

    const showSuccess = (message) => {
        toast.success(message);
    };

    const showError = (message) => {
        toast.error(message);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-white z-20 border-b border-gray-100">
                    <div className="flex justify-between items-center p-4 md:p-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Détails du trajet</h2>
                                <p className="text-sm text-gray-500">#{trip.id?.toString().padStart(6, '0')}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-4 md:p-6 space-y-6 max-h-[calc(95vh-80px)]">
                    {/* Statut */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${getStatusColor(trip.statut)}`}>
                                {getStatusIcon(trip.statut)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Statut actuel</p>
                                <p className={`font-semibold ${trip.statut === 'COMPLETED' ? 'text-green-600' : trip.statut === 'IN_PROGRESS' ? 'text-purple-600' : trip.statut === 'ACCEPTED' ? 'text-blue-600' : 'text-yellow-600'}`}>
                                    {getStatusText(trip.statut)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Prix</p>
                            <p className="text-xl font-bold text-green-600">{trip.prix?.toFixed(2)} €</p>
                        </div>
                    </div>

                    {/* Carte du trajet */}
                    {hasCoordinates ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="flex items-center justify-between p-3 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    Visualisation du trajet
                                </h3>
                                <button
                                    onClick={() => showSuccess('Plein écran - Fonctionnalité à venir')}
                                    className="p-1 hover:bg-gray-100 rounded transition"
                                >
                                    <Maximize2 className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                            <TripRouteMap
                                startLat={trip.startLat}
                                startLng={trip.startLng}
                                endLat={trip.endLat}
                                endLng={trip.endLng}
                            />
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center text-sm text-yellow-700">
                            <Navigation className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                            <p>Coordonnées non disponibles pour ce trajet</p>
                            <p className="text-xs text-yellow-500 mt-1">Les données de localisation n'ont pas été enregistrées</p>
                        </div>
                    )}

                    {/* Trajet */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">📍 Itinéraire</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="relative">
                                    <div className="w-4 h-4 bg-green-500 rounded-full mt-1"></div>
                                    <div className="absolute top-6 left-1.5 w-0.5 h-12 bg-gray-300"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Départ</p>
                                    <p className="font-medium text-gray-800">{trip.depart}</p>
                                    {trip.startLat && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            📍 {trip.startLat?.toFixed(6)}, {trip.startLng?.toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-4 h-4 bg-red-500 rounded-full mt-1"></div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400">Arrivée</p>
                                    <p className="font-medium text-gray-800">{trip.arrivee}</p>
                                    {trip.endLat && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            📍 {trip.endLat?.toFixed(6)}, {trip.endLng?.toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(trip.distance) && (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                                <span className="text-gray-500">Distance estimée</span>
                                <span className="font-medium text-blue-600">{trip.distance?.toFixed(1)} km</span>
                            </div>
                        )}
                    </div>

                    {/* Détails du colis */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">📦 Détails du colis</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400">Description</p>
                                <p className="font-medium text-gray-800">{trip.description || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Poids</p>
                                <p className="font-medium text-gray-800">{trip.poids} kg</p>
                            </div>
                        </div>
                    </div>

                    {/* Chronologie */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">⏱️ Chronologie</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Créé le</span>
                                <span className="text-sm font-medium text-gray-800">{formatDate(trip.createdAt)}</span>
                            </div>
                            {trip.startedAt && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Démarré le</span>
                                    <span className="text-sm font-medium text-gray-800">{formatDate(trip.startedAt)}</span>
                                </div>
                            )}
                            {trip.completedAt && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Terminé le</span>
                                    <span className="text-sm font-medium text-gray-800">{formatDate(trip.completedAt)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-sm text-gray-600">Temps écoulé</span>
                                <span className="text-sm font-medium text-gray-800">{getTimeAgo(trip.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Personnes */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">👥 Participants</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                                        {trip.clientNom?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{trip.clientNom}</p>
                                        <p className="text-xs text-gray-400">Client</p>
                                    </div>
                                </div>
                                {userRole === 'CHAUFFEUR' && (
                                    <button
                                        onClick={() => showSuccess('💬 Messagerie - Fonctionnalité à venir')}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            {trip.chauffeurNom && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                            {trip.chauffeurNom?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{trip.chauffeurNom}</p>
                                            <p className="text-xs text-gray-400">Chauffeur</p>
                                        </div>
                                    </div>
                                    {userRole === 'CLIENT' && (
                                        <button
                                            onClick={() => showSuccess('💬 Messagerie - Fonctionnalité à venir')}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {userRole === 'CLIENT' && trip.statut === 'IN_PROGRESS' && (
                            <button
                                onClick={() => showSuccess('🗺️ Suivi en direct - Fonctionnalité à venir')}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition"
                            >
                                <Navigation className="w-5 h-5" />
                                Suivre en direct
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}