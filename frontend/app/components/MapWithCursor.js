'use client';

import { useState, useEffect, useRef } from 'react';
import { Crosshair, Target } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapWithCursor({
    startLocation,
    endLocation,
    onStartSelect,
    onEndSelect,
    selectionMode
}) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [centerPosition, setCenterPosition] = useState({ lat: 48.8566, lng: 2.3522 });
    const [addressInfo, setAddressInfo] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initialiser la carte
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://tiles.openfreemap.org/styles/liberty',
            center: [centerPosition.lng, centerPosition.lat],
            zoom: 13
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            setMapLoaded(true);
        });

        map.current.on('move', () => {
            const center = map.current.getCenter();
            setCenterPosition({ lat: center.lat, lng: center.lng });
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Ajouter les marqueurs
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Supprimer les anciens marqueurs
        const markers = document.querySelectorAll('.custom-marker');
        markers.forEach(marker => marker.remove());

        // Marqueur départ
        if (startLocation) {
            const startMarker = document.createElement('div');
            startMarker.className = 'custom-marker';
            startMarker.innerHTML = '📍';
            startMarker.style.fontSize = '30px';
            startMarker.style.cursor = 'pointer';

            new maplibregl.Marker(startMarker)
                .setLngLat([startLocation.lng, startLocation.lat])
                .setPopup(new maplibregl.Popup().setHTML(`<strong>Départ</strong><br>${startLocation.address?.split(',')[0] || 'Départ'}`))
                .addTo(map.current);
        }

        // Marqueur arrivée
        if (endLocation) {
            const endMarker = document.createElement('div');
            endMarker.className = 'custom-marker';
            endMarker.innerHTML = '🏁';
            endMarker.style.fontSize = '30px';
            endMarker.style.cursor = 'pointer';

            new maplibregl.Marker(endMarker)
                .setLngLat([endLocation.lng, endLocation.lat])
                .setPopup(new maplibregl.Popup().setHTML(`<strong>Arrivée</strong><br>${endLocation.address?.split(',')[0] || 'Arrivée'}`))
                .addTo(map.current);
        }
    }, [startLocation, endLocation, mapLoaded]);

    // Récupérer l'adresse à partir des coordonnées
    const getAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            return {
                address: data.display_name,
                city: data.address?.city || data.address?.town || data.address?.village,
                street: data.address?.road,
                houseNumber: data.address?.house_number,
                postcode: data.address?.postcode
            };
        } catch (error) {
            console.error('Erreur:', error);
            return { address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
        }
    };

    // Mettre à jour l'adresse quand le centre change
    useEffect(() => {
        const updateAddress = async () => {
            const info = await getAddressFromCoords(centerPosition.lat, centerPosition.lng);
            setAddressInfo(info);
        };
        updateAddress();
    }, [centerPosition]);

    const handleConfirmPosition = () => {
        const fullLocation = {
            ...centerPosition,
            address: addressInfo?.address,
            city: addressInfo?.city,
            street: addressInfo?.street
        };

        if (selectionMode === 'start') {
            onStartSelect(fullLocation);
        } else {
            onEndSelect(fullLocation);
        }
    };

    const handleGeolocation = () => {
        if (navigator.geolocation && map.current) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
                },
                () => {
                    alert('Impossible de récupérer votre position');
                }
            );
        } else {
            alert('Géolocalisation non supportée');
        }
    };

    return (
        <div className="relative">
            {/* Carte */}
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <div
                    ref={mapContainer}
                    style={{ height: '500px', width: '100%' }}
                    className="rounded-xl"
                />

                {/* Curseur cible au centre */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
                    <div className="relative">
                        {/* Cercle extérieur avec animation */}
                        <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full border-2 border-blue-500 animate-ping -translate-x-1/2 -translate-y-1/2"></div>
                        {/* Cercle intérieur */}
                        <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-500 bg-opacity-20"></div>
                        {/* Lignes de visée */}
                        <div className="absolute top-1/2 -left-6 w-5 h-0.5 bg-blue-600 transform -translate-y-1/2"></div>
                        <div className="absolute top-1/2 -right-6 w-5 h-0.5 bg-blue-600 transform -translate-y-1/2"></div>
                        <div className="absolute left-1/2 -top-6 w-0.5 h-5 bg-blue-600 transform -translate-x-1/2"></div>
                        <div className="absolute left-1/2 -bottom-6 w-0.5 h-5 bg-blue-600 transform -translate-x-1/2"></div>
                        {/* Point central */}
                        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                </div>

                {/* Bouton géolocalisation */}
                <button
                    onClick={handleGeolocation}
                    className="absolute bottom-20 right-4 z-[1000] bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition"
                    title="Ma position"
                >
                    <Crosshair className="w-5 h-5 text-blue-600" />
                </button>
            </div>

            {/* Panneau d'information */}
            <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Position sélectionnée</p>
                        <p className="text-sm text-gray-600 mt-1">
                            {addressInfo?.address || 'Déplacez la carte pour choisir un lieu'}
                        </p>
                        {addressInfo?.street && (
                            <p className="text-xs text-gray-500 mt-1">
                                {addressInfo.street} {addressInfo.houseNumber}, {addressInfo.postcode} {addressInfo.city}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleConfirmPosition}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                    >
                        {selectionMode === 'start' ? 'Confirmer départ' : 'Confirmer arrivée'}
                    </button>
                </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 text-center">
                💡 Déplacez la carte pour placer le curseur exactement sur le lieu souhaité, puis confirmez
            </div>
        </div>
    );
}