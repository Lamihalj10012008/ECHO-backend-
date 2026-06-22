import React from 'react'

const EmergencyTypeSelector = ({ selected, onChange }) => {
  const emergencyTypes = [
    { id: 'medical', label: 'Medical Emergency', icon: '🏥', color: 'bg-blue-600' },
    { id: 'harassment', label: 'Harassment', icon: '⚠️', color: 'bg-orange-600' },
    { id: 'accident', label: 'Accident', icon: '🚗', color: 'bg-yellow-600' },
    { id: 'fire', label: 'Fire Emergency', icon: '🔥', color: 'bg-red-600' },
    { id: 'theft', label: 'Theft', icon: '🔓', color: 'bg-purple-600' },
    { id: 'other', label: 'Other', icon: '❓', color: 'bg-gray-600' },
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-white font-semibold">Select Emergency Type</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {emergencyTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selected === type.id
                ? `${type.color} border-white text-white`
                : 'bg-dark-700 border-dark-600 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="text-3xl mb-2">{type.icon}</div>
            <p className="text-sm font-medium">{type.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default EmergencyTypeSelector
