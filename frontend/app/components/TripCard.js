'use client';

import { MapPin, Package, Weight, Calendar, User, Clock, CheckCircle, Truck, Navigation, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function TripCard({ trip, userRole, onAccept, onStart, onComplete, onClick }) {
    const getStatusText = (status) => {
        const statusMap = {
            PENDING: 'En attente',
            ACCEPTED: 'Accepté',
            IN_PROGRESS: 'En cours',
            COMPLETED: 'Terminé'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
            IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
            COMPLETED: 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[status] || 'bg-gray-100';
    };

    const getStatusIcon = (status) => {
        const icons = {
            PENDING: <Clock className="w-4 h-4" />,
            ACCEPTED: <Truck className="w-4 h-4" />,
            IN_PROGRESS: <Navigation className="w-4 h-4 animate-pulse" />,
            COMPLETED: <CheckCircle className="w-4 h-4" />
        };
        return icons[status] || <Clock className="w-4 h-4" />;
    };

    return (
        <div
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer hover:border-blue-300"
            onClick={onClick}
        >
            <div className="p-5">
                {/* En-tête avec statut */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${getStatusColor(trip.statut)}`}>
                            {getStatusIcon(trip.statut)}
                            {getStatusText(trip.statut)}
                        </span>
                        <span className="text-xs text-gray-400">
                            #{trip.id?.toString().padStart(6, '0')}
                        </span>
                    </div>
                    {trip.prix && (
                        <span className="text-lg font-bold text-green-600">
                            {formatCurrency(trip.prix)}
                        </span>
                    )}
                </div>

                {/* Trajet */}
                <div className="space-y-2">
                    <div className="flex items-start gap-3">
                        <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                            <div className="absolute top-5 left-1.5 w-0.5 h-8 bg-gray-300"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">Départ</p>
                            <p className="font-medium text-gray-800 truncate">{trip.depart}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">Arrivée</p>
                            <p className="font-medium text-gray-800 truncate">{trip.arrivee}</p>
                        </div>
                    </div>
                </div>

                {/* Détails */}
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                    {trip.description && (
                        <div className="flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[120px]">{trip.description}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Weight className="w-4 h-4 text-gray-400" />
                        <span>{trip.poids} kg</span>
                    </div>
                    {trip.distance && (
                        <div className="flex items-center gap-1.5">
                            <Navigation className="w-4 h-4 text-gray-400" />
                            <span>{trip.distance.toFixed(1)} km</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {userRole === 'CHAUFFEUR' && trip.statut === 'PENDING' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAccept(); }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm"
                        >
                            <Truck className="w-4 h-4" />
                            Accepter
                        </button>
                    )}

                    {userRole === 'CHAUFFEUR' && trip.statut === 'ACCEPTED' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onStart(); }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm"
                        >
                            <Navigation className="w-4 h-4" />
                            Démarrer
                        </button>
                    )}

                    {userRole === 'CHAUFFEUR' && trip.statut === 'IN_PROGRESS' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onComplete(); }}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Terminer
                        </button>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5 text-sm"
                    >
                        <Eye className="w-4 h-4" />
                        Détails
                    </button>
                </div>
            </div>
        </div>
    );
}
