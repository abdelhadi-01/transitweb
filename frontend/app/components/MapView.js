'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Import dynamique pour éviter les erreurs SSR
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

export default function MapView({ startLocation, endLocation }) {
    const mapRef = useRef(null);

    // Correction des icônes Leaflet (problème connu)
    useEffect(() => {
        const L = require('leaflet');
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    // Calcul du centre de la carte
    const getCenter = () => {
        if (startLocation?.lat && endLocation?.lat) {
            return {
                lat: (startLocation.lat + endLocation.lat) / 2,
                lng: (startLocation.lng + endLocation.lng) / 2
            };
        }
        if (startLocation?.lat) {
            return { lat: startLocation.lat, lng: startLocation.lng };
        }
        if (endLocation?.lat) {
            return { lat: endLocation.lat, lng: endLocation.lng };
        }
        return { lat: 48.8566, lng: 2.3522 }; // Paris par défaut
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getZoom = () => {
        if (startLocation?.lat && endLocation?.lat) {
            const distance = calculateDistance(
                startLocation.lat,
                startLocation.lng,
                endLocation.lat,
                endLocation.lng
            );

            if (distance > 1000) return 4;
            if (distance > 500) return 5;
            if (distance > 200) return 6;
            if (distance > 100) return 7;
            if (distance > 50) return 8;
            if (distance > 20) return 9;
            return 11;
        }

        if (startLocation?.lat || endLocation?.lat) {
            return 13;
        }

        return 6;
    };

    return (
        <div className="h-[300px] rounded-lg overflow-hidden border border-gray-200">
            <MapContainer
                center={getCenter()}
                zoom={getZoom()}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {startLocation?.lat && (
                    <Marker position={[startLocation.lat, startLocation.lng]}>
                        <Popup>
                            <div className="text-green-600 font-semibold">🚀 Départ</div>
                            <div className="text-sm">{startLocation.address?.split(',')[0]}</div>
                        </Popup>
                    </Marker>
                )}
                {endLocation?.lat && (
                    <Marker position={[endLocation.lat, endLocation.lng]}>
                        <Popup>
                            <div className="text-red-600 font-semibold">🏁 Arrivée</div>
                            <div className="text-sm">{endLocation.address?.split(',')[0]}</div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
