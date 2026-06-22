import React from 'react'
import { FaMapMarkerAlt, FaExternalLinkAlt, FaSync } from 'react-icons/fa'

const LocationMap = ({ location, loading, onRefresh }) => {
  const handleOpenMap = () => {
    if (location) {
      const mapUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`
      window.open(mapUrl, '_blank')
    }
  }

  const handleOpenOpenStreetMap = () => {
    if (location) {
      const mapUrl = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=18`
      window.open(mapUrl, '_blank')
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-600" />
          Current Location
        </h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-icon hover:bg-red-600/20 text-red-400 disabled:opacity-50"
          title="Refresh location"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="spinner"></div>
          <span className="ml-2 text-gray-400">Getting location...</span>
        </div>
      ) : location ? (
        <>
          <div className="space-y-3 mb-4">
            <div className="bg-dark-700 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Latitude</p>
              <p className="text-white font-mono font-semibold">
                {location.latitude?.toFixed(6)}
              </p>
            </div>

            <div className="bg-dark-700 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Longitude</p>
              <p className="text-white font-mono font-semibold">
                {location.longitude?.toFixed(6)}
              </p>
            </div>

            <div className="bg-dark-700 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Accuracy</p>
              <p className="text-white font-mono font-semibold">
                ±{location.accuracy?.toFixed(2)}m
              </p>
            </div>

            {location.address && (
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Address</p>
                <p className="text-white text-sm break-words">
                  {location.address}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOpenMap}
              className="btn-secondary flex justify-center items-center gap-2"
              title="Open in Google Maps"
            >
              <FaExternalLinkAlt className="text-sm" />
              <span className="hidden sm:inline">Google</span>
            </button>
            <button
              onClick={handleOpenOpenStreetMap}
              className="btn-secondary flex justify-center items-center gap-2"
              title="Open in OpenStreetMap"
            >
              <FaExternalLinkAlt className="text-sm" />
              <span className="hidden sm:inline">OSM</span>
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">Location not available</p>
          <p className="text-gray-500 text-sm mt-2">
            Enable location services to share your position
          </p>
        </div>
      )}
    </div>
  )
}

export default LocationMap
