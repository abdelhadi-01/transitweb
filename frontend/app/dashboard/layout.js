'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

import {
    LayoutDashboard,
    Package,
    Truck,
    LogOut,
    Menu,
    ChevronRight,
    User,
    MapPin,
    HelpCircle,
    FileText,
    Users,
    Settings,
    BarChart3,
    X
} from 'lucide-react';
import UserMenu from '../components/UserMenu';
import NotificationBell from '../components/NotificationBell';
import toast from 'react-hot-toast';

// Menu pour les clients
const clientMenuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard/client' },
    { icon: Package, label: 'Mes trajets', href: '/dashboard/trips' },
];

// Menu pour les chauffeurs
const chauffeurMenuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard/chauffeur' },
    { icon: Truck, label: 'Missions disponibles', href: '/dashboard/missions' },
    { icon: MapPin, label: 'Mes trajets', href: '/dashboard/my-trips' },
];

// Menu pour les admins
const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard/admin' },
    { icon: Users, label: 'Utilisateurs', href: '/dashboard/users' },
    { icon: Package, label: 'Tous les trajets', href: '/dashboard/all-trips' },
];

// Menu secondaire (commun à tous)
const secondaryMenuItems = [
    { icon: User, label: 'Mon profil', href: '/dashboard/profile' },
];

function DashboardLayout({ children }) {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Changé à false par défaut pour mobile
    const [isMobile, setIsMobile] = useState(false);

    // Détecter si c'est un écran mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fermer la sidebar automatiquement sur mobile quand on change de page
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [pathname, isMobile]);

    // Ouvrir la sidebar par défaut sur desktop
    useEffect(() => {
        if (!isMobile) {
            setSidebarOpen(true);
        }
    }, [isMobile]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const getMenuItems = () => {
        if (!user) return [];
        switch (user.role) {
            case 'ADMIN':
                return adminMenuItems;
            case 'CHAUFFEUR':
                return chauffeurMenuItems;
            default:
                return clientMenuItems;
        }
    };

    const menuItems = getMenuItems();

    const handleLogout = () => {
        logout();
        toast.success('👋 Déconnexion réussie');
        router.push('/login');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Overlay pour mobile */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200
                transform transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static
                flex flex-col
            `}>
                {/* Logo avec bouton de fermeture sur mobile */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">TransitWeb</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full hidden sm:inline-block">
                            {user.role === 'ADMIN' ? 'Admin' : user.role === 'CHAUFFEUR' ? 'Chauffeur' : 'Client'}
                        </span>
                        {/* Bouton de fermeture sur mobile */}
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Menu principal</p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                onClick={() => isMobile && setSidebarOpen(false)}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium">{item.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />}
                            </Link>
                        );
                    })}

                    <div className="my-4 border-t border-gray-200"></div>

                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Compte</p>
                    {secondaryMenuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                pathname === item.href
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            onClick={() => isMobile && setSidebarOpen(false)}
                        >
                            <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Contenu principal */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'ml-0'}`}>
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 sm:px-6 h-16">
                        <div className="flex items-center gap-4">
                            {/* Bouton Hamburger */}
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-gray-100 rounded-lg transition lg:hidden"
                                aria-label="Toggle menu"
                            >
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>
                            {/* Titre de la page actuelle sur mobile */}
                            <span className="lg:hidden text-sm font-medium text-gray-900">
                                {menuItems.find(item => pathname === item.href)?.label || 'Dashboard'}
                            </span>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-green-700">En ligne</span>
                            </div>
                            <span className="text-sm text-gray-500 hidden md:block">
                                {user.role === 'ADMIN' ? '👑 Administrateur' :
                                 user.role === 'CHAUFFEUR' ? '🚚 Chauffeur' : '👤 Client'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <UserMenu />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}

export default DashboardLayout;