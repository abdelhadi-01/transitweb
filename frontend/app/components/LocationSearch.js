'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';

export default function LocationSearch({ onSelect, placeholder, value }) {
    const [address, setAddress] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef(null);

    // Recherche de lieux via Nominatim (OpenStreetMap)
    const searchLocations = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=fr`
            );
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Erreur de recherche:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce pour éviter trop d'appels API
    const handleInputChange = (e) => {
        const value = e.target.value;
        setAddress(value);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            searchLocations(value);
        }, 500);
    };

    const handleSelectSuggestion = (suggestion) => {
        setAddress(suggestion.display_name);
        setSuggestions([]);
        setShowSuggestions(false);

        onSelect({
            address: suggestion.display_name,
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon),
            formattedAddress: suggestion.display_name,
            city: suggestion.address?.city || suggestion.address?.town || suggestion.address?.village,
            country: suggestion.address?.country
        });
    };

    return (
        <div className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={address}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                {address && (
                    <button
                        type="button"
                        onClick={() => {
                            setAddress('');
                            setSuggestions([]);
                            onSelect(null);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {showSuggestions && (suggestions.length > 0 || loading) && (
                <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {loading && (
                        <div className="p-3 text-gray-500 text-sm">
                            <div className="animate-pulse">Recherche...</div>
                        </div>
                    )}
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                            <div className="flex items-start gap-2">
                                <Search className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium">{suggestion.display_name.split(',')[0]}</div>
                                    <div className="text-xs text-gray-500">{suggestion.display_name}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}