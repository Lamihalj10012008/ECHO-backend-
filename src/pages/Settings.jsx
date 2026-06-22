import React, { useState } from 'react'
import { FaToggleOn, FaToggleOff, FaSave, FaBell, FaLock, FaUser } from 'react-icons/fa'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'react-toastify'

const Settings = () => {
  const { isDark, toggleTheme } = useTheme()
  const [settings, setSettings] = useState({
    notifications: {
      alertUpdates: true,
      contactNotifications: true,
      securityUpdates: true,
      soundEnabled: true,
      vibrationEnabled: true
    },
    privacy: {
      shareLocation: true,
      allowContactAccess: true,
      emergencySharing: true
    },
    general: {
      language: 'en',
      timezone: 'UTC'
    }
  })

  const handleToggle = (section, key) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }))
  }

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Customize your ECHO experience</p>
      </div>

      {/* General Settings */}
      <div className="card">
        <h2 className="text-white font-semibold text-xl mb-6">⚙️ General Settings</h2>

        <div className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <h3 className="text-white font-semibold">Dark Mode</h3>
                <p className="text-gray-400 text-sm">Use dark theme for the application</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="btn-icon hover:bg-red-600/20 text-red-400 text-2xl"
              title="Toggle dark mode"
            >
              {isDark ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>

          {/* Language */}
          <div className="p-4 bg-dark-700 rounded-lg">
            <label className="text-gray-400 text-sm block mb-2">Language</label>
            <select
              value={settings.general.language}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, language: e.target.value }
              }))}
              className="input"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="p-4 bg-dark-700 rounded-lg">
            <label className="text-gray-400 text-sm block mb-2">Timezone</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, timezone: e.target.value }
              }))}
              className="input"
            >
              <option value="UTC">UTC</option>
              <option value="IST">IST (India)</option>
              <option value="PST">PST (Pacific)</option>
              <option value="EST">EST (Eastern)</option>
              <option value="GMT">GMT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <h2 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
          <FaBell /> Notification Settings
        </h2>

        <div className="space-y-3">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-dark-700 rounded-lg"
            >
              <div>
                <h3 className="text-white font-semibold capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-gray-400 text-sm">
                  {key === 'alertUpdates' && 'Receive notifications for emergency status updates'}
                  {key === 'contactNotifications' && 'Alert when emergency contacts are notified'}
                  {key === 'securityUpdates' && 'Get updates from security personnel'}
                  {key === 'soundEnabled' && 'Play sound for important notifications'}
                  {key === 'vibrationEnabled' && 'Vibrate device for alerts'}
                </p>
              </div>
              <button
                onClick={() => handleToggle('notifications', key)}
                className="btn-icon hover:bg-red-600/20 text-red-400 text-2xl"
              >
                {value ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="card">
        <h2 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
          <FaLock /> Privacy & Security
        </h2>

        <div className="space-y-3">
          {Object.entries(settings.privacy).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-dark-700 rounded-lg"
            >
              <div>
                <h3 className="text-white font-semibold capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-gray-400 text-sm">
                  {key === 'shareLocation' && 'Allow emergency services to access your location'}
                  {key === 'allowContactAccess' && 'Grant access to emergency contacts'}
                  {key === 'emergencySharing' && 'Share emergency details with authorized personnel'}
                </p>
              </div>
              <button
                onClick={() => handleToggle('privacy', key)}
                className="btn-icon hover:bg-red-600/20 text-red-400 text-2xl"
              >
                {value ? <FaToggleOn /> : <FaToggleOff />}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-400 font-semibold text-sm mb-1">⚠️ Privacy Notice</p>
          <p className="text-gray-400 text-sm">
            Your location and contact information are encrypted and only shared during emergencies. 
            See our <a href="#" className="text-red-400 hover:underline">Privacy Policy</a> for more details.
          </p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="card">
        <h2 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
          <FaUser /> Account Settings
        </h2>

        <div className="space-y-3">
          <div className="p-4 bg-dark-700 rounded-lg">
            <label className="text-gray-400 text-sm block mb-2">Email</label>
            <input
              type="email"
              placeholder="your.email@university.edu"
              className="input"
            />
          </div>

          <div className="p-4 bg-dark-700 rounded-lg">
            <label className="text-gray-400 text-sm block mb-2">Phone</label>
            <input
              type="tel"
              placeholder="+91-9876543210"
              className="input"
            />
          </div>

          <div className="p-4 bg-dark-700 rounded-lg">
            <label className="text-gray-400 text-sm block mb-2">Student ID</label>
            <input
              type="text"
              placeholder="STU2024001234"
              className="input"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Password & Security */}
      <div className="card">
        <h2 className="text-white font-semibold text-xl mb-6">🔐 Password & Security</h2>

        <div className="space-y-3">
          <button className="btn-primary w-full">
            Change Password
          </button>

          <button className="btn-secondary w-full">
            Two-Factor Authentication
          </button>

          <button className="btn-secondary w-full">
            Active Sessions
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-600/50">
        <h2 className="text-red-400 font-semibold text-xl mb-4">⚠️ Danger Zone</h2>

        <div className="space-y-3">
          <button className="btn-secondary w-full hover:bg-red-600/20 text-red-400 border border-red-600/50">
            Clear All Data
          </button>

          <button className="btn-secondary w-full hover:bg-red-600/20 text-red-400 border border-red-600/50">
            Delete Account
          </button>
        </div>

        <p className="text-gray-400 text-xs mt-4">
          These actions cannot be undone. Please proceed with caution.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 btn-primary flex justify-center items-center gap-2"
        >
          <FaSave /> Save All Changes
        </button>

        <button className="flex-1 btn-secondary">
          Reset to Defaults
        </button>
      </div>

      {/* Help & Support */}
      <div className="card">
        <h2 className="text-white font-semibold text-xl mb-4">❓ Help & Support</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a href="#" className="btn-secondary w-full text-center">
            📖 Documentation
          </a>

          <a href="#" className="btn-secondary w-full text-center">
            💬 Contact Support
          </a>

          <a href="#" className="btn-secondary w-full text-center">
            🐛 Report Bug
          </a>

          <a href="#" className="btn-secondary w-full text-center">
            💡 Request Feature
          </a>
        </div>
      </div>

      {/* App Info */}
      <div className="card text-center">
        <p className="text-gray-400 text-sm">ECHO SOS Alert System</p>
        <p className="text-white font-semibold text-lg mt-2">Version 1.0.0</p>
        <p className="text-gray-500 text-xs mt-2">
          Built with React • Powered by Campus Security
        </p>
      </div>
    </div>
  )
}

export default Settings
