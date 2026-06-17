'use client';

import { useState, useEffect } from 'react';
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
    Plus,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import TripCard from '../../components/TripCard';
import TripDetailModal from '../../components/TripDetailModal';
import CreateTripForm from '../../components/CreateTripForm';
import StatCard from '../../components/StatCard';

export default function ClientDashboard() {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
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

    const loadTrips = async () => {
        try {
            const response = await tripApi.getClientTrips();
            setTrips(response.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des trajets');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async (tripData) => {
        try {
            await tripApi.create(tripData);
            toast.success('Demande de transport créée avec succès');
            setShowCreateForm(false);
            loadTrips();
        } catch (error) {
            toast.error("Erreur lors de la création");
        }
    };

    const handleTripClick = (trip) => {
        setSelectedTrip(trip);
        setShowDetailModal(true);
    };

    const recentTrips = trips.slice(0, 4);

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


                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-100 transition-all duration-300 hover:scale-105"
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle demande
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total trajets" value={stats.total} icon={Package} color="bg-blue-500" />
                <StatCard title="En attente" value={stats.pending} icon={Clock} color="bg-yellow-500" />
                <StatCard title="En cours" value={stats.inProgress} icon={Truck} color="bg-purple-500" />
                <StatCard title="Terminés" value={stats.completed} icon={CheckCircle} color="bg-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Trajets récents</h2>
                        <Link href="/dashboard/trips" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            Voir tout
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {recentTrips.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">Aucun trajet</h3>
                            <p className="text-gray-500 text-sm mt-1">Commencez par créer votre première demande</p>
                            <button onClick={() => setShowCreateForm(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                + Créer une demande
                            </button>
                        </div>
                    ) : (
                        recentTrips.map((trip) => (
                            <div key={trip.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 cursor-pointer hover:border-blue-300 overflow-hidden" onClick={() => handleTripClick(trip)}>
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
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
                                        <span className="text-sm font-bold text-green-600">{trip.prix?.toFixed(2)} €</span>
                                    </div>

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

                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
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
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(trip.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
                        <Truck className="w-10 h-10 mb-3 opacity-80" />
                        <h3 className="text-lg font-semibold">Besoin d'un transport ?</h3>
                        <p className="text-sm text-white/80 mt-1">Créez une demande en quelques clics</p>
                        <button onClick={() => setShowCreateForm(true)} className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition">
                            Nouvelle demande →
                        </button>
                    </div>
                </div>
            </div>

            {showCreateForm && (
                <CreateTripForm onSubmit={handleCreateTrip} onCancel={() => setShowCreateForm(false)} />
            )}

            {showDetailModal && selectedTrip && (
                <TripDetailModal trip={selectedTrip} onClose={() => { setShowDetailModal(false); setSelectedTrip(null); }} userRole="CLIENT" />
            )}
        </div>
    );
}