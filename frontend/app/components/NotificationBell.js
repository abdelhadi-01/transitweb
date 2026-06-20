'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Package, CheckCircle2, CheckCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '@/lib/api';
import toast from 'react-hot-toast';

const iconByType = {
    TRIP_CREATED: Package,
    TRIP_ACCEPTED: CheckCircle2,
    TRIP_COMPLETED: CheckCheck,
};

function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function NotificationBell() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    const loadNotifications = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const [notificationsResponse, unreadResponse] = await Promise.all([
                notificationApi.getMine(),
                notificationApi.getUnreadCount()
            ]);

            setNotifications(notificationsResponse.data || []);
            setUnreadCount(Number(unreadResponse.data || 0));
        } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [user]);

    useEffect(() => {
        const refreshFromEvent = () => {
            loadNotifications();
        };

        window.addEventListener('notifications:refresh', refreshFromEvent);
        return () => window.removeEventListener('notifications:refresh', refreshFromEvent);
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            loadNotifications();
        }, 10000);

        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markOneAsRead = async (notificationId) => {
        try {
            await notificationApi.markAsRead(notificationId);
            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
            setUnreadCount((current) => Math.max(current - 1, 0));
        } catch (error) {
            toast.error('Impossible de marquer la notification comme lue');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
            setUnreadCount(0);
        } catch (error) {
            toast.error('Impossible de marquer toutes les notifications comme lues');
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setOpen((current) => !current)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] font-semibold text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Notifications</p>
                            <p className="text-xs text-gray-400">{unreadCount} non lues</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Tout lire
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-md"
                                aria-label="Fermer"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-gray-500">Chargement...</div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Aucune notification</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const Icon = iconByType[notification.type] || Bell;
                                return (
                                    <button
                                        key={notification.id}
                                        onClick={() => markOneAsRead(notification.id)}
                                        className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-50 last:border-b-0 transition ${
                                            notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'
                                        }`}
                                    >
                                        <span className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                                            notification.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            <Icon className="w-4 h-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-800 leading-5 break-words">
                                                {notification.message}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="mt-2 h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
