import React, { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

const EmergencyHistoryTable = ({ alerts = [] }) => {
  const [expandedId, setExpandedId] = useState(null)

  const getEmergencyTypeIcon = (type) => {
    const icons = {
      'medical': '🏥',
      'harassment': '⚠️',
      'accident': '🚗',
      'fire': '🔥',
      'theft': '🔓',
      'other': '❓'
    }
    return icons[type] || '❓'
  }

  const getStatusBadge = (status) => {
    const styles = {
      'created': 'badge-yellow',
      'security_assigned': 'badge-blue',
      'help_on_way': 'badge-orange',
      'arrived': 'badge-green',
      'resolved': 'badge-green'
    }
    
    const labels = {
      'created': 'Alert Created',
      'security_assigned': 'Security Assigned',
      'help_on_way': 'Help On The Way',
      'arrived': 'Arrived',
      'resolved': 'Resolved'
    }

    return (
      <span className={`badge ${styles[status] || 'badge-blue'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card">
      <h3 className="text-white font-semibold mb-4">📋 Emergency History</h3>

      {alerts.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="space-y-2 min-w-full">
            {alerts.map((alert) => (
              <div key={alert.id}>
                {/* Row */}
                <button
                  onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
                  className="w-full p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <span className="text-2xl">{getEmergencyTypeIcon(alert.type)}</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {alert.type?.charAt(0).toUpperCase() + alert.type?.slice(1) || 'Emergency'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDate(alert.createdAt)} at {formatTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(alert.status)}
                    <span className="text-gray-400">
                      {expandedId === alert.id ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                </button>

                {/* Expanded details */}
                {expandedId === alert.id && (
                  <div className="mt-2 p-4 bg-dark-700/50 rounded-lg border-l-2 border-red-600 space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white">
                        {alert.location?.address || `${alert.location?.latitude?.toFixed(4)}, ${alert.location?.longitude?.toFixed(4)}`}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Priority</p>
                      <span className="badge badge-red mt-1">
                        {(() => {
                          const priority = alert.priority || (alert.escalation_level === 3 ? 'extreme' : alert.escalation_level === 2 ? 'critical' : 'high');
                          return priority.charAt(0).toUpperCase() + priority.slice(1);
                        })()}
                      </span>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-2">Timeline Events</p>
                      <div className="space-y-2">
                        {alert.timeline?.map((event, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="text-white">
                              <span className="font-semibold">{event.icon}</span> {event.status}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {formatTime(event.timestamp)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No emergency history yet</p>
        </div>
      )}
    </div>
  )
}

export default EmergencyHistoryTable
