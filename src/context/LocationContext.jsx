import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const LocationContext = createContext()

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [locationHistory, setLocationHistory] = useState([])

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve) => {
      setLoading(true)
      setError(null)

      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser')
        setLoading(false)
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          const newLocation = {
            latitude,
            longitude,
            accuracy,
            timestamp: new Date(),
            address: null
          }
          setLocation(newLocation)
          setLocationHistory(prev => [newLocation, ...prev])
          reverseGeocode(latitude, longitude)
          setLoading(false)
          resolve(newLocation)
        },
        (err) => {
          setError(err.message)
          setLoading(false)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    })
  }, [])

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
      const data = await response.json()
      
      setLocation(prev => ({
        ...prev,
        address: data.address?.display_name || 'Location updated'
      }))
    } catch (err) {
      console.warn('Reverse geocoding failed:', err)
    }
  }

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported')
      return null
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const newLocation = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date()
        }
        setLocation(newLocation)
        setLocationHistory(prev => [newLocation, ...prev].slice(0, 100))
      },
      (err) => setError(err.message)
    )

    return watchId
  }, [])

  const stopWatchingLocation = useCallback((watchId) => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  const getMapUrl = useCallback(() => {
    if (!location) return null
    return `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=18`
  }, [location])

  const value = {
    location,
    loading,
    error,
    locationHistory,
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    getMapUrl
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider')
  }
  return context
}
