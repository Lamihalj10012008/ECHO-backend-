import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

// Global axios interceptor to handle expired JWT tokens (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired (401 Unauthorized). Clearing token and reloading...");
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
import { AlertProvider } from './context/AlertContext'
import { LocationProvider } from './context/LocationContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import SOSAlert from './pages/SOSAlert'
import EmergencyTracking from './pages/EmergencyTracking'
import EmergencyContacts from './pages/EmergencyContacts'
import NotificationCenter from './pages/NotificationCenter'
import EmergencyHistory from './pages/EmergencyHistory'
import Settings from './pages/Settings'
import Coordination from './pages/Coordination'
import NotificationStatus from './pages/NotificationStatus'
import Login from './pages/Login'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(null) // null, 'sos', 'coordination'
  const [coordinationSubView, setCoordinationSubView] = useState('request') // 'request', 'review', 'logs', 'conflict'
  const [token, setToken] = useState(() => {
    return localStorage.getItem('authToken')
  })

  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  if (!token) {
    return (
      <ThemeProvider>
        <Login setToken={setToken} />
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AlertProvider>
        <LocationProvider>
          <Router>
            <div className="flex h-screen bg-dark-900 text-gray-100 font-sans">
              <Sidebar 
                open={sidebarOpen} 
                setOpen={setSidebarOpen} 
                activeFeature={activeFeature} 
                setActiveFeature={setActiveFeature}
                coordinationSubView={coordinationSubView}
                setCoordinationSubView={setCoordinationSubView}
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={
                      <Dashboard 
                        activeFeature={activeFeature} 
                        setActiveFeature={setActiveFeature}
                        coordinationSubView={coordinationSubView}
                        setCoordinationSubView={setCoordinationSubView}
                      />
                    } />
                    <Route path="/sos" element={<SOSAlert />} />
                    <Route path="/tracking" element={<EmergencyTracking />} />
                    <Route path="/contacts" element={<EmergencyContacts />} />
                    <Route path="/notifications" element={<NotificationCenter />} />
                    <Route path="/history" element={<EmergencyHistory />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/notifications/status/:id" element={<NotificationStatus />} />
                    <Route path="/coordination" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
            <ToastContainer 
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </Router>
        </LocationProvider>
      </AlertProvider>
    </ThemeProvider>
  )
}

export default App
