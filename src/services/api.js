import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// SOS Alert Endpoints
export const sosAPI = {
  createAlert: (alertData) => 
    apiClient.post('/sos/alert', alertData),
  
  getAlerts: (params = {}) => 
    apiClient.get('/sos/alerts', { params }),
  
  getAlert: (alertId) => 
    apiClient.get(`/sos/alerts/${alertId}`),
  
  updateAlertStatus: (alertId, status) => 
    apiClient.put(`/sos/alerts/${alertId}/status`, { status }),
  
  cancelAlert: (alertId) => 
    apiClient.post(`/sos/alerts/${alertId}/cancel`, {}),

  getAlertTimeline: (alertId) =>
    apiClient.get(`/sos/alerts/${alertId}/timeline`)
}

// Notification Endpoints
export const notificationAPI = {
  getNotifications: (params = {}) => 
    apiClient.get('/notifications', { params }),
  
  markAsRead: (notificationId) => 
    apiClient.put(`/notifications/${notificationId}/read`, {}),
  
  markAllAsRead: () => 
    apiClient.put('/notifications/read-all', {}),

  deleteNotification: (notificationId) =>
    apiClient.delete(`/notifications/${notificationId}`)
}

// Location Endpoints
export const locationAPI = {
  updateLocation: (alertId, location) =>
    apiClient.post(`/sos/alerts/${alertId}/location`, location),

  getLocationHistory: (alertId) =>
    apiClient.get(`/sos/alerts/${alertId}/location-history`)
}

// Emergency Contacts Endpoints
export const contactsAPI = {
  getContacts: () =>
    apiClient.get('/emergency-contacts'),

  updateContact: (contactId, data) =>
    apiClient.put(`/emergency-contacts/${contactId}`, data),

  notifyContact: (contactId, alertId) =>
    apiClient.post(`/emergency-contacts/${contactId}/notify`, { alertId })
}

// Analytics Endpoints
export const analyticsAPI = {
  getEmergencyStats: () =>
    apiClient.get('/analytics/stats'),

  getEmergencyHistory: (params = {}) =>
    apiClient.get('/analytics/history', { params })
}

export default apiClient
