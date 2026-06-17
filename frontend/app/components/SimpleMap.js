'use client';

import { useState, useRef, useEffect } from 'react';
import { Crosshair, MapPin, Check, Move, Search } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import toast from 'react-hot-toast';

export default function SimpleMap({ onSelectLocation, selectionMode, startLocation, endLocation, itemWeight }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [center, setCenter] = useState({ lat: 33.5731, lng: -7.5898 });
    const [zoom, setZoom] = useState(14);
    const [isDragging, setIsDragging] = useState(false);
    const [currentCenter, setCurrentCenter] = useState({ lat: 33.5731, lng: -7.5898 });
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [distanceInfo, setDistanceInfo] = useState(null);

    // Calcul de distance (formule Haversine)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Calcul du prix estimé avec poids
    const calculatePrice = (distance, poids = 0) => {
        const prixBase = 5; // Prix de base en €
        const prixParKm = 0.5; // € par km
        const prixParKg = 0.2; // € par kg
        return prixBase + (distance * prixParKm) + (poids * prixParKg);
    };

    // Mettre à jour la distance quand les points ou le poids changent
    useEffect(() => {
        if (startLocation && endLocation) {
            const distance = calculateDistance(
                startLocation.lat, startLocation.lng,
                endLocation.lat, endLocation.lng
            );
            const poids = parseFloat(itemWeight) || 0;
            setDistanceInfo({
                distance: distance,
                price: calculatePrice(distance, poids),
                poids: poids
            });
        } else {
            setDistanceInfo(null);
        }
    }, [startLocation, endLocation, itemWeight]);

    // Initialiser la carte
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://tiles.openfreemap.org/styles/liberty',
            center: [center.lng, center.lat],
            zoom: zoom,
            attributionControl: true,
        });

        // Contrôles de navigation
        map.current.addControl(new maplibregl.NavigationControl({
            showZoom: true,
            showCompass: false,
        }), 'top-right');

        // Chargement terminé
        map.current.on('load', () => {
            setIsMapLoaded(true);
        });

        // Mouvement de la carte
        map.current.on('move', () => {
            const mapCenter = map.current.getCenter();
            const newCenter = { lat: mapCenter.lat, lng: mapCenter.lng };
            setCurrentCenter(newCenter);
            setCenter(newCenter);
        });

        // Début du glissement
        map.current.on('dragstart', () => {
            setIsDragging(true);
        });

        // Fin du glissement
        map.current.on('dragend', () => {
            setIsDragging(false);
        });

        // Nettoyage
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Mettre à jour la vue quand zoom change
    useEffect(() => {
        if (map.current && isMapLoaded) {
            map.current.setZoom(zoom);
        }
    }, [zoom]);

    // Mettre à jour la vue quand center change
    useEffect(() => {
        if (map.current && isMapLoaded && !isDragging) {
            map.current.flyTo({
                center: [center.lng, center.lat],
                duration: 300,
            });
        }
    }, [center, isDragging]);

    // Recherche d'adresse
    const searchAddress = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Sélectionner un résultat de recherche
    const handleSelectResult = async (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setCenter({ lat, lng });
        setZoom(16);
        setSelectedAddress(result.display_name);
        setSearchResults([]);
        setSearchQuery('');
        setShowSearch(false);

        if (map.current && isMapLoaded) {
            map.current.flyTo({
                center: [lng, lat],
                zoom: 16,
                duration: 500,
            });
        }

        onSelectLocation({
            lat: lat,
            lng: lng,
            address: result.display_name
        });
        toast.success(`📍 ${selectionMode === 'start' ? 'Départ' : 'Arrivée'} sélectionné`);
    };

    // Utiliser la position actuelle
    const handleGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCenter({ lat: latitude, lng: longitude });
                    setZoom(16);

                    if (map.current && isMapLoaded) {
                        map.current.flyTo({
                            center: [longitude, latitude],
                            zoom: 16,
                            duration: 500,
                        });
                    }

                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        const address = data.display_name || `${latitude}, ${longitude}`;
                        setSelectedAddress(address);
                        onSelectLocation({
                            lat: latitude,
                            lng: longitude,
                            address: address
                        });
                        toast.success('📍 Position actuelle sélectionnée');
                    } catch (error) {
                        onSelectLocation({
                            lat: latitude,
                            lng: longitude,
                            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                        });
                    }
                },
                () => toast.error('Impossible de récupérer votre position')
            );
        } else {
            toast.error('Géolocalisation non supportée');
        }
    };

    // Sélectionner la position actuelle
    const handleSelectCurrentPosition = async () => {
        const lat = currentCenter.lat;
        const lng = currentCenter.lng;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setSelectedAddress(address);
            onSelectLocation({
                lat: lat,
                lng: lng,
                address: address
            });
            toast.success(`📍 ${selectionMode === 'start' ? 'Départ' : 'Arrivée'} sélectionné !`);
        } catch (error) {
            onSelectLocation({
                lat: lat,
                lng: lng,
                address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            });
        }
    };

    return (
        <div className="space-y-3">
            {/* Barre de recherche */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                searchAddress(e.target.value);
                                setShowSearch(true);
                            }}
                            onFocus={() => setShowSearch(true)}
                            placeholder="Rechercher une adresse..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleGeolocation}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                    >
                        <Crosshair className="w-4 h-4" />
                        Ma position
                    </button>
                </div>

                {/* Résultats de recherche */}
                {showSearch && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelectResult(result)}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
                            >
                                <div className="font-medium text-sm">{result.display_name.split(',')[0]}</div>
                                <div className="text-xs text-gray-500">{result.display_name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Carte WebGL */}
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <div
                    ref={mapContainer}
                    className="w-full"
                    style={{ height: '450px' }}
                />

                {/* Indicateur de chargement */}
                {!isMapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <div className="text-sm text-gray-500">Chargement de la carte...</div>
                        </div>
                    </div>
                )}

                {/* Curseur cible (overlay) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                    <div className="relative">
                        <div className={`absolute top-1/2 left-1/2 w-16 h-16 rounded-full border-2 border-blue-500 -translate-x-1/2 -translate-y-1/2 ${
                            isDragging ? 'opacity-50 scale-75' : 'animate-ping'
                        }`}></div>
                        <div className={`w-10 h-10 rounded-full border-2 border-blue-600 bg-blue-500 bg-opacity-20 transition-all ${
                            isDragging ? 'scale-75' : ''
                        }`}></div>
                        <div className="absolute top-1/2 -left-6 w-5 h-0.5 bg-blue-600 transform -translate-y-1/2"></div>
                        <div className="absolute top-1/2 -right-6 w-5 h-0.5 bg-blue-600 transform -translate-y-1/2"></div>
                        <div className="absolute left-1/2 -top-6 w-0.5 h-5 bg-blue-600 transform -translate-x-1/2"></div>
                        <div className="absolute left-1/2 -bottom-6 w-0.5 h-5 bg-blue-600 transform -translate-x-1/2"></div>
                        <div className={`absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                            isDragging ? 'animate-pulse' : ''
                        }`}></div>
                    </div>
                </div>

                {/* Indicateur d'état */}
                <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-30 px-4 py-1.5 rounded-full text-xs flex items-center gap-2 transition-all ${
                    isDragging
                        ? 'bg-blue-600 text-white'
                        : 'bg-black bg-opacity-70 text-white'
                }`}>
                    {isDragging ? (
                        <>
                            <Move className="w-3 h-3 animate-pulse" />
                            Déplacement...
                        </>
                    ) : (
                        <>
                            <MapPin className="w-3 h-3" />
                            {currentCenter.lat.toFixed(4)}, {currentCenter.lng.toFixed(4)}
                        </>
                    )}
                </div>

                {/* Bouton de sélection */}
                <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30 transition-all ${
                    isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                }`}>
                    <button
                        onClick={handleSelectCurrentPosition}
                        disabled={isDragging}
                        className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition font-medium ${
                            isDragging ? 'cursor-not-allowed' : 'hover:scale-105'
                        }`}
                    >
                        <Check className="w-5 h-5" />
                        Sélectionner cette position
                    </button>
                </div>

                {/* Attribution */}
                <div className="absolute bottom-1 right-1 text-[10px] text-gray-600 bg-white bg-opacity-80 px-1 rounded z-30">
                    © OpenFreeMap | OpenStreetMap
                </div>
            </div>

            {/* Affichage distance et prix estimé avec poids */}
            {distanceInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow p-4 border border-blue-200">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <div className="text-xs text-gray-500">📏 Distance</div>
                            <div className="text-lg font-bold text-blue-600">
                                {distanceInfo.distance.toFixed(1)} km
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-500">⚖️ Poids</div>
                            <div className="text-lg font-bold text-purple-600">
                                {distanceInfo.poids} kg
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-gray-500">💰 Prix estimé</div>
                            <div className="text-lg font-bold text-green-600">
                                {distanceInfo.price.toFixed(2)} €
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-400 mt-2">
                        {distanceInfo.poids > 0
                            ? `Prix calculé : 5€ + (${distanceInfo.distance.toFixed(1)} km × 0.5€) + (${distanceInfo.poids} kg × 0.2€) = ${distanceInfo.price.toFixed(2)}€`
                            : `Prix calculé : 5€ + (${distanceInfo.distance.toFixed(1)} km × 0.5€) = ${distanceInfo.price.toFixed(2)}€`
                        }
                    </div>
                </div>
            )}

            {/* Résumé */}
            <div className="bg-white rounded-lg shadow p-3">
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">
                        {selectedAddress ? (
                            <span className="font-medium text-gray-800">{selectedAddress.split(',')[0]}</span>
                        ) : (
                            "Glissez la carte pour choisir une position"
                        )}
                    </span>
                </div>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                        <span className="font-medium">🖱️ Glissez</span> sur la carte pour naviguer
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="font-medium">➕/-</span> pour zoomer
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Check className="w-4 h-4" />
                        Cliquez sur le bouton pour confirmer
                    </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    📍 Le curseur rouge indique la position qui sera sélectionnée
                </div>
            </div>
        </div>
    );
}