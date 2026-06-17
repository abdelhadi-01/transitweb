'use client';

import Link from 'next/link';
import { Truck, Package, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                    <div className="animate-pulse">Chargement...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                        TransitWeb
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        La plateforme intelligente pour vos transports de marchandises
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            href="/login"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Se connecter
                        </Link>
                        <Link
                            href="/register"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition"
                        >
                            S'inscrire
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Pour les clients</h3>
                        <p className="text-gray-600">Créez des demandes de transport et suivez vos livraisons</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <Truck className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Pour les chauffeurs</h3>
                        <p className="text-gray-600">Trouvez des missions, gérez vos trajets</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Pour les admins</h3>
                        <p className="text-gray-600">Supervisez l'ensemble des activités</p>
                    </div>
                </div>
            </div>
        </div>
    );
}