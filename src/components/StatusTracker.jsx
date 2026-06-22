import React from 'react'
import { FaCheckCircle, FaClock } from 'react-icons/fa'

const StatusTracker = ({ alert }) => {
  const statuses = [
    { id: 'created', label: 'Alert Created', icon: '🚨' },
    { id: 'security_assigned', label: 'Security Assigned', icon: '👮' },
    { id: 'help_on_way', label: 'Help On The Way', icon: '🚗' },
    { id: 'arrived', label: 'Help Arrived', icon: '✅' },
    { id: 'resolved', label: 'Resolved', icon: '🎯' },
  ]

  const getStatusIndex = () => {
    return statuses.findIndex(s => s.id === alert.status)
  }

  const currentIndex = getStatusIndex()

  return (
    <div className="card">
      <h3 className="text-white font-semibold mb-6">Status Progress</h3>

      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-dark-700"></div>

        {/* Progress bar fill */}
        <div
          className="absolute top-6 left-0 h-1 bg-red-600 transition-all duration-500"
          style={{
            width: currentIndex >= 0 ? `${(currentIndex / (statuses.length - 1)) * 100}%` : '0%'
          }}
        ></div>

        {/* Status dots */}
        <div className="flex justify-between w-full relative z-10">
          {statuses.map((status, index) => (
            <div
              key={status.id}
              className="flex flex-col items-center"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                  index <= currentIndex
                    ? 'bg-red-600 text-white'
                    : 'bg-dark-700 text-gray-400'
                }`}
              >
                {index < currentIndex ? '✓' : status.icon}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center w-16">
                {status.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Current status detail */}
      <div className="mt-8 p-4 bg-dark-700 rounded-lg">
        <div className="flex items-center gap-2 text-white font-semibold">
          <FaClock className="text-orange-500" />
          <span>Current Status</span>
        </div>
        <p className="text-gray-300 mt-2">
          {statuses[currentIndex]?.label || 'Unknown Status'}
        </p>
      </div>
    </div>
  )
}

export default StatusTracker
