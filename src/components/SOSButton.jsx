import React, { useState, useRef, useEffect } from 'react'
import { useAlert } from '../context/AlertContext'
import { useLocation } from '../context/LocationContext'
import { toast } from 'react-toastify'

const SOSButton = ({ onPress, emergencyType = 'Other' }) => {
  const [pressing, setPressing] = useState(false)
  const [pressure, setPressure] = useState(0) // Smooth progress 0-100
  const [countdown, setCountdown] = useState(null) // Numeric countdown 3,2,1
  const [activated, setActivated] = useState(false)
  
  const timerRef = useRef(null)
  const pressIntervalRef = useRef(null)
  
  const { createAlert } = useAlert()
  const { getCurrentLocation, location } = useLocation()

  const handlePressStart = () => {
    setPressing(true)
    setCountdown(3)
    setPressure(0)

    // Trigger brief starter vibration
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Smooth circular progress interval (50ms)
    const startTime = Date.now()
    pressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const percent = Math.min((elapsed / 3000) * 100, 100)
      setPressure(percent)
    }, 50)

    // Numerical countdown tick interval (1000ms)
    let secondsLeft = 3
    timerRef.current = setInterval(() => {
      secondsLeft -= 1
      if (secondsLeft > 0) {
        setCountdown(secondsLeft)
        // Vibrate on each tick
        if (navigator.vibrate) {
          navigator.vibrate(80)
        }
      } else {
        // Complete hold - trigger alert!
        clearInterval(timerRef.current)
        clearInterval(pressIntervalRef.current)
        timerRef.current = null
        pressIntervalRef.current = null
        handleSOSActivation()
      }
    }, 1000)
  }

  const handlePressEnd = () => {
    setPressing(false)
    setCountdown(null)
    setPressure(0)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (pressIntervalRef.current) {
      clearInterval(pressIntervalRef.current)
      pressIntervalRef.current = null
    }
  }

  const handleSOSActivation = async () => {
    setPressing(false)
    setActivated(true)

    // Get current coordinates
    let currentLoc = null
    try {
      currentLoc = await getCurrentLocation()
    } catch (e) {
      console.warn('Failed to retrieve precise GPS coordinates:', e)
    }

    const alertData = {
      type: emergencyType,
      location: currentLoc || location,
      description: `Emergency ${emergencyType} alert activated from client.`
    }

    try {
      const alert = await createAlert(alertData)
      toast.error('🚨 SOS EMERGENCY ACTIVATED!', {
        position: 'top-center',
        autoClose: 5000
      })
      
      // Perform longer activation vibration pattern
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 500])
      }

      // Play emergency alarm siren sound
      playEmergencySound()

      if (onPress) {
        onPress(alert)
      }

      // Reset button state after 3 seconds
      setTimeout(() => {
        setActivated(false)
      }, 3000)
    } catch (error) {
      console.error('Failed to trigger SOS alert:', error)
      toast.error('Failed to trigger SOS. Please try again.')
      setActivated(false)
    }
  }

  const playEmergencySound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Play a rising frequency siren sweep
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 0.6)
      oscillator.type = 'sawtooth'

      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.6)
    } catch (error) {
      console.warn('Failed to play emergency sound:', error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative select-none">
        {/* Pulsing background rings during hold */}
        {pressing && (
          <>
            <div className="absolute inset-0 w-32 h-32 border-4 border-red-600 rounded-full opacity-40 animate-ping"></div>
            <div className="absolute -inset-2 w-36 h-36 border-2 border-red-500 rounded-full opacity-25 animate-pulse"></div>
          </>
        )}

        {/* Main button */}
        <button
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center text-white font-extrabold text-2xl transition-all duration-200 z-10 select-none ${
            activated
              ? 'bg-red-500 shadow-2xl scale-95'
              : pressing
              ? 'bg-red-600 shadow-2xl scale-105'
              : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-2xl'
          }`}
          title="Hold for 3 seconds to activate SOS"
        >
          {pressing && countdown !== null ? (
            <span className="text-6xl font-black text-white animate-pulse">{countdown}</span>
          ) : activated ? (
            <span className="text-5xl animate-bounce">🚨</span>
          ) : (
            <span className="text-5xl hover:scale-110 transition-transform">🚨</span>
          )}
        </button>

        {/* Circular progress overlay */}
        {pressing && (
          <svg className="absolute inset-0 w-32 h-32 transform -rotate-90 pointer-events-none z-20" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(220, 38, 38, 0.2)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={`${(pressure / 100) * 283} 283`}
              className="transition-all duration-100"
            />
          </svg>
        )}
      </div>

      {/* Helper text display */}
      <div className="text-center">
        {pressing ? (
          <>
            <p className="text-white font-black text-xl animate-pulse">
              HOLDING...
            </p>
            <p className="text-red-400 text-xs mt-1">Releasing cancels SOS dispatch</p>
          </>
        ) : activated ? (
          <>
            <p className="text-red-400 font-bold text-lg animate-bounce">
              🚨 ALERT ACTIVATED 🚨
            </p>
            <p className="text-gray-400 text-sm">Emergency response notified</p>
          </>
        ) : (
          <>
            <p className="text-white font-bold text-lg">Hold to Send SOS</p>
            <p className="text-gray-400 text-sm">Hold continuously for 3s</p>
          </>
        )}
      </div>
    </div>
  )
}

export default SOSButton
