import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  FaHome, FaClock, FaMapMarkerAlt, FaPhoneAlt, 
  FaBell, FaHistory, FaCog, FaTimes, FaCalendarAlt,
  FaFileAlt, FaCheckCircle, FaBuffer
} from 'react-icons/fa'

const Sidebar = ({ 
  open, 
  setOpen, 
  activeFeature, 
  setActiveFeature, 
  coordinationSubView, 
  setCoordinationSubView 
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const userRole = localStorage.getItem('userRole')

  const isCoordinationMode = activeFeature === 'coordination'
  const isSosMode = activeFeature === 'sos'

  // Dynamic Navigation Items
  let navItems = []

  if (isCoordinationMode) {
    // Event Coordination Sidebar Items
    navItems = [
      { 
        type: 'action',
        action: () => {
          setActiveFeature(null)
          navigate('/')
        },
        isActive: false,
        icon: FaHome, 
        label: 'Dashboard Hub' 
      },
      { 
        type: 'action',
        action: () => {
          setCoordinationSubView('request')
          navigate('/')
        },
        isActive: coordinationSubView === 'request',
        icon: FaFileAlt, 
        label: 'Event Request Form' 
      },
      { 
        type: 'action',
        action: () => {
          setCoordinationSubView('review')
          navigate('/')
        },
        isActive: coordinationSubView === 'review',
        icon: FaCheckCircle, 
        label: 'Admin Review Panel' 
      },
      { 
        type: 'action',
        action: () => {
          setCoordinationSubView('logs')
          navigate('/')
        },
        isActive: coordinationSubView === 'logs',
        icon: FaHistory, 
        label: 'Log History' 
      },
      { 
        type: 'action',
        action: () => {
          setCoordinationSubView('conflict')
          navigate('/')
        },
        isActive: coordinationSubView === 'conflict',
        icon: FaBuffer, 
        label: 'Conflict Analysis' 
      }
    ]
  } else if (isSosMode) {
    // SOS / Safety Sidebar Items
    navItems = [
      { 
        type: 'action',
        action: () => {
          setActiveFeature(null)
          navigate('/')
        },
        isActive: false,
        icon: FaHome, 
        label: 'Dashboard Hub' 
      },
      { 
        type: 'link', 
        path: '/sos', 
        icon: FaClock, 
        label: 'SOS Alert' 
      },
      { 
        type: 'link', 
        path: '/tracking', 
        icon: FaMapMarkerAlt, 
        label: 'Emergency Tracking' 
      },
      { 
        type: 'link', 
        path: '/contacts', 
        icon: FaPhoneAlt, 
        label: 'Emergency Contacts' 
      },
      { 
        type: 'link', 
        path: '/notifications', 
        icon: FaBell, 
        label: 'Notifications' 
      },
      { 
        type: 'link', 
        path: '/history', 
        icon: FaHistory, 
        label: 'History' 
      },
      { 
        type: 'link', 
        path: '/settings', 
        icon: FaCog, 
        label: 'Settings' 
      }
    ]
  } else {
    // Main Landing Hub Mode: Only show Dashboard Link
    navItems = [
      { 
        type: 'action',
        action: () => {
          setActiveFeature(null)
          navigate('/')
        },
        isActive: location.pathname === '/' && activeFeature === null,
        icon: FaHome, 
        label: 'Dashboard Hub' 
      }
    ]
  }

  const checkActive = (item) => {
    if (item.type === 'action') {
      return item.isActive
    }
    return location.pathname === item.path
  }

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-dark-800 border-r border-dark-700 transform transition-transform duration-300 z-40 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-dark-700 flex items-center justify-between animate-scaleIn">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isCoordinationMode ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                Coordination
              </>
            ) : isSosMode ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                Emergency
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                ECHO Hub
              </>
            )}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden btn-icon text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = checkActive(item)
            if (item.type === 'action') {
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action()
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-semibold text-sm cursor-pointer ${
                    active
                      ? isCoordinationMode 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10'
                        : 'bg-red-650 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                </button>
              )
            } else {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (item.path === '/') {
                      setActiveFeature(null)
                    }
                    setOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold text-sm ${
                    active
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/10'
                      : 'text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                </Link>
              )
            }
          })}
        </nav>

        {activeFeature && (
          <div className="absolute bottom-4 left-4 right-4 animate-scaleIn">
            <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                {isCoordinationMode ? 'Coordination Desk' : 'Emergency Hotline'}
              </h3>
              <p className="text-white font-bold text-lg">
                {isCoordinationMode ? '📞 104' : '📞 100'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isCoordinationMode ? 'Campus Events Office' : 'Campus Security'}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
