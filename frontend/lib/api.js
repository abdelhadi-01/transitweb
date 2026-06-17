import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`);
    return config;
}, (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
});

// Intercepteur pour les réponses
api.interceptors.response.use(
    (response) => {
        console.log(`📥 [${response.status}] ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ Erreur réponse:', error);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        } else if (error.request) {
            console.error('   Pas de réponse du serveur');
        }
        return Promise.reject(error);
    }
);

// API Trips
export const tripApi = {
    create: (data) => api.post('/trips', data),
    getClientTrips: () => api.get('/trips/client'),
    getAvailableTrips: () => api.get('/trips/available'),
    getChauffeurTrips: () => api.get('/trips/chauffeur'),
    acceptTrip: (tripId) => api.put(`/trips/${tripId}/accept`),
    startTrip: (tripId) => api.put(`/trips/${tripId}/start`),
    completeTrip: (tripId) => api.put(`/trips/${tripId}/complete`),
};

// API Admin
export const adminApi = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: () => api.get('/admin/users'),
    getTrips: () => api.get('/admin/trips'),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    updateTripStatus: (tripId, status) => api.put(`/admin/trips/${tripId}/status?status=${status}`),
};

export default api;