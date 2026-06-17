'use client';

import { useState } from 'react';
import {
    X,
    MapPin,
    RefreshCw,
    CheckCircle,
    Ruler,
    DollarSign,
    Package,
    Truck,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import SimpleMap from './SimpleMap';

export default function CreateTripForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        description: '',
        poids: ''
    });
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);
    const [selectionMode, setSelectionMode] = useState('start');
    const [step, setStep] = useState(1);

    // Calcul de distance (formule Haversine)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Calcul du prix estimé
    const calculatePrice = (distance, poids = 0) => {
        const prixBase = 5;
        const prixParKm = 0.5;
        const prixParKg = 0.2;
        return prixBase + (distance * prixParKm) + (poids * prixParKg);
    };

    // Obtenir les infos de distance et prix
    const getDistanceInfo = () => {
        if (!startLocation || !endLocation) return null;
        const distance = calculateDistance(
            startLocation.lat, startLocation.lng,
            endLocation.lat, endLocation.lng
        );
        const poids = parseFloat(formData.poids) || 0;
        return {
            distance: distance,
            prix: calculatePrice(distance, poids),
            poids: poids
        };
    };

    const distanceInfo = getDistanceInfo();

    const handleStartSelect = (location) => {
        setStartLocation(location);
        toast.success('📍 Point de départ sélectionné');
        setSelectionMode('end');
    };

    const handleEndSelect = (location) => {
        setEndLocation(location);
        toast.success('📍 Point d\'arrivée sélectionné');
    };

    const handleNext = () => {
        if (!startLocation) {
            toast.error('Veuillez sélectionner le point de départ');
            return;
        }
        if (!endLocation) {
            toast.error('Veuillez sélectionner le point d\'arrivée');
            return;
        }
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.poids) {
            toast.error('Veuillez indiquer le poids du colis');
            return;
        }

        if (!startLocation || !endLocation) {
            toast.error('Veuillez sélectionner les points de départ et d\'arrivée');
            return;
        }

        const tripData = {
            depart: startLocation.address,
            arrivee: endLocation.address,
            description: formData.description,
            poids: parseFloat(formData.poids),
            startLat: startLocation.lat,
            startLng: startLocation.lng,
            endLat: endLocation.lat,
            endLng: endLocation.lng,
            distance: distanceInfo?.distance || 0,
            prix: distanceInfo?.prix || 0
        };

        console.log('📤 Données envoyées:', tripData);
        onSubmit(tripData);
    };

    // Étape 1 : Sélection sur la carte
    if (step === 1) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white z-10 rounded-t-2xl border-b border-gray-100">
                        <div className="flex justify-between items-center p-4 md:p-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                    {selectionMode === 'start' ? '📍 Sélectionnez le départ' : '🏁 Sélectionnez l\'arrivée'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectionMode === 'start'
                                        ? 'Choisissez où vous souhaitez être pris en charge'
                                        : 'Choisissez où vous souhaitez être déposé'}
                                </p>
                            </div>
                            <button
                                onClick={onCancel}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        <div className="flex mb-6">
                            <div className="flex-1 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    startLocation
                                        ? 'bg-green-500 text-white'
                                        : selectionMode === 'start'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {startLocation ? '✓' : '1'}
                                </div>
                                <div className={`flex-1 h-1 rounded-full ${
                                    startLocation ? 'bg-green-500' : 'bg-gray-200'
                                }`}></div>
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    endLocation
                                        ? 'bg-green-500 text-white'
                                        : selectionMode === 'end'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {endLocation ? '✓' : '2'}
                                </div>
                            </div>
                        </div>

                        <SimpleMap
                            onSelectLocation={(location) => {
                                if (selectionMode === 'start') {
                                    handleStartSelect(location);
                                } else {
                                    handleEndSelect(location);
                                }
                            }}
                            selectionMode={selectionMode}
                            startLocation={startLocation}
                            endLocation={endLocation}
                            itemWeight={formData.poids}
                        />

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {startLocation && (
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-green-700">DÉPART</p>
                                            <p className="text-sm text-gray-700 truncate">
                                                {startLocation.address?.split(',')[0] || startLocation.address}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setStartLocation(null);
                                                setSelectionMode('start');
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Modifier
                                        </button>
                                    </div>
                                </div>
                            )}
                            {endLocation && (
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-red-700">ARRIVÉE</p>
                                            <p className="text-sm text-gray-700 truncate">
                                                {endLocation.address?.split(',')[0] || endLocation.address}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEndLocation(null);
                                                setSelectionMode('end');
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Modifier
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {distanceInfo && distanceInfo.distance > 0 && (
                            <div className="mt-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-5 border border-blue-200">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                            <Ruler className="w-4 h-4" />
                                            Distance estimée
                                        </div>
                                        <div className="text-xl font-bold text-blue-600 mt-1">
                                            {distanceInfo.distance.toFixed(1)} km
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                            <Package className="w-4 h-4" />
                                            Poids
                                        </div>
                                        <div className="text-xl font-bold text-purple-600 mt-1">
                                            {distanceInfo.poids} kg
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                            <DollarSign className="w-4 h-4" />
                                            Prix estimé
                                        </div>
                                        <div className="text-xl font-bold text-green-600 mt-1">
                                            {distanceInfo.prix.toFixed(2)} €
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!startLocation || !endLocation}
                                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105"
                            >
                                Suivant
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Étape 2 : Détails du colis
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 rounded-t-2xl border-b border-gray-100">
                    <div className="flex justify-between items-center p-4 md:p-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Détails du colis</h2>
                            <p className="text-sm text-gray-500">Complétez les informations</p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MapPin className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-green-600">DÉPART</p>
                                <p className="text-sm text-gray-700 truncate">
                                    {startLocation?.address?.split(',')[0] || 'Non sélectionné'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MapPin className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-red-600">ARRIVÉE</p>
                                <p className="text-sm text-gray-700 truncate">
                                    {endLocation?.address?.split(',')[0] || 'Non sélectionné'}
                                </p>
                            </div>
                        </div>

                        {distanceInfo && distanceInfo.distance > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
                                <div className="text-center bg-blue-50 rounded-lg p-2">
                                    <p className="text-xs text-gray-500">Distance</p>
                                    <p className="font-bold text-blue-600">{distanceInfo.distance.toFixed(1)} km</p>
                                </div>
                                <div className="text-center bg-green-50 rounded-lg p-2">
                                    <p className="text-xs text-gray-500">Prix estimé</p>
                                    <p className="font-bold text-green-600">{distanceInfo.prix.toFixed(2)} €</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleBack}
                            className="w-full text-xs text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 mt-1"
                        >
                            <ChevronLeft className="w-3 h-3" />
                            Modifier les positions
                        </button>
                    </div>

                    {/* Description - Texte en noir */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description du colis
                            <span className="text-xs text-gray-400 ml-1">(optionnel)</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 bg-white"
                            rows="3"
                            placeholder="Ex: Canapé 3 places, fragile, dimensions 200x80x90..."
                        />
                    </div>

                    {/* Poids - Texte en noir */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Poids (kg) *
                        </label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                required
                                step="0.1"
                                min="0.1"
                                value={formData.poids}
                                onChange={(e) => setFormData({ ...formData, poids: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 bg-white"
                                placeholder="Ex: 5.5"
                            />
                        </div>
                        {distanceInfo && distanceInfo.poids > 0 && (
                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                Poids pris en compte : {distanceInfo.poids} kg
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                        >
                            <Truck className="w-4 h-4" />
                            Créer la demande
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}