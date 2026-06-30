import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import SOSButton from '../components/SOSButton'
import EmergencyTypeSelector from '../components/EmergencyTypeSelector'
import LocationMap from '../components/LocationMap'
import ContactCard from '../components/ContactCard'
import { useAlert } from '../context/AlertContext'
import { useLocation } from '../context/LocationContext'

const SOSAlert = () => {
  const navigate = useNavigate()
  const [emergencyType, setEmergencyType] = useState('other')
  const [description, setDescription] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { createAlert, emergencyContacts, currentAlert } = useAlert()
  const { location, loading, getCurrentLocation } = useLocation()

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const handleSOSPress = (alert) => {
    setShowConfirmation(true)
    
    setTimeout(() => {
      setShowConfirmation(false)
      toast.success('Emergency Services Notified! Tracking delivery status...')
      navigate(`/notifications/status/${alert.id}`)
    }, 3000)
  }

  const adaptContact = (c) => ({
    id: c.id,
    name: c.contact_name || c.name || 'Contact',
    phone: c.phone_number || c.phone || '',
    whatsapp: c.phone_number || c.phone || '',
    icon: c.relationship === 'Parent' ? '👨‍👩‍👧' : c.relationship === 'Guardian' ? '👴' : '🏠'
  })

  const handleCall = (contact) => {
    const phoneNumber = (contact.phone || contact.phone_number || '').replace(/[^0-9+]/g, '')
    if (phoneNumber) window.location.href = `tel:${phoneNumber}`
  }

  const handleWhatsApp = (contact) => {
    const phoneNumber = (contact.whatsapp || contact.phone || contact.phone_number || '').replace(/[^0-9+]/g, '')
    const message = encodeURIComponent('Emergency! I need immediate help!')
    if (phoneNumber) window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">SOS Emergency Alert</h1>
        <p className="text-gray-400">Activate emergency assistance with one action</p>
      </div>

      {currentAlert ? (
        // Alert Active View
        <div className="space-y-6">
          <div className="bg-gradient-emergency rounded-lg p-6 text-white">
            <h2 className="text-3xl font-bold mb-4">🚨 EMERGENCY ACTIVATED</h2>
            <p className="text-lg mb-4">Emergency services have been notified</p>
            <button
              onClick={() => navigate('/tracking')}
              className="btn-primary bg-white text-red-600 hover:bg-gray-100"
            >
              Track Your Emergency →
            </button>
          </div>

          <LocationMap location={location} loading={loading} onRefresh={getCurrentLocation} />

          <div>
            <h3 className="text-white font-semibold mb-4">Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyContacts.map(contact => (
                <ContactCard
                  key={contact.id}
                  contact={adaptContact(contact)}
                  onCall={handleCall}
                  onWhatsApp={handleWhatsApp}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Alert Setup View
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Emergency Type Selection */}
            <div className="card">
              <EmergencyTypeSelector selected={emergencyType} onChange={setEmergencyType} />
            </div>

            {/* Description */}
            <div className="card">
              <h3 className="text-white font-semibold mb-3">Additional Details (Optional)</h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your emergency situation..."
                className="input h-32 resize-none"
              />
            </div>

            {/* Features List */}
            <div className="card">
              <h3 className="text-white font-semibold mb-3">What Happens When You Press SOS?</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-red-600">✓</span> Your location is captured
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-red-600">✓</span> Campus security is notified
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-red-600">✓</span> Emergency contacts are alerted
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-red-600">✓</span> Real-time tracking is enabled
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-red-600">✓</span> Emergency timeline is recorded
                </li>
              </ul>
            </div>
          </div>

          {/* SOS Button Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="card w-full">
              <div className="flex flex-col items-center py-8">
                <SOSButton 
                  emergencyType={emergencyType} 
                  onPress={handleSOSPress}
                />
              </div>
            </div>

            {/* Location Preview */}
            <div className="w-full mt-6">
              <LocationMap location={location} loading={loading} onRefresh={getCurrentLocation} />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <p className="text-6xl mb-4">🚨</p>
              <h2 className="text-2xl font-bold text-white mb-2">SOS Activated!</h2>
              <p className="text-gray-400 mb-4">Emergency services have been notified and are en route.</p>
              <p className="text-gray-500 text-sm">Redirecting to tracking page...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SOSAlert
