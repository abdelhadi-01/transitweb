'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripApi, adminApi } from '@/lib/api';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Edit2,
    Save,
    X,
    Shield,
    Truck,
    Package,
    ArrowLeft,
    Camera,
    CheckCircle,
    Clock,
    Award,
    TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const SimpleMap = dynamic(() => import('../../components/SimpleMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
            <div className="text-sm text-gray-400">Chargement de la carte...</div>
        </div>
    )
});

const normalizeTrips = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        role: ''
    });
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [stats, setStats] = useState({
        totalTrips: 0,
        completedTrips: 0,
        pendingTrips: 0,
        inProgressTrips: 0,
        totalDistance: 0,
        completionRate: 0
    });

    const loadUserStats = useCallback(async () => {
        try {
            let response;
            if (user?.role === 'ADMIN') {
                response = await adminApi.getTrips();
            } else if (user?.role === 'CHAUFFEUR') {
                response = await tripApi.getChauffeurTrips();
            } else {
                response = await tripApi.getClientTrips();
            }

            const trips = normalizeTrips(response?.data).sort(
                (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );

            const totalTrips = trips.length;
            const completedTrips = trips.filter((trip) => trip.statut === 'COMPLETED').length;
            const pendingTrips = trips.filter((trip) => trip.statut === 'PENDING').length;
            const inProgressTrips = trips.filter(
                (trip) => trip.statut === 'IN_PROGRESS' || trip.statut === 'ACCEPTED'
            ).length;
            const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
            const completionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;

            setStats({
                totalTrips,
                completedTrips,
                pendingTrips,
                inProgressTrips,
                totalDistance,
                completionRate
            });
        } catch (error) {
            console.error('Erreur stats:', error);
            setStats({
                totalTrips: 0,
                completedTrips: 0,
                pendingTrips: 0,
                inProgressTrips: 0,
                totalDistance: 0,
                completionRate: 0
            });
        }
    }, [user]);

    const getUserLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        address: 'Position actuelle'
                    });
                },
                () => {
                    setUserLocation({
                        lat: 33.5731,
                        lng: -7.5898,
                        address: 'Casablanca, Maroc'
                    });
                }
            );
        } else {
            setUserLocation({
                lat: 33.5731,
                lng: -7.5898,
                address: 'Casablanca, Maroc'
            });
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const timer = setTimeout(() => {
            void loadUserStats();
            getUserLocation();
        }, 0);

        return () => clearTimeout(timer);
    }, [user, loadUserStats, getUserLocation]);

    const displayProfile = isEditing
        ? formData
        : {
            nom: user?.nom || '',
            email: user?.email || '',
            telephone: user?.telephone || '',
            role: user?.role || ''
        };

    const handleSave = async () => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Profil mis a jour avec succes !');
            setIsEditing(false);
        } catch {
            toast.error('Erreur lors de la mise a jour');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            nom: user?.nom || '',
            email: user?.email || '',
            telephone: user?.telephone || '',
            role: user?.role || ''
        });
        setIsEditing(false);
    };

    const getRoleIcon = (role) => {
        const icons = {
            CLIENT: <User className="w-5 h-5" />,
            CHAUFFEUR: <Truck className="w-5 h-5" />,
            ADMIN: <Shield className="w-5 h-5" />
        };
        return icons[role] || <User className="w-5 h-5" />;
    };

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

    const statCards = [
        {
            icon: Package,
            label: 'Total trajets',
            value: stats.totalTrips,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            icon: Clock,
            label: 'En attente',
            value: stats.pendingTrips,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600'
        },
        {
            icon: Truck,
            label: 'En cours',
            value: stats.inProgressTrips,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            icon: CheckCircle,
            label: 'Termines',
            value: stats.completedTrips,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            icon: TrendingUp,
            label: 'Distance totale',
            value: `${stats.totalDistance.toFixed(1)} km`,
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600'
        },
        {
            icon: Award,
            label: 'Taux de completion',
            value: `${stats.completionRate}%`,
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/dashboard/client"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour au tableau de bord
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-4 border-white/50">
                                            <span className="text-4xl font-bold text-white">
                                                {(displayProfile.nom || '?').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <button
                                            className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition"
                                            onClick={() => toast.success('Fonctionnalite a venir')}
                                        >
                                            <Camera className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h1 className="text-2xl font-bold text-white">{displayProfile.nom}</h1>
                                        <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(displayProfile.role)}`}>
                                                {getRoleIcon(displayProfile.role)}
                                                {getRoleLabel(displayProfile.role)}
                                            </span>
                                        </div>
                                        <p className="text-white/80 text-sm mt-2">
                                            Membre depuis {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isEditing ? (
                                            <button
                                                onClick={() => {
                                                    setFormData({
                                                        nom: user?.nom || '',
                                                        email: user?.email || '',
                                                        telephone: user?.telephone || '',
                                                        role: user?.role || ''
                                                    });
                                                    setIsEditing(true);
                                                }}
                                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Modifier
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition font-medium"
                                                >
                                                    {loading ? (
                                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4" />
                                                            Sauvegarder
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">Nom complet</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={formData.nom}
                                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                                        className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{displayProfile.nom}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">Email</p>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{displayProfile.email}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">Telephone</p>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        value={formData.telephone || ''}
                                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                                        className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Non renseigne"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{displayProfile.telephone || 'Non renseigne'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">Role</p>
                                                <p className="font-medium text-gray-900">{getRoleLabel(displayProfile.role)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    Position
                                </h3>
                            </div>
                            <div className="p-4">
                                {userLocation && (
                                    <div className="h-[180px] rounded-lg overflow-hidden">
                                        <SimpleMap
                                            onSelectLocation={() => {}}
                                            selectionMode="view"
                                            startLocation={userLocation}
                                            endLocation={null}
                                            itemWeight={0}
                                        />
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    {userLocation?.address || 'Position non disponible'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-yellow-500" />
                                    Statistiques
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {statCards.map((stat, index) => (
                                        <div key={index} className={`${stat.bgColor} rounded-xl p-3 text-center`}>
                                            <stat.icon className={`w-4 h-4 ${stat.textColor} mx-auto`} />
                                            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                            <p className="text-xs text-gray-500">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
