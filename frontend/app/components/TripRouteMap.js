'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function TripRouteMap({ startLat, startLng, endLat, endLng }) {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Calculer le centre entre les deux points
        const centerLat = (startLat + endLat) / 2;
        const centerLng = (startLng + endLng) / 2;

        // Initialiser la carte
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://tiles.openfreemap.org/styles/liberty',
            center: [centerLng, centerLat],
            zoom: 12,
            attributionControl: false,
        });

        map.current.addControl(new maplibregl.AttributionControl(), 'bottom-right');

        // Ajouter les marqueurs après le chargement
        map.current.on('load', () => {
            // Marqueur de départ (vert)
            const startMarker = document.createElement('div');
            startMarker.className = 'custom-marker start-marker';
            startMarker.innerHTML = `
                <div class="relative">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                    <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rotate-45"></div>
                </div>
            `;

            new maplibregl.Marker(startMarker)
                .setLngLat([startLng, startLat])
                .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
                    <div class="p-2">
                        <div class="font-semibold text-green-600">🚀 Départ</div>
                        <div class="text-xs text-gray-500">${startLat.toFixed(6)}, ${startLng.toFixed(6)}</div>
                    </div>
                `))
                .addTo(map.current);

            // Marqueur d'arrivée (rouge)
            const endMarker = document.createElement('div');
            endMarker.className = 'custom-marker end-marker';
            endMarker.innerHTML = `
                <div class="relative">
                    <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                    <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
                </div>
            `;

            new maplibregl.Marker(endMarker)
                .setLngLat([endLng, endLat])
                .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
                    <div class="p-2">
                        <div class="font-semibold text-red-600">🏁 Arrivée</div>
                        <div class="text-xs text-gray-500">${endLat.toFixed(6)}, ${endLng.toFixed(6)}</div>
                    </div>
                `))
                .addTo(map.current);

            // Tracer la ligne entre les deux points
            const geojson = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [startLng, startLat],
                        [endLng, endLat]
                    ]
                }
            };

            map.current.addSource('route', {
                type: 'geojson',
                data: geojson
            });

            map.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3B82F6',
                    'line-width': 4,
                    'line-opacity': 0.8,
                    'line-dasharray': [8, 4]
                }
            });

            // Ajouter un effet de glow sur la ligne
            map.current.addLayer({
                id: 'route-glow',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#60A5FA',
                    'line-width': 8,
                    'line-opacity': 0.3
                }
            });

            // Ajouter le cercle de départ (vert)
            map.current.addSource('start-circle', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [startLng, startLat]
                    }
                }
            });

            map.current.addLayer({
                id: 'start-circle',
                type: 'circle',
                source: 'start-circle',
                paint: {
                    'circle-radius': 12,
                    'circle-color': '#22C55E',
                    'circle-opacity': 0.3,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#16A34A'
                }
            });

            // Ajouter le cercle d'arrivée (rouge)
            map.current.addSource('end-circle', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [endLng, endLat]
                    }
                }
            });

            map.current.addLayer({
                id: 'end-circle',
                type: 'circle',
                source: 'end-circle',
                paint: {
                    'circle-radius': 12,
                    'circle-color': '#EF4444',
                    'circle-opacity': 0.3,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#DC2626'
                }
            });

            // Ajuster le zoom pour montrer tout le trajet
            const bounds = new maplibregl.LngLatBounds()
                .extend([startLng, startLat])
                .extend([endLng, endLat]);

            map.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15,
                duration: 1000
            });
        });

        // Nettoyage
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [startLat, startLng, endLat, endLng]);

    return (
        <div className="relative rounded-xl overflow-hidden">
            <div ref={mapContainer} className="w-full h-[300px]" />

            {/* Légende */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs space-y-1 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Départ</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Arrivée</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-blue-500"></div>
                    <span className="text-gray-700">Trajet</span>
                </div>
            </div>

            {/* Badge distance */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 text-sm font-medium text-blue-600 z-10">
                📏 {calculateDistance(startLat, startLng, endLat, endLng).toFixed(1)} km
            </div>
        </div>
    );
}

// Calcul de distance (formule Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}