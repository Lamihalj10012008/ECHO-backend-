import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPaperPlane, FaRedo, FaCheckCircle, FaExclamationCircle, FaSpinner, FaArrowLeft, FaShieldAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useAlert } from '../context/AlertContext'

const NotificationStatus = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentAlert, setCurrentAlert } = useAlert()
  const [loading, setLoading] = useState(true)
  const [retryingId, setRetryingId] = useState(null)
  const [escalating, setEscalating] = useState(false)
  const [alertData, setAlertData] = useState(null)

  const fetchLiveStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const baseApiUrl = apiUrl.replace(/\/v1$/, '')
      const token = localStorage.getItem('authToken')
      
      const response = await axios.get(`${baseApiUrl}/sos/live-status/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setAlertData(response.data)
      // If this is the active alert, sync with AlertContext
      if (currentAlert && (currentAlert.id === response.data.id || currentAlert.alertId === response.data.alert_id)) {
        setCurrentAlert(prev => ({
          ...prev,
          status: response.data.status,
          escalation_level: response.data.escalation_level,
          notifications: response.data.notifications
        }))
      }
    } catch (error) {
      console.error("Failed to fetch live alert status:", error)
      toast.error("Failed to fetch real-time delivery logs.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveStatus()
    // Poll every 3 seconds for backup update coverage
    const interval = setInterval(fetchLiveStatus, 3000)
    return () => clearInterval(interval)
  }, [id])

  // Retry sending a notification
  const handleRetry = async (log) => {
    setRetryingId(log.id)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const baseApiUrl = apiUrl.replace(/\/v1$/, '')
      const token = localStorage.getItem('authToken')
      
      await axios.post(`${baseApiUrl}/notifications/send`, {
        sos_id: alertData.id,
        recipient: log.recipient,
        channel: log.channel,
        message: `🚨 RETRIED SOS ALERT 🚨\nStudent ID: ${localStorage.getItem('userId') || 'Student'}\nLocation: ${alertData.nearest_security_office}\nImmediate assistance required.`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success(`Resending ${log.channel} to ${log.recipient}...`)
      // Refresh status immediately
      fetchLiveStatus()
    } catch (error) {
      console.error("Failed to retry notification:", error)
      toast.error("Failed to dispatch manual retry.")
    } finally {
      setRetryingId(null)
    }
  }

  // Escalate SOS Level manually
  const handleEscalate = async () => {
    if (escalating) return
    setEscalating(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const baseApiUrl = apiUrl.replace(/\/v1$/, '')
      const token = localStorage.getItem('authToken')
      
      const response = await axios.post(`${baseApiUrl}/sos/${id}/escalate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.error("⚠️ ALERT ESCALATED TO LEVEL 3 (Emergency Response Team)!")
      setAlertData(prev => ({
        ...prev,
        escalation_level: response.data.escalation_level
      }))
      fetchLiveStatus()
    } catch (error) {
      console.error("Failed to escalate SOS status:", error)
      toast.error(error.response?.data?.detail || "Failed to escalate emergency.")
    } finally {
      setEscalating(false)
    }
  }

  if (loading && !alertData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white">
        <div className="text-center space-y-4">
          <FaSpinner className="w-12 h-12 animate-spin text-red-500 mx-auto" />
          <p className="text-gray-400">Loading delivery statuses...</p>
        </div>
      </div>
    )
  }

  if (!alertData) {
    return (
      <div className="p-8 text-center bg-dark-900 text-white">
        <p className="text-red-500 font-semibold mb-4">Emergency Incident Not Found</p>
        <button onClick={() => navigate('/history')} className="btn-secondary flex items-center gap-2 mx-auto">
          <FaArrowLeft /> Back to History
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/tracking')} className="btn-secondary flex items-center gap-2">
          <FaArrowLeft /> Back to Tracking
        </button>
        <h1 className="text-xl font-mono text-gray-500">ID: {alertData.alert_id}</h1>
      </div>

      {/* Incident details card */}
      <div className="card border-l-4 border-red-600 bg-dark-800/50 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="bg-red-900/50 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {alertData.status}
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">SOS Incident Summary</h2>
            <p className="text-gray-400 text-sm mt-1">
              Triggered: {new Date(alertData.created_at).toLocaleString()}
            </p>
          </div>
          
          {/* Escalation details */}
          <div className="bg-dark-700 p-4 rounded-xl border border-dark-600 flex flex-col items-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Escalation Level</span>
            <span className="text-2xl font-black text-white mt-1">
              {alertData.escalation_level === 1 ? "Level 1 (Family)" : alertData.escalation_level === 2 ? "Level 2 (Security)" : "Level 3 (ERT)"}
            </span>
            {alertData.escalation_level < 3 && (
              <button 
                onClick={handleEscalate}
                disabled={escalating}
                className="mt-2 btn-primary bg-amber-600 hover:bg-amber-700 text-xs py-1 px-3 flex items-center gap-1"
              >
                <FaShieldAlt className="text-xs" /> {escalating ? "Escalating..." : "Escalate to Level 3"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-dark-700">
          <div>
            <p className="text-gray-400 text-xs">Nearest Security Post Assigned</p>
            <p className="text-white font-semibold text-lg">{alertData.nearest_security_office || "Computing Proximity..."}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Tracking Officer</p>
            <p className="text-white font-semibold text-lg">{alertData.tracking?.assigned_officer || "Pending Officer"}</p>
          </div>
        </div>
      </div>

      {/* Delivery Status Logs */}
      <div className="card">
        <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
          <FaPaperPlane className="text-red-500" /> Real-time Notification Logs
        </h3>

        {alertData.notifications.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No SMS/WhatsApp logs registered for this incident.</p>
        ) : (
          <div className="space-y-4">
            {alertData.notifications.map((log) => (
              <div key={log.id} className="p-4 bg-dark-700/50 rounded-xl border border-dark-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-dark-700">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold">{log.recipient}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.channel === 'WhatsApp' ? 'bg-green-900/40 text-green-400 border border-green-500/20' : 'bg-blue-900/40 text-blue-400 border border-blue-500/20'
                    }`}>
                      {log.channel}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs font-mono">
                    Provider ID: {log.provider_message_id || 'Generating...'}
                  </p>
                  <p className="text-gray-500 text-[10px]">
                    Sent: {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    log.delivery_status === 'delivered' 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/20'
                      : log.delivery_status === 'failed'
                      ? 'bg-red-900/30 text-red-400 border border-red-500/20'
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/20 animate-pulse'
                  }`}>
                    {log.delivery_status === 'delivered' ? (
                      <>
                        <FaCheckCircle className="text-xs" /> Delivered
                      </>
                    ) : log.delivery_status === 'failed' ? (
                      <>
                        <FaExclamationCircle className="text-xs" /> Failed
                      </>
                    ) : (
                      <>
                        <FaSpinner className="text-xs animate-spin" /> In Transit
                      </>
                    )}
                  </span>

                  {log.delivery_status === 'failed' && (
                    <button
                      onClick={() => handleRetry(log)}
                      disabled={retryingId === log.id}
                      className="btn-secondary bg-red-950/20 hover:bg-red-900/40 border-red-800/50 text-red-400 text-xs py-1 px-3 flex items-center gap-1.5"
                      title="Retry Dispatch"
                    >
                      <FaRedo className={retryingId === log.id ? 'animate-spin' : ''} /> {retryingId === log.id ? 'Sending...' : 'Retry'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 bg-dark-800/30">
          <p className="text-white font-bold text-sm">💡 Twilio Status Delivery</p>
          <p className="text-gray-400 text-xs mt-1">Twilio notifies this dashboard of SMS/WhatsApp receipts in real-time via webhooks.</p>
        </div>
        <div className="card p-4 bg-dark-800/30">
          <p className="text-white font-bold text-sm">💡 Automated Retry Loop</p>
          <p className="text-gray-400 text-xs mt-1">If any message delivery fails, you can retry it manually using the buttons above.</p>
        </div>
        <div className="card p-4 bg-dark-800/30">
          <p className="text-white font-bold text-sm">💡 ERT Level 3 Trigger</p>
          <p className="text-gray-400 text-xs mt-1">Escalating to Level 3 ERT immediately alerts campus emergency crisis response teams.</p>
        </div>
      </div>
    </div>
  )
}

export default NotificationStatus
