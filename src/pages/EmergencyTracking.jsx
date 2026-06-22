import React, { useEffect } from 'react'
import { FaExternalLinkAlt, FaPhone } from 'react-icons/fa'
import StatusTracker from '../components/StatusTracker'
import EmergencyTimeline from '../components/EmergencyTimeline'
import LocationMap from '../components/LocationMap'
import { useAlert } from '../context/AlertContext'
import { useLocation } from '../context/LocationContext'

const EmergencyTracking = () => {
  const { currentAlert } = useAlert()
  const { location, loading, getCurrentLocation } = useLocation()

  useEffect(() => {
    if (!location) {
      getCurrentLocation()
    }
  }, [])

  if (!currentAlert) {
    return (
      <div className="p-4 md:p-8">
        <div className="card text-center py-12">
          <p className="text-6xl mb-4">📭</p>
          <h2 className="text-2xl font-bold text-white mb-2">No Active Emergency</h2>
          <p className="text-gray-400 mb-6">Create a new SOS alert to start tracking</p>
          <a href="/sos" className="btn-primary">
            Create SOS Alert
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Emergency Tracking</h1>
        <p className="text-gray-400">Real-time emergency response tracking</p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-400 text-sm">Emergency Type</p>
          <p className="text-white font-bold text-lg mt-2">
            {currentAlert.type ? (currentAlert.type.charAt(0).toUpperCase() + currentAlert.type.slice(1)) : 'Emergency'}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-400 text-sm">Current Status</p>
          <p className="text-white font-bold text-lg mt-2">
            {currentAlert.status ? currentAlert.status.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN'}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-400 text-sm">Priority Level</p>
          <p className="badge badge-red mt-2">
            {(() => {
              const priority = currentAlert.priority || (currentAlert.escalation_level === 3 ? 'extreme' : currentAlert.escalation_level === 2 ? 'critical' : 'high');
              return priority.charAt(0).toUpperCase() + priority.slice(1);
            })()}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-400 text-sm">Alert ID</p>
          <p className="text-white font-mono text-sm mt-2">
            {String(currentAlert.alertId || currentAlert.id || '').slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* Status Tracker */}
      <StatusTracker alert={currentAlert} />

      {/* Timeline and Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EmergencyTimeline timeline={currentAlert.timeline} currentStatus={currentAlert.status} />
        <LocationMap location={location} loading={loading} onRefresh={getCurrentLocation} />
      </div>

      {/* Assigned Personnel */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">🚨 Assigned Emergency Personnel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { role: 'Campus Security Officer', name: 'Officer John Doe', status: 'En Route', icon: '👮' },
            { role: 'Medical Team', name: 'Dr. Sarah Johnson', status: 'En Route', icon: '🏥' },
            { role: 'Dispatcher', name: 'Control Room', status: 'Connected', icon: '📡' },
            { role: 'Backup Support', name: 'Standby Unit', status: 'Ready', icon: '⚡' }
          ].map((person, idx) => (
            <div key={idx} className="p-4 bg-dark-700 rounded-lg border border-dark-600 hover:border-red-600/50 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gray-400 text-sm">{person.role}</p>
                  <p className="text-white font-semibold text-lg">{person.name}</p>
                </div>
                <span className="text-2xl">{person.icon}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`badge ${
                  person.status === 'En Route' ? 'bg-orange-600/20 text-orange-400' :
                  person.status === 'Connected' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-green-600/20 text-green-400'
                }`}>
                  {person.status}
                </span>
                <button className="btn-icon hover:bg-red-600/20 text-red-400">
                  <FaPhone />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">⚡ Emergency Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="btn-primary w-full">
            📞 Call Dispatcher
          </button>
          <button className="btn-primary w-full">
            📍 Update Location
          </button>
          <button className="btn-secondary w-full">
            Cancel Alert
          </button>
        </div>
      </div>

      {/* Real-time Notifications */}
      {currentAlert.notifications && currentAlert.notifications.length > 0 && (
        <div className="card">
          <h3 className="text-white font-semibold mb-4">📬 Real-time Updates</h3>
          <div className="space-y-2">
            {currentAlert.notifications.map((notif, idx) => (
              <div key={idx} className="p-3 bg-dark-700 rounded-lg flex items-start gap-3">
                <span className="text-lg">{notif.icon || '📌'}</span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{notif.title}</p>
                  <p className="text-gray-400 text-xs">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmergencyTracking
