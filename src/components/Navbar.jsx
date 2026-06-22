import React from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaBell, FaUser, FaCog } from 'react-icons/fa'
import { useAlert } from '../context/AlertContext'
import { useTheme } from '../context/ThemeContext'

const Navbar = ({ onMenuClick }) => {
  const { notifications } = useAlert()
  const { isDark, toggleTheme } = useTheme()
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden btn-icon"
            aria-label="Menu"
          >
            <FaBars className="text-xl" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-emergency rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🚨</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg text-white">ECHO</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/notifications" 
            className="relative btn-icon"
            aria-label="Notifications"
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </Link>

          <button
            onClick={toggleTheme}
            className="btn-icon"
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <Link 
            to="/settings" 
            className="btn-icon"
            aria-label="Settings"
          >
            <FaCog className="text-lg" />
          </Link>

          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-primary items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 transition-opacity"
            title="Log Out"
          >
            👤
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
