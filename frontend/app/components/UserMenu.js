'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, UserCircle, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UserMenu() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('👋 Déconnexion réussie');
        router.push('/login');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    const getRoleLabel = (role) => {
        const roles = {
            CLIENT: 'Client',
            CHAUFFEUR: 'Chauffeur',
            ADMIN: 'Administrateur'
        };
        return roles[role] || role;
    };

    const getTripsHref = () => {
        if (user?.role === 'CHAUFFEUR') return '/dashboard/my-trips';
        if (user?.role === 'ADMIN') return '/dashboard/all-trips';
        return '/dashboard/trips';
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            >
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {getInitials(user?.nom)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-800">{user?.nom}</p>
                    <p className="text-xs text-gray-500">{getRoleLabel(user?.role)}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-down">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {getInitials(user?.nom)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{user?.nom}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {getRoleLabel(user?.role)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-2">
                        <Link
                            href="/dashboard/profile"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            <UserCircle className="w-5 h-5 text-blue-600" />
                            <span className="text-sm">Mon profil</span>
                        </Link>
                        <Link
                            href={getTripsHref()}
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            <Package className="w-5 h-5 text-green-600" />
                            <span className="text-sm">Mes trajets</span>
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 p-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-red-600 group"
                        >
                            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
                            <span className="text-sm font-medium">Déconnexion</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
