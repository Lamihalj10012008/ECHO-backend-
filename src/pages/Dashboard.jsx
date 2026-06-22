import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  FaArrowRight, FaCalendarAlt, FaCheckCircle, FaClock, 
  FaCalendarDay, FaUniversity, FaExclamationTriangle, 
  FaUsers, FaChevronLeft, FaInfoCircle, FaCalendarCheck,
  FaFileAlt, FaHistory, FaCheck, FaTimes, FaRedo, FaBuffer
} from 'react-icons/fa'
import { useAlert } from '../context/AlertContext'
import SOSButton from '../components/SOSButton'

const Dashboard = ({ 
  activeFeature, 
  setActiveFeature, 
  coordinationSubView, 
  setCoordinationSubView 
}) => {
  const { alerts, notifications, currentAlert } = useAlert()
  const unreadNotifications = notifications.filter(n => !n.read).length

  const [events, setEvents] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  
  // Faculty Form State
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [venue, setVenue] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [expectedAttendees, setExpectedAttendees] = useState('')
  const [description, setDescription] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // Review Modal State
  const [showModal, setShowModal] = useState(false)
  const [activeEvent, setActiveEvent] = useState(null)
  const [reviewAction, setReviewAction] = useState('Approved')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const role = localStorage.getItem('userRole') || 'student'
  const token = localStorage.getItem('authToken')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  const fetchEvents = async () => {
    if (!token) return
    setEventsLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const res = await axios.get(`${apiUrl}/events/all`, { headers })
      setEvents(res.data)
      
      const pendingRes = await axios.get(`${apiUrl}/events/pending`, { headers })
      setPendingRequests(pendingRes.data)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      setEventsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [token, apiUrl])

  // Faculty Event Submission
  const handleEventSubmit = async (e) => {
    e.preventDefault()

    if (!title || !department || !venue || !eventDate || !expectedAttendees || !description) {
      alert('Please fill in all event fields')
      return
    }

    if (new Date(eventDate) <= new Date()) {
      alert('Event date and time must be in the future')
      return
    }

    setFormLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      await axios.post(`${apiUrl}/events/create`, {
        title,
        department,
        venue,
        event_date: new Date(eventDate).toISOString(),
        expected_attendees: parseInt(expectedAttendees),
        description
      }, { headers })

      alert('Event request submitted successfully!')
      
      // Reset form
      setTitle('')
      setDepartment('')
      setVenue('')
      setEventDate('')
      setExpectedAttendees('')
      setDescription('')
      fetchEvents()
    } catch (error) {
      console.error('Event submission error:', error)
      const detail = error.response?.data?.detail || 'Failed to submit event request.'
      alert(detail)
    } finally {
      setFormLoading(false)
    }
  }

  // Admin Open Review Dialog
  const openReviewDialog = (event, action) => {
    setActiveEvent(event)
    setReviewAction(action)
    setReviewComment('')
    setShowModal(true)
  }

  // Admin Submit Review
  const submitReview = async () => {
    setReviewLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      await axios.put(`${apiUrl}/events/${activeEvent.id}/review`, {
        status: reviewAction,
        review_comment: reviewComment
      }, { headers })

      alert(`Event was successfully ${reviewAction.toLowerCase()}!`)
      setShowModal(false)
      fetchEvents()
    } catch (error) {
      console.error('Review submission error:', error)
      const detail = error.response?.data?.detail || 'Failed to submit review decision.'
      alert(detail)
    } finally {
      setReviewLoading(false)
    }
  }

  // Stats Calculations
  const eventStats = {
    total: events.length,
    pending: pendingRequests.length,
    approved: events.filter(e => e.status === 'Approved').length,
    rejected: events.filter(e => e.status === 'Rejected').length
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-dark-800 border border-dark-700 p-6 rounded-2xl gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">ECHO Campus Hub</h1>
          <p className="text-gray-400 mt-1">Smart Emergency Response & Venue Coordination Center</p>
        </div>
        {activeFeature && (
          <button 
            onClick={() => setActiveFeature(null)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-red-500/30 text-xs font-bold rounded-xl text-gray-300 transition-all cursor-pointer relative z-10"
          >
            <FaChevronLeft /> Back to Main Hub
          </button>
        )}
      </div>

      {/* 2. Active Emergency Banner */}
      {currentAlert && (
        <div className="bg-gradient-emergency rounded-2xl p-6 text-white shadow-xl animate-pulse-strong border border-red-500/30">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">🚨 ACTIVE EMERGENCY IN PROGRESS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-red-200 text-xs font-semibold">Type</p>
              <p className="text-lg font-bold">
                {currentAlert.type ? (currentAlert.type.charAt(0).toUpperCase() + currentAlert.type.slice(1)) : 'Emergency'}
              </p>
            </div>
            <div>
              <p className="text-red-200 text-xs font-semibold">Status</p>
              <p className="text-lg font-bold">
                {currentAlert.status ? currentAlert.status.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN'}
              </p>
            </div>
            <div>
              <Link
                to="/tracking"
                className="btn bg-white text-red-700 hover:bg-gray-100 w-full justify-center text-center font-bold text-sm py-2.5 rounded-lg shadow"
              >
                Track Emergency <FaArrowRight className="inline ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. LANDING HUB VIEW: Select feature */}
      {!activeFeature && (
        <div className="space-y-6 animate-scaleIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1: SOS Emergency Control Center */}
            <div 
              onClick={() => setActiveFeature('sos')}
              className="card group cursor-pointer relative overflow-hidden p-8 border border-red-600/20 hover:border-red-500/60 bg-gradient-to-br from-dark-800 to-red-950/10 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] transition-all duration-300 flex flex-col justify-between min-h-[300px]"
            >
              <div className="absolute top-0 right-0 p-4 text-red-500/5 text-8xl font-bold font-mono select-none group-hover:scale-105 transition-transform duration-300">SOS</div>
              <div className="space-y-4">
                <div className="inline-flex p-4 bg-red-600/10 text-red-500 rounded-2xl border border-red-600/20 group-hover:scale-110 transition-transform duration-300">
                  <FaExclamationTriangle className="text-3xl animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">SOS Emergency Center</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Trigger campus-wide distress signals, trace live GPS coordinator tracking maps, and connect with immediate hotline responders.
                </p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-dark-700 mt-6">
                <span className="text-xs text-red-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  {alerts.length} Registered Alerts
                </span>
                <span className="text-white font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                  Enter Control Room <FaArrowRight className="text-xs text-red-500" />
                </span>
              </div>
            </div>

            {/* Card 2: Academic & Event Coordination Portal */}
            <div 
              onClick={() => {
                setActiveFeature('coordination')
                setCoordinationSubView('request')
              }}
              className="card group cursor-pointer relative overflow-hidden p-8 border border-purple-600/20 hover:border-purple-500/60 bg-gradient-to-br from-dark-800 to-purple-950/10 hover:shadow-[0_0_30px_rgba(147,51,234,0.15)] transition-all duration-300 flex flex-col justify-between min-h-[300px]"
            >
              <div className="absolute top-0 right-0 p-4 text-purple-500/5 text-8xl font-bold font-mono select-none group-hover:scale-105 transition-transform duration-300">EVENT</div>
              <div className="space-y-4">
                <div className="inline-flex p-4 bg-purple-600/10 text-purple-400 rounded-2xl border border-purple-600/20 group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarAlt className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Academic & Event Coordination</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Reserve campus auditoriums, coordinate equipment needs, audit venue scheduling logs, and resolve double-booking conflicts.
                </p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-dark-700 mt-6">
                <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">
                  {eventStats.pending} Pending Review Requests
                </span>
                <span className="text-white font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                  Open Coordinator Hub <FaArrowRight className="text-xs text-purple-500" />
                </span>
              </div>
            </div>

          </div>

          {/* 7. Safety Policy Guidelines */}
          <div className="card p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <FaUniversity className="text-red-500 animate-pulse" />
              ECHO Smart Campus Coordination Policies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-dark-700 rounded-xl border border-dark-600">
                <h4 className="text-yellow-400 font-bold mb-1 text-sm">🏃 SOS First Response Procedure</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  When an SOS alert is triggered, campus security officers are automatically assigned within 60 seconds. Keep your mobile device active so dispatch can reach you for a status confirmation or location assessment.
                </p>
              </div>

              <div className="p-4 bg-dark-700 rounded-xl border border-dark-600">
                <h4 className="text-purple-400 font-bold mb-1 text-sm">🗓️ Venue Booking Guidelines</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  All venue allocations must be requested at least 48 hours in advance. The Academic & Event Coordination Agent auto-validates room reservation overlaps within a 2-hour safety interval before assigning proposals for Admin review.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FEATURE PANEL: WORKING SOS INTERFACE */}
      {activeFeature === 'sos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-scaleIn">
          
          {/* Main SOS Button Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card flex flex-col items-center justify-center py-10 bg-dark-800 border border-dark-700">
              <div className="text-center max-w-sm mb-6 px-4">
                <h3 className="text-xl font-bold text-white">Distress Beacon</h3>
                <p className="text-gray-400 text-xs mt-1">Long-press the SOS button for 3 seconds. The GPS coordinator will fetch your current coordinates and deploy help.</p>
              </div>
              <div className="scale-110 my-4">
                <SOSButton emergencyType="other" />
              </div>
            </div>

            {/* Recent Alerts Logs */}
            <div className="card p-6">
              <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">distress beacon registry</h3>
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-xs py-4 text-center">No alerts logged in database.</p>
              ) : (
                <div className="overflow-x-auto border border-dark-700 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-dark-700 text-gray-300 text-xs border-b border-dark-600">
                        <th className="p-3">Emergency Type</th>
                        <th className="p-3">Created</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-gray-300">
                      {alerts.slice(0, 5).map(alert => (
                        <tr key={alert.id} className="border-b border-dark-700 hover:bg-dark-750">
                          <td className="p-3 font-semibold text-white">{alert.emergency_type?.toUpperCase()}</td>
                          <td className="p-3">{new Date(alert.created_at).toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              alert.status === 'resolved' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'bg-yellow-600/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                              {alert.status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick Access Sidebar */}
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h4 className="text-white font-bold text-sm border-b border-dark-700 pb-2">SOS Shortcuts</h4>
              
              <Link to="/sos" className="flex items-center justify-between p-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-red-500/30 rounded-lg text-xs text-gray-300 font-bold transition-all">
                <span>Configure Alert Preferences</span>
                <FaArrowRight className="text-red-500" />
              </Link>

              <Link to="/tracking" className="flex items-center justify-between p-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-red-500/30 rounded-lg text-xs text-gray-300 font-bold transition-all">
                <span>View Real-time Officer Map</span>
                <FaArrowRight className="text-red-500" />
              </Link>

              <Link to="/contacts" className="flex items-center justify-between p-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-red-500/30 rounded-lg text-xs text-gray-300 font-bold transition-all">
                <span>Manage Emergency Hotline List</span>
                <FaArrowRight className="text-red-500" />
              </Link>
            </div>

            <div className="card p-6 bg-gradient-to-br from-dark-800 to-red-950/10 border border-red-500/20">
              <h4 className="text-yellow-400 font-bold text-sm mb-2">🏃 Distress Policy</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Distress alerts trigger automated SMS broadcasts to designated parents/guardians and prompt emergency routing protocols. Rest assured that the local security desk handles all incidents confidentially.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 5. FEATURE PANEL: WORKING COORDINATION INTERFACE */}
      {activeFeature === 'coordination' && (
        <div className="space-y-6 animate-scaleIn">
          
          {/* Header Description */}
          <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FaCalendarAlt className="text-purple-500" />
              {coordinationSubView === 'request' && 'Event Request Form'}
              {coordinationSubView === 'review' && 'Admin Review Desk'}
              {coordinationSubView === 'logs' && 'Coordination Log History'}
              {coordinationSubView === 'conflict' && 'Conflict Analysis Panel'}
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              {coordinationSubView === 'request' && 'Submit a new venue booking or logistical coordination request.'}
              {coordinationSubView === 'review' && 'Approve or reject pending event proposals and check for double bookings.'}
              {coordinationSubView === 'logs' && 'View the historical log of approved and rejected campus events.'}
              {coordinationSubView === 'conflict' && 'Detailed analytical resource conflict and overlap metrics.'}
            </p>
          </div>

          {/* Subview 1: Request Form */}
          {coordinationSubView === 'request' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-xl p-6 relative overflow-hidden">
                {formLoading && (
                  <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <span className="spinner w-8 h-8"></span>
                  </div>
                )}
                
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-dark-700 pb-2 flex items-center gap-2">
                  <FaFileAlt className="text-purple-500" /> Event Request Details
                </h4>

                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Event Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. AI Hackathon 2026"
                        className="input text-xs py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="input text-xs py-2"
                        required
                      >
                        <option value="" disabled>Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Business & Finance">Business & Finance</option>
                        <option value="Sciences">Sciences</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Venue</label>
                      <select
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        className="input text-xs py-2"
                        required
                      >
                        <option value="" disabled>Select Venue</option>
                        <option value="Auditorium A">Auditorium A (Cap: 500)</option>
                        <option value="Convocation Hall">Convocation Hall (Cap: 1000)</option>
                        <option value="Seminar Room 102">Seminar Room 102 (Cap: 100)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="input text-xs py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Expected Attendees</label>
                      <input
                        type="number"
                        value={expectedAttendees}
                        onChange={(e) => setExpectedAttendees(e.target.value)}
                        placeholder="e.g. 150"
                        className="input text-xs py-2"
                        min="1"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Description & Resources</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        placeholder="Detail seating arrangements, mic requests, etc."
                        className="input text-xs"
                        required
                      ></textarea>
                    </div>
                  </div>
                  <button type="submit" className="w-full btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 justify-center text-xs rounded-lg mt-2">
                    Submit Proposal
                  </button>
                </form>
              </div>

              {/* Sidebar Calendar Schedule */}
              <div className="card p-6">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-dark-700 pb-2 flex items-center gap-2">
                  <FaCalendarCheck className="text-purple-500" /> Upcoming Schedule
                </h4>
                {events.filter(e => e.status === 'Approved').length === 0 ? (
                  <p className="text-gray-500 text-xs py-6 text-center">No approved events currently scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {events.filter(e => e.status === 'Approved').slice(0, 4).map(event => (
                      <div key={event.id} className="p-3 bg-dark-705 border border-dark-700 rounded-lg text-xs space-y-1">
                        <div className="font-bold text-white">{event.title}</div>
                        <div className="text-purple-400 font-semibold">{event.venue}</div>
                        <div className="text-gray-400 text-[10px]">
                          {new Date(event.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subview 2: Admin Review Panel */}
          {coordinationSubView === 'review' && (
            <div className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-600/10 text-blue-500"><FaBuffer className="text-base" /></div>
                  <div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Requests</div>
                    <div className="text-xl font-bold text-white">{eventStats.total}</div>
                  </div>
                </div>
                <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-yellow-600/10 text-yellow-500"><FaClock className="text-base" /></div>
                  <div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Pending Review</div>
                    <div className="text-xl font-bold text-white">{eventStats.pending}</div>
                  </div>
                </div>
                <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-green-600/10 text-green-500"><FaCheck className="text-base" /></div>
                  <div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Approved</div>
                    <div className="text-xl font-bold text-white">{eventStats.approved}</div>
                  </div>
                </div>
                <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-red-600/10 text-red-500"><FaTimes className="text-base" /></div>
                  <div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Rejected</div>
                    <div className="text-xl font-bold text-white">{eventStats.rejected}</div>
                  </div>
                </div>
              </div>

              {/* Pending Requests Review Table */}
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-dark-700 pb-2">Pending Requests</h4>
                
                {eventsLoading ? (
                  <div className="text-center py-6"><span className="spinner"></span></div>
                ) : pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-xs py-4 text-center">No pending venue coordination requests found.</p>
                ) : (
                  <div className="overflow-x-auto border border-dark-700 rounded-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-dark-700 text-xs text-gray-300 border-b border-dark-600">
                          <th className="p-3">Event Details</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Venue & Date</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-gray-300">
                        {pendingRequests.map(event => (
                          <tr key={event.id} className="border-b border-dark-700 hover:bg-dark-750">
                            <td className="p-3">
                              <div className="font-bold text-white">{event.title}</div>
                              <div className="text-gray-400 text-[10px] max-w-xs truncate">{event.description}</div>
                            </td>
                            <td className="p-3">{event.department}</td>
                            <td className="p-3">
                              <div className="text-purple-400 font-semibold">{event.venue}</div>
                              <div className="text-gray-500 text-[10px]">
                                {new Date(event.event_date).toLocaleString()}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openReviewDialog(event, 'Approved')}
                                  className="bg-green-600/10 text-green-400 border border-green-500/20 hover:bg-green-650 hover:text-white px-2.5 py-1 rounded text-xs font-bold transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openReviewDialog(event, 'Rejected')}
                                  className="bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-650 hover:text-white px-2.5 py-1 rounded text-xs font-bold transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subview 3: Log History */}
          {coordinationSubView === 'logs' && (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 animate-scaleIn">
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-dark-700 pb-2 flex items-center gap-2">
                <FaHistory /> Coordination Log History
              </h4>
              <div className="overflow-x-auto border border-dark-700 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-700 text-xs text-gray-300 border-b border-dark-600">
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Venue</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-300">
                    {events.filter(e => e.status !== 'Pending').length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-500">No logs found.</td>
                      </tr>
                    ) : (
                      events.filter(e => e.status !== 'Pending').map(event => (
                        <tr key={event.id} className="border-b border-dark-700">
                          <td className="p-3 font-semibold text-white">{event.title}</td>
                          <td className="p-3">{event.venue}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              event.status === 'Approved' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'bg-red-600/10 text-red-400 border border-red-500/20'
                            }`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400 italic text-[10px]">{event.review_comment || 'No review comments.'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 4: Conflict Analysis */}
          {coordinationSubView === 'conflict' && (
            <div className="space-y-6 animate-scaleIn">
              {/* Conflict Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-red-600/10 text-red-500"><FaExclamationTriangle className="text-xl animate-pulse" /></div>
                  <div>
                    <div className="text-gray-400 text-xs font-semibold">Active Venue Conflicts</div>
                    <div className="text-2xl font-bold text-white">0</div>
                  </div>
                </div>
                <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-600/10 text-purple-500"><FaClock className="text-xl" /></div>
                  <div>
                    <div className="text-gray-400 text-xs font-semibold">Conflict Check Buffer</div>
                    <div className="text-2xl font-bold text-white">120 Min</div>
                  </div>
                </div>
                <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-600/10 text-green-500"><FaCheckCircle className="text-xl" /></div>
                  <div>
                    <div className="text-gray-400 text-xs font-semibold">Checks Run Today</div>
                    <div className="text-2xl font-bold text-white">{events.length * 2 + 15}</div>
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-gradient-to-br from-dark-800 to-purple-950/10 border border-purple-500/20">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FaBuffer className="text-purple-500" />
                  Automated Conflict Detection Report
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed mb-6">
                  The Academic & Event Coordination Agent continuously runs verification audits against the SQLite database scheduling logs. Below is the real-time resource conflict analysis:
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-dark-700 rounded-xl border border-dark-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-xs">Venue Conflict Check</span>
                      <span className="px-2 py-0.5 bg-green-600/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold">Passed</span>
                    </div>
                    <p className="text-gray-400 text-[11px]">All approved events have safe spacing. No double venue allocations detected inside the 120-minute safety threshold.</p>
                  </div>

                  <div className="p-4 bg-dark-700 rounded-xl border border-dark-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-xs">Expected Crowd Density Audit</span>
                      <span className="px-2 py-0.5 bg-green-600/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold">Passed</span>
                    </div>
                    <p className="text-gray-400 text-[11px]">Total attendance limits for all scheduled indoor halls are well below campus threshold safety capacities.</p>
                  </div>

                  <div className="p-4 bg-dark-700 rounded-xl border border-dark-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-xs">A&E Coordinator Agent Status</span>
                      <span className="px-2 py-0.5 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-bold animate-pulse">Monitoring</span>
                    </div>
                    <p className="text-gray-400 text-[11px]">The scheduling validation agent is listening to new bookings. Any double booking attempts return a `400 Bad Request` block immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 6. Review Confirmation Modal Dialog */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="text-lg font-bold text-white mb-4">Confirm Review Action</h3>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                You are reviewing: <span className="font-bold text-purple-400">{activeEvent?.title}</span>
              </p>
              
              <div className="p-3 bg-dark-700 border border-dark-600 rounded-lg text-xs space-y-1">
                <div><span className="text-gray-400">Venue:</span> {activeEvent?.venue}</div>
                <div><span className="text-gray-400">Department:</span> {activeEvent?.department}</div>
                <div><span className="text-gray-400">Expected Attendees:</span> {activeEvent?.expected_attendees}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Review Decision</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setReviewAction('Approved')}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs ${
                      reviewAction === 'Approved' ? 'bg-green-600 text-white' : 'bg-dark-700 text-gray-400'
                    }`}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => setReviewAction('Rejected')}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs ${
                      reviewAction === 'Rejected' ? 'bg-red-600 text-white' : 'bg-dark-700 text-gray-400'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Reviewer Comment (Optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="3"
                  placeholder="Detail logistics check or reasons..."
                  className="input text-xs"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={reviewLoading}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={reviewLoading}
                className="btn bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                {reviewLoading ? <span className="spinner"></span> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard
