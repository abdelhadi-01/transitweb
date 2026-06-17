'use client';

import { useState, useEffect } from 'react';
import { Target, MapPin, Crosshair, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InteractiveMap({
    startLocation,
    endLocation,
    onStartSelect,
    onEndSelect,
    selectionMode,
    onCenterPosition
}) {
    const [addressInfo, setAddressInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [manualAddress, setManualAddress] = useState('');

    // Récupérer l'adresse à partir des coordonnées (reverse geocoding)
    const getAddressFromCoords = async (lat, lng) => {
        setIsLoading(true);
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
                postcode: data.address?.postcode,
                country: data.address?.country,
                lat: lat,
                lng: lng
            };
        } catch (error) {
            console.error('Erreur:', error);
            return { address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng };
        } finally {
            setIsLoading(false);
        }
    };

    // Recherche d'adresse
    const searchAddress = async (query) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la recherche');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        searchAddress(value);
    };

    const handleSelectSearchResult = async (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const location = await getAddressFromCoords(lat, lng);

        if (selectionMode === 'start') {
            onStartSelect(location);
            toast.success('Point de départ sélectionné');
        } else {
            onEndSelect(location);
            toast.success("Point d'arrivée sélectionné");
        }

        setSearchQuery('');
        setSearchResults([]);
        setShowSearch(false);
    };

    const handleManualAddress = async () => {
        if (!manualAddress.trim()) {
            toast.error('Veuillez entrer une adresse');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json&addressdetails=1&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                const location = await getAddressFromCoords(lat, lng);

                if (selectionMode === 'start') {
                    onStartSelect(location);
                    toast.success('Point de départ sélectionné');
                } else {
                    onEndSelect(location);
                    toast.success("Point d'arrivée sélectionné");
                }
                setManualAddress('');
            } else {
                toast.error('Adresse non trouvée');
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la recherche');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeolocation = async () => {
        if (navigator.geolocation) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const location = await getAddressFromCoords(latitude, longitude);

                    if (selectionMode === 'start') {
                        onStartSelect(location);
                        toast.success('Position actuelle sélectionnée comme départ');
                    } else {
                        onEndSelect(location);
                        toast.success('Position actuelle sélectionnée comme arrivée');
                    }
                    setIsLoading(false);
                },
                (error) => {
                    console.error('Erreur:', error);
                    toast.error('Impossible de récupérer votre position');
                    setIsLoading(false);
                }
            );
        } else {
            toast.error('Géolocalisation non supportée');
        }
    };

    // Afficher l'adresse sélectionnée actuelle
    useEffect(() => {
        const currentLocation = selectionMode === 'start' ? startLocation : endLocation;
        if (currentLocation) {
            setAddressInfo(currentLocation);
        } else {
            setAddressInfo(null);
        }
    }, [startLocation, endLocation, selectionMode]);

    return (
        <div className="space-y-4">
            {/* Carte simplifiée (statique) */}
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-blue-100 to-green-100">
                <div className="h-[300px] relative">
                    {/* Image de fond décorative */}
                    <div className="absolute inset-0 opacity-10">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#000" strokeWidth="0.5"/>
                            </pattern>
                            <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Icône de carte */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Carte interactive</p>
                            <p className="text-gray-400 text-xs">Recherchez une adresse ci-dessous</p>
                        </div>
                    </div>

                    {/* Mini carte de localisation (si des points sont sélectionnés) */}
                    {(startLocation || endLocation) && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
                            <div className="flex items-center gap-2 text-sm">
                                {startLocation && (
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-xs truncate">{startLocation.address?.split(',')[0]}</span>
                                    </div>
                                )}
                                {startLocation && endLocation && <span>→</span>}
                                {endLocation && (
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-xs truncate">{endLocation.address?.split(',')[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mode de recherche */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${showSearch ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        <Search className="w-4 h-4" />
                        Rechercher
                    </button>
                    <button
                        onClick={handleGeolocation}
                        className="flex-1 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200"
                    >
                        <Crosshair className="w-4 h-4" />
                        Ma position
                    </button>
                </div>

                {showSearch && (
                    <div className="space-y-3">
                        {/* Recherche avec autocomplétion */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Tapez une adresse (ex: 5 Rue de Paris)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border max-h-60 overflow-y-auto z-10">
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSelectSearchResult(result)}
                                            className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                                        >
                                            <div className="text-sm font-medium">{result.display_name.split(',')[0]}</div>
                                            <div className="text-xs text-gray-500">{result.display_name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Saisie manuelle */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                                placeholder="Ou entrez une adresse manuellement"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                onKeyPress={(e) => e.key === 'Enter' && handleManualAddress()}
                            />
                            <button
                                onClick={handleManualAddress}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Panneau d'information de la position */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                            {selectionMode === 'start' ? '📍 Départ sélectionné' : '🏁 Arrivée sélectionnée'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {addressInfo?.address || 'Aucune position sélectionnée'}
                        </p>
                        {addressInfo?.city && (
                            <p className="text-xs text-gray-500 mt-1">
                                {addressInfo.city}, {addressInfo.country}
                            </p>
                        )}
                    </div>
                    {!addressInfo && (
                        <div className="text-xs text-amber-600">
                            ⚠️ Sélectionnez une adresse
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 text-center space-y-1">
                <p>💡 Recherchez une adresse ou utilisez votre position actuelle</p>
                <p>📍 Les points sélectionnés apparaîtront dans le résumé</p>
            </div>

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span>Recherche en cours...</span>
                    </div>
                </div>
            )}
        </div>
    );
}