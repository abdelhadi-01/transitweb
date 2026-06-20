import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const logger = status >= 500 ? console.error : console.warn;
            logger(`API ${status} ${error.config?.url || ''}`, error.response.data);
        } else if (error.request) {
            console.warn('API: no response from server');
        }
        return Promise.reject(error);
    }
);

export const tripApi = {
    create: (data) => api.post('/trips', data),
    getClientTrips: () => api.get('/trips/client'),
    getAvailableTrips: () => api.get('/trips/available'),
    getChauffeurTrips: () => api.get('/trips/chauffeur'),
    acceptTrip: (tripId) => api.put(`/trips/${tripId}/accept`),
    startTrip: (tripId) => api.put(`/trips/${tripId}/start`),
    completeTrip: (tripId) => api.put(`/trips/${tripId}/complete`),
};

export const adminApi = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: () => api.get('/admin/users'),
    getTrips: () => api.get('/admin/trips'),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    updateTripStatus: (tripId, status) => api.put(`/admin/trips/${tripId}/status?status=${status}`),
};

export const notificationApi = {
    getMine: () => api.get('/notifications/me'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
