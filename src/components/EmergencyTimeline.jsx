import React from 'react'

const EmergencyTimeline = ({ timeline, currentStatus }) => {
  const getStatusLabel = (status) => {
    const labels = {
      'created': 'Alert Created',
      'security_assigned': 'Security Assigned',
      'help_on_way': 'Help On The Way',
      'arrived': 'Help Arrived',
      'resolved': 'Emergency Resolved'
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      'created': 'bg-yellow-600',
      'security_assigned': 'bg-blue-600',
      'help_on_way': 'bg-orange-600',
      'arrived': 'bg-green-600',
      'resolved': 'bg-green-700'
    }
    return colors[status] || 'bg-gray-600'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="card">
      <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
        📊 Emergency Timeline
      </h3>

      <div className="relative">
        {timeline && timeline.length > 0 ? (
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={index} className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 ${getStatusColor(event.status)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {event.icon || index + 1}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-1 h-12 bg-dark-700 mt-2"></div>
                  )}
                </div>

                {/* Event details */}
                <div className="flex-1 pt-1">
                  <h4 className="text-white font-semibold">
                    {getStatusLabel(event.status)}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {formatTime(event.timestamp)}
                  </p>
                  {event.message && (
                    <p className="text-gray-300 text-sm mt-1">{event.message}</p>
                  )}
                </div>

                {/* Current status indicator */}
                {index === timeline.length - 1 && (
                  <div className="animate-pulse">
                    <span className="inline-block w-3 h-3 bg-red-600 rounded-full"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No timeline events yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmergencyTimeline
