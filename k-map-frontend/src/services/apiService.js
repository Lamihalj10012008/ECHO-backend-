import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

export const campusApi = {
  getLiveData: () => api.get('/api/campus-live'),
  getBuildings: (category = 'all') => api.get('/api/buildings', { params: { category } }),
  getBuilding: (id) => api.get(`/api/buildings/${id}`),
  search: (q) => api.get('/api/search', { params: { q } }),
  getCategories: () => api.get('/api/categories'),
};

export const navigationApi = {
  getRoute: (origin, destinationId, mode = 'walking') =>
    api.post('/api/navigation/route', { origin, destinationId, mode }),
  getETA: (fromLat, fromLng, toId, mode = 'walking') =>
    api.get('/api/navigation/eta', { params: { fromLat, fromLng, toId, mode } }),
  reroute: (currentLocation, destinationId, mode, reason) =>
    api.post('/api/navigation/reroute', { currentLocation, destinationId, mode, reason }),
  getNearby: (lat, lng, radius = 200, category = 'all') =>
    api.get('/api/navigation/nearby', { params: { lat, lng, radius, category } }),
};

export const aiApi = {
  query: (query, userLocation) => api.post('/api/ai/query', { query, userLocation }),
  getSuggestions: () => api.get('/api/ai/suggestions'),
};

export const emergencyApi = {
  getContacts: () => api.get('/api/emergency/contacts'),
  getMedical: (lat, lng) => api.get('/api/emergency/medical', { params: { lat, lng } }),
  getSecurity: () => api.get('/api/emergency/security'),
  getNearest: (lat, lng) => api.get('/api/emergency/nearest', { params: { lat, lng } }),
};

export default api;
