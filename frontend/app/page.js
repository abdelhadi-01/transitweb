'use client';

import Link from 'next/link';
import { Truck, Package, Users, ArrowRight, MapPin, Clock, Shield, Star, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
    const [isClient, setIsClient] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [activeFeature, setActiveFeature] = useState(0);
    const heroRef = useRef(null);
    const statsRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);

        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 3);
        }, 4000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white mt-4 text-lg">Chargement de l'expérience...</p>
                </div>
            </div>
        );
    }

    const features = [
        {
            icon: <Truck className="w-6 h-6" />,
            title: "Transport rapide",
            description: "Livraison express avec suivi en temps réel de vos colis",
            color: "from-blue-500 to-blue-600"
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Sécurisé & Fiable",
            description: "Vos marchandises sont assurées et suivies à chaque étape",
            color: "from-green-500 to-emerald-600"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Ultra rapide",
            description: "Mise en relation instantanée avec les chauffeurs disponibles",
            color: "from-purple-500 to-pink-600"
        }
    ];

    const stats = [
        { value: "500+", label: "Trajets effectués", icon: CheckCircle },
        { value: "98%", label: "Satisfaction client", icon: Star },
        { value: "50+", label: "Chauffeurs partenaires", icon: Users },
        { value: "24/7", label: "Support disponible", icon: Clock }
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Navbar transparente */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                            <span className={`text-xl font-bold transition-colors duration-300 ${scrollY > 50 ? 'text-gray-900' : 'text-white'}`}>
                                TransitWeb
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${scrollY > 50 ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
                            >
                                Se connecter
                            </Link>
                            <Link
                                href="/register"
                                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${scrollY > 50 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                            >
                                S'inscrire
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Fond animé */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
                    </div>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-repeat"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Badge animé */}
                    <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8 animate-bounce">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        Plateforme disponible
                    </div>

                    {/* Titre principal */}
                    <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6">
                        <span className="block">Transportez vos</span>
                        <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                            marchandises
                        </span>
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                        La plateforme intelligente qui connecte les clients aux chauffeurs pour un transport rapide, sécurisé et économique.
                    </p>

                    {/* Actions principales */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link
                            href="/register"
                            className="group px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                            Commencer maintenant
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                        >
                            J'ai déjà un compte
                        </Link>
                    </div>

                    {/* Features animées */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white transition-all duration-500 transform hover:scale-105 hover:bg-white/20 ${
                                    activeFeature === index ? 'ring-2 ring-white/50' : ''
                                }`}
                                onMouseEnter={() => setActiveFeature(index)}
                            >
                                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-white/70 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Indicateurs */}
                    <div className="flex justify-center gap-2 mt-8">
                        {[0, 1, 2].map((index) => (
                            <button
                                key={index}
                                onClick={() => setActiveFeature(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    activeFeature === index ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Section Statistiques */}
            <section ref={statsRef} className="py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Chiffres qui <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">parlent</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Découvrez pourquoi des milliers d'utilisateurs nous font confiance
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section Comment ça marche */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Comment ça <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">marche</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Trois étapes simples pour transporter vos marchandises
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Créez votre demande",
                                description: "Indiquez votre départ, arrivée et les détails de votre colis",
                                icon: Package
                            },
                            {
                                step: "02",
                                title: "Trouvez un chauffeur",
                                description: "Un chauffeur accepte votre mission en quelques minutes",
                                icon: Users
                            },
                            {
                                step: "03",
                                title: "Suivez votre livraison",
                                description: "Suivez votre colis en temps réel jusqu'à destination",
                                icon: MapPin
                            }
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="relative group">
                                    <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                                            <Icon className="w-8 h-8 text-white" />
                                            <span className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600 shadow-md">
                                                {item.step}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-500">{item.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section Témoignages */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Ce que disent nos <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">utilisateurs</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Marie Dubois",
                                role: "Cliente",
                                avatar: "MD",
                                text: "TransitWeb m'a permis de livrer mes produits frais en toute sécurité. Un service excellent !"
                            },
                            {
                                name: "Ahmed Benjelloun",
                                role: "Chauffeur",
                                avatar: "AB",
                                text: "Je gère mes missions facilement et j'augmente mes revenus grâce à cette plateforme."
                            },
                            {
                                name: "Sophie Martin",
                                role: "Entrepreneuse",
                                avatar: "SM",
                                text: "Une solution simple et efficace pour gérer toutes mes livraisons professionnelles."
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">"{testimonial.text}"</p>
                                <div className="flex text-yellow-400 mt-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action finale */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-repeat"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-4xl font-bold mb-6">
                        Prêt à <span className="text-yellow-300">transporter</span> vos marchandises ?
                    </h2>
                    <p className="text-xl text-white/80 mb-10">
                        Rejoignez des milliers d'utilisateurs qui font confiance à TransitWeb
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/register"
                            className="group px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                        >
                            Commencer gratuitement
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-4 border-2 border-white/30 text-white rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                        >
                            Se connecter
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold">TransitWeb</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                La plateforme intelligente pour vos transports de marchandises.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Navigation</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href="/" className="hover:text-white transition">Accueil</Link></li>
                                <li><Link href="/login" className="hover:text-white transition">Connexion</Link></li>
                                <li><Link href="/register" className="hover:text-white transition">Inscription</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Ressources</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Aide</a></li>
                                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Légal</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Conditions</a></li>
                                <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                        <p>&copy; 2024 TransitWeb. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}