import React from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'

const NotificationCard = ({ notification, onRead, onDismiss }) => {
  const getNotificationIcon = (type) => {
    const icons = {
      'parent_notified': '👨‍👩‍👧',
      'guardian_notified': '👴',
      'security_notified': '👮',
      'hospital_notified': '🏥',
      'police_notified': '🚔',
      'resolved': '✅',
      'status_update': '📌',
      'alert_created': '🚨'
    }
    return icons[type] || '📬'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={`card cursor-pointer transition-all duration-200 ${
        !notification.read ? 'border-red-600/50 bg-dark-700/50' : ''
      }`}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">{notification.title}</h3>
            {!notification.read && (
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            )}
          </div>
          
          <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
          
          <p className="text-gray-500 text-xs mt-2">{formatTime(notification.timestamp)}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss(notification.id)
          }}
          className="btn-icon hover:bg-red-600/20 text-red-400"
          title="Dismiss notification"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  )
}

export default NotificationCard
