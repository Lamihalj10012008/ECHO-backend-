import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AlertContext = createContext()


export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([])
  const [currentAlert, setCurrentAlert] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [ws, setWs] = useState(null)
  const wsRef = useRef(null)
  const shouldReconnectRef = useRef(true)

  // Fetch all emergency contacts
  const fetchContacts = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const baseApiUrl = apiUrl.replace(/\/v1$/, '')
      const token = localStorage.getItem('authToken')
      if (!token) return []

      const response = await axios.get(`${baseApiUrl}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmergencyContacts(response.data)
      return response.data
    } catch (error) {
      console.error("Failed to fetch emergency contacts:", error)
      return []
    }
  }, [])

  // Add a new contact
  const addContact = useCallback(async (contactData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const baseApiUrl = apiUrl.replace(/\/v1$/, '')
      const token = localStorage.getItem('authToken')
      
      const response = await axios.post(`${baseApiUrl}/contacts`, {
        contact_name: contactData.contact_name,
        phone_number: contactData.phone_number,
        relationship: contactData.relationship
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success("Emergency contact added/updated successfully")
      await fetchContacts()
      return response.data
    } catch (error) {
      console.error("Failed to add emergency contact:", error)
      const errorMsg = error.response?.data?.detail || "Failed to add emergency contact"
      toast.error(errorMsg)
      throw error
    }
  }, [fetchContacts])

  // Edit a contact
  const editContact = useCallback(async (id, contactData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const baseApiUrl = apiUrl.replace(/\/v1$/, '')
      const token = localStorage.getItem('authToken')
      
      const response = await axios.put(`${baseApiUrl}/contacts/${id}`, {
        contact_name: contactData.contact_name,
        phone_number: contactData.phone_number,
        relationship: contactData.relationship
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success("Emergency contact updated successfully")
      await fetchContacts()
      return response.data
    } catch (error) {
      console.error("Failed to update emergency contact:", error)
      const errorMsg = error.response?.data?.detail || "Failed to update emergency contact"
      toast.error(errorMsg)
      throw error
    }
  }, [fetchContacts])

  // Delete a contact
  const deleteContact = useCallback(async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const baseApiUrl = apiUrl.replace(/\/v1$/, '')
      const token = localStorage.getItem('authToken')
      
      await axios.delete(`${baseApiUrl}/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success("Emergency contact deleted successfully")
      await fetchContacts()
    } catch (error) {
      console.error("Failed to delete emergency contact:", error)
      const errorMsg = error.response?.data?.detail || "Failed to delete emergency contact"
      toast.error(errorMsg)
      throw error
    }
  }, [fetchContacts])

  // Fetch alert history
  const fetchAlertHistory = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const baseApiUrl = apiUrl.replace(/\/v1$/, '')
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await axios.get(`${baseApiUrl}/sos/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const formatted = response.data.map(alert => ({
        id: alert.id,
        alertId: alert.alert_id,
        type: alert.emergency_type,
        location: {
          latitude: alert.latitude,
          longitude: alert.longitude,
          address: alert.location
        },
        createdAt: new Date(alert.created_at),
        status: alert.status,
        escalation_level: alert.escalation_level,
        nearest_security_office: alert.nearest_security_office
      }))
      setAlerts(formatted)
    } catch (error) {
      console.error("Failed to fetch SOS alert history:", error)
    }
  }, [])

  // Create/Trigger SOS Alert
  const createAlert = useCallback(async (alertData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const baseApiUrl = apiUrl.replace(/\/v1$/, '')
      const token = localStorage.getItem('authToken')
      
      const payload = {
        emergency_type: (alertData.type || 'other').toLowerCase(),
        latitude: alertData.location?.latitude || 12.9716,
        longitude: alertData.location?.longitude || 77.5946,
        location: alertData.location?.address || 'Main Campus',
        description: alertData.description || 'SOS Alert Activated'
      }
      
      const response = await axios.post(`${baseApiUrl}/sos/trigger`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const backendAlert = response.data
      
      const newAlert = {
        id: backendAlert.id,
        alertId: backendAlert.alert_id,
        type: backendAlert.emergency_type,
        location: {
          latitude: backendAlert.latitude,
          longitude: backendAlert.longitude,
          address: backendAlert.location
        },
        createdAt: new Date(backendAlert.created_at),
        status: backendAlert.status || 'active',
        timeline: [
          { status: 'Alert Created (Level 1 - Contacts Alerted)', timestamp: new Date(backendAlert.created_at), icon: '🚨' },
          { status: `Campus Security Office Notified (Level 2 - ${backendAlert.nearest_security_office})`, timestamp: new Date(backendAlert.created_at), icon: '👮' }
        ],
        notifications: [],
        notified_contacts: backendAlert.notified_contacts || [],
        escalation_level: backendAlert.escalation_level,
        nearest_security_office: backendAlert.nearest_security_office
      }
      
      setCurrentAlert(newAlert)
      setAlerts(prev => [newAlert, ...prev])
      return newAlert
    } catch (error) {
      console.error("Failed to trigger SOS alert on backend:", error)
      toast.error("Failed to activate SOS. Please check your connection.")
      throw error
    }
  }, [])

  // Update alert status locally
  const updateAlertStatus = useCallback((alertId, newStatus, message = '') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? {
            ...alert,
            status: newStatus,
            timeline: [...alert.timeline, {
              status: newStatus,
              timestamp: new Date(),
              message,
              icon: getStatusIcon(newStatus)
            }]
          }
        : alert
    ))

    if (currentAlert?.id === alertId) {
      setCurrentAlert(prev => ({
        ...prev,
        status: newStatus,
        timeline: [...prev.timeline, {
          status: newStatus,
          timestamp: new Date(),
          message,
          icon: getStatusIcon(newStatus)
        }]
      }))
    }
  }, [currentAlert])

  // WebSocket connection management
  const connectWebSocket = useCallback((userId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const wsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/api\/v1$/, '')
      
      const socket = new WebSocket(`${wsUrl}/ws/alerts/${userId}`)
      
      socket.onopen = () => {
        console.log(`WebSocket connected for user: ${userId}`)
      }
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log("WebSocket event received:", message)
          
          if (message.sos_id) {
            if (message.type === "notification_status") {
              // Update delivery status in current alert
              setCurrentAlert(prev => {
                if (!prev || prev.id !== message.sos_id) return prev
                
                // Add or update notification log
                const exists = prev.notifications.some(n => n.id === message.notification_id)
                let updatedNotifs;
                if (exists) {
                  updatedNotifs = prev.notifications.map(n => 
                    n.id === message.notification_id 
                      ? { ...n, delivery_status: message.status } 
                      : n
                  )
                } else {
                  updatedNotifs = [
                    ...prev.notifications,
                    {
                      id: message.notification_id,
                      recipient: message.recipient,
                      channel: message.channel,
                      delivery_status: message.status,
                      provider_message_id: message.provider_message_id,
                      timestamp: new Date()
                    }
                  ]
                }
                return { ...prev, notifications: updatedNotifs }
              })
            } else if (message.type === "escalation") {
              // Update escalation level
              setCurrentAlert(prev => {
                if (!prev || prev.id !== message.sos_id) return prev
                return {
                  ...prev,
                  escalation_level: message.escalation_level,
                  timeline: [
                    ...prev.timeline,
                    { 
                      status: `Level 3 Escalation - ERT Dispatched`, 
                      timestamp: new Date(), 
                      icon: '⚡', 
                      message: "Emergency Response Team has been notified."
                    }
                  ]
                }
              })
            }
          }
          
          // Show campus-wide toast for security / admins
          if (message.type === "new_alert") {
            const role = localStorage.getItem('userRole')
            if (role === 'security' || role === 'admin') {
              toast.error(`🚨 SOS ALERT: ${message.student_name} is in danger at ${message.location}! Nearest Post: ${message.nearest_office}`)
            }
          }
        } catch (err) {
          console.error("Failed to parse WS data:", err)
        }
      }
      
      socket.onclose = () => {
        console.log("WebSocket disconnected. Retrying in 5 seconds...")
        if (shouldReconnectRef.current) {
          setTimeout(() => connectWebSocket(userId), 5000)
        }
      }

      wsRef.current = socket
      setWs(socket)
    } catch (e) {
      console.error("WebSocket setup failed:", e)
    }
  }, [])

  // Automatically fetch initial contacts and history if logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userId = localStorage.getItem('userId')
    
    if (token) {
      fetchContacts()
      fetchAlertHistory()
    }
    if (userId) {
      connectWebSocket(userId)
    }
    
    return () => {
      shouldReconnectRef.current = false
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [fetchContacts, fetchAlertHistory, connectWebSocket])

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])

    if (currentAlert) {
      setCurrentAlert(prev => ({
        ...prev,
        notifications: [...prev.notifications, newNotification]
      }))
    }
  }, [currentAlert])

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ))
  }, [])

  const getStatusIcon = (status) => {
    const icons = {
      'created': '🚨',
      'active': '🚨',
      'security_assigned': '👮',
      'help_on_way': '🚗',
      'arrived': '✅',
      'resolved': '✔️'
    }
    return icons[status] || '📌'
  }

  const value = {
    alerts,
    currentAlert,
    setCurrentAlert,
    notifications,
    emergencyContacts,
    createAlert,
    updateAlertStatus,
    addNotification,
    markNotificationAsRead,
    fetchContacts,
    addContact,
    editContact,
    deleteContact,
    fetchAlertHistory
  }

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context
}
