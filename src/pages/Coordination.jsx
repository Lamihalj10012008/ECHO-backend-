import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  FaCalendarAlt, FaBuilding, FaUser, FaClock, 
  FaUsers, FaCheck, FaTimes, FaRedo, FaInfoCircle,
  FaFileAlt, FaUniversity, FaBuffer, FaHistory
} from 'react-icons/fa'

const Coordination = () => {
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'faculty')
  const [token] = useState(localStorage.getItem('authToken'))
  const [userName] = useState(localStorage.getItem('userName') || '')
  
  // Faculty Form State
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [venue, setVenue] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [expectedAttendees, setExpectedAttendees] = useState('')
  const [description, setDescription] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  
  // Admin Dashboard State
  const [pendingRequests, setPendingRequests] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  
  // Review Modal State
  const [showModal, setShowModal] = useState(false)
  const [activeEvent, setActiveEvent] = useState(null)
  const [reviewAction, setReviewAction] = useState('Approved') // 'Approved' or 'Rejected'
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    if (role === 'admin') {
      fetchAdminData()
    }
  }, [role])

  const fetchAdminData = async () => {
    setLoadingList(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      
      const pendingRes = await axios.get(`${apiUrl}/events/pending`, { headers })
      const allRes = await axios.get(`${apiUrl}/events/all`, { headers })
      
      setPendingRequests(pendingRes.data)
      setAllEvents(allRes.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to sync event coordination records')
    } finally {
      setLoadingList(false)
    }
  }

  // Faculty Event Submission
  const handleEventSubmit = async (e) => {
    e.preventDefault()

    if (!title || !department || !venue || !eventDate || !expectedAttendees || !description) {
      toast.error('Please fill in all event fields')
      return
    }

    if (new Date(eventDate) <= new Date()) {
      toast.error('Event date and time must be in the future')
      return
    }

    if (parseInt(expectedAttendees) <= 0) {
      toast.error('Expected attendees must be greater than zero')
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

      toast.success('Event request submitted successfully!')
      
      // Reset form
      setTitle('')
      setDepartment('')
      setVenue('')
      setEventDate('')
      setExpectedAttendees('')
      setDescription('')
    } catch (error) {
      console.error('Event submission error:', error)
      const detail = error.response?.data?.detail || 'Failed to submit event request.'
      toast.error(detail)
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

  // Admin Submit Review Action
  const submitReview = async () => {
    setReviewLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      await axios.put(`${apiUrl}/events/${activeEvent.id}/review`, {
        status: reviewAction,
        review_comment: reviewComment
      }, { headers })

      toast.success(`Event was successfully ${reviewAction.toLowerCase()}!`)
      setShowModal(false)
      fetchAdminData() // refresh lists
    } catch (error) {
      console.error('Review submission error:', error)
      const detail = error.response?.data?.detail || 'Failed to submit review decision.'
      toast.error(detail)
    } finally {
      setReviewLoading(false)
    }
  }

  // Stats Calculations
  const stats = {
    total: allEvents.length,
    pending: pendingRequests.length,
    approved: allEvents.filter(e => e.status === 'Approved').length,
    rejected: allEvents.filter(e => e.status === 'Rejected').length
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-scaleIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-dark-800 border border-dark-700 p-6 rounded-xl gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaCalendarAlt className="text-red-500" />
            Academic & Event Coordination
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage and book campus event venues and audit coordination logs.</p>
        </div>
        
        {/* Toggle Panel Switch (Visible for Admins only to demo both interfaces) */}
        <div className="flex bg-dark-700 p-1 rounded-lg border border-dark-600 self-start">
          <button
            onClick={() => setRole('faculty')}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              role === 'faculty' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Faculty View
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              role === 'admin' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Admin View
          </button>
        </div>
      </div>

      {/* VIEW 1: FACULTY PANEL */}
      {role === 'faculty' && (
        <div className="max-w-3xl mx-auto bg-dark-800 border border-dark-700 rounded-xl p-8 relative overflow-hidden">
          {formLoading && (
            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="spinner w-8 h-8"></span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6 border-b border-dark-700 pb-4">
            <div className="p-3 bg-red-600/10 text-red-500 rounded-lg border border-red-600/20">
              <FaFileAlt className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Event Request Form</h2>
              <p className="text-gray-400 text-xs mt-1">Submit venue, scheduling, and logistical coordinator requests.</p>
            </div>
            <div className="ms-auto text-xs text-gray-500">Logged in as {userName}</div>
          </div>

          <form onSubmit={handleEventSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Guest Lecture: Deep Learning in Production"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input"
                  required
                >
                  <option value="" disabled>Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business & Finance">Business & Finance</option>
                  <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                  <option value="Sciences">Sciences</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Selected Venue</label>
                <select
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="input"
                  required
                >
                  <option value="" disabled>Select Venue</option>
                  <option value="Auditorium A">Auditorium A (Cap: 500)</option>
                  <option value="Convocation Hall">Convocation Hall (Cap: 1000)</option>
                  <option value="Seminar Room 102">Seminar Room 102 (Cap: 100)</option>
                  <option value="Open Air Theater">Open Air Theater (Cap: 800)</option>
                  <option value="Exhibition Hall">Exhibition Hall (Cap: 300)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Expected Attendees</label>
                <input
                  type="number"
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(e.target.value)}
                  placeholder="e.g. 120"
                  className="input"
                  min="1"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description & Requirements</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  placeholder="Describe event target, projection/audio needs, etc."
                  className="input"
                  required
                ></textarea>
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-3 justify-center text-base">
              <span>Submit Event Request</span>
            </button>
          </form>
        </div>
      )}

      {/* VIEW 2: ADMIN DASHBOARD */}
      {role === 'admin' && (
        <div className="space-y-6">
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-600/10 text-blue-500"><FaBuffer className="text-xl" /></div>
              <div>
                <div className="text-gray-400 text-xs font-semibold">Total Requests</div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-600/10 text-yellow-500"><FaClock className="text-xl" /></div>
              <div>
                <div className="text-gray-400 text-xs font-semibold">Pending Review</div>
                <div className="text-2xl font-bold text-white">{stats.pending}</div>
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-600/10 text-green-500"><FaCheck className="text-xl" /></div>
              <div>
                <div className="text-gray-400 text-xs font-semibold">Approved</div>
                <div className="text-2xl font-bold text-white">{stats.approved}</div>
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-600/10 text-red-500"><FaTimes className="text-xl" /></div>
              <div>
                <div className="text-gray-400 text-xs font-semibold">Rejected</div>
                <div className="text-2xl font-bold text-white">{stats.rejected}</div>
              </div>
            </div>
          </div>

          {/* Pending Table Card */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Pending Requests Review</h2>
                <p className="text-gray-400 text-xs">Verify room scheduling conflicts and attendees density.</p>
              </div>
              <button 
                onClick={fetchAdminData}
                disabled={loadingList}
                className="btn-secondary text-xs px-3 py-2"
              >
                <FaRedo className={loadingList ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingList ? (
              <div className="text-center py-10">
                <span className="spinner w-8 h-8"></span>
                <p className="text-gray-400 text-sm mt-3">Fetching database records...</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-dark-700 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-700 border-b border-dark-600">
                      <th className="p-4 text-xs font-bold text-gray-300 uppercase">Event Details</th>
                      <th className="p-4 text-xs font-bold text-gray-300 uppercase">Department</th>
                      <th className="p-4 text-xs font-bold text-gray-300 uppercase">Organizer</th>
                      <th className="p-4 text-xs font-bold text-gray-300 uppercase">Venue & Date</th>
                      <th className="p-4 text-xs font-bold text-gray-300 uppercase">Attendees</th>
                      <th className="p-4 text-xs font-bold text-gray-300 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">
                          No pending event coordination requests found.
                        </td>
                      </tr>
                    ) : (
                      pendingRequests.map(event => (
                        <tr key={event.id} className="border-b border-dark-700 hover:bg-dark-750 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{event.title}</div>
                            <div className="text-gray-400 text-xs mt-1 max-w-xs truncate">{event.description}</div>
                          </td>
                          <td className="p-4 text-gray-300 text-sm">{event.department}</td>
                          <td className="p-4 text-gray-300 text-sm">{event.organizer?.name || 'Faculty Member'}</td>
                          <td className="p-4 text-sm">
                            <div className="text-purple-400 font-semibold">{event.venue}</div>
                            <div className="text-gray-500 text-xs mt-1">
                              {new Date(event.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                          </td>
                          <td className="p-4 text-gray-300 text-sm">{event.expected_attendees}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openReviewDialog(event, 'Approved')}
                                className="bg-green-600/10 text-green-400 border border-green-500/20 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openReviewDialog(event, 'Rejected')}
                                className="bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Coordination Log History */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaHistory className="text-gray-400" />
              Coordination Log History
            </h3>
            
            <div className="overflow-x-auto border border-dark-700 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-700 border-b border-dark-600">
                    <th className="p-4 text-xs font-bold text-gray-300 uppercase">Event Title</th>
                    <th className="p-4 text-xs font-bold text-gray-300 uppercase">Venue</th>
                    <th className="p-4 text-xs font-bold text-gray-300 uppercase">Date</th>
                    <th className="p-4 text-xs font-bold text-gray-300 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-300 uppercase">Reviewer Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {allEvents.filter(e => e.status !== 'Pending').length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-500 text-sm">No historical log entries recorded.</td>
                    </tr>
                  ) : (
                    allEvents.filter(e => e.status !== 'Pending').map(event => (
                      <tr key={event.id} className="border-b border-dark-700">
                        <td className="p-4 font-semibold text-white">{event.title}</td>
                        <td className="p-4 text-gray-300 text-sm">{event.venue}</td>
                        <td className="p-4 text-gray-400 text-sm">
                          {new Date(event.event_date).toLocaleDateString([], { dateStyle: 'medium' })}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            event.status === 'Approved' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'bg-red-600/10 text-red-400 border border-red-500/20'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-xs italic">{event.review_comment || 'No reviewer comments.'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal Dialogue */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="text-lg font-bold text-white mb-4">
              Confirm Review decision
            </h3>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                You are reviewing: <span className="font-bold text-red-500">{activeEvent?.title}</span>.
              </p>
              
              <div className="p-3 bg-dark-700 border border-dark-600 rounded-lg text-xs space-y-1">
                <div><span className="text-gray-400">Venue:</span> {activeEvent?.venue}</div>
                <div><span className="text-gray-400">Department:</span> {activeEvent?.department}</div>
                <div><span className="text-gray-400">Expected Attendees:</span> {activeEvent?.expected_attendees}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Review Action</label>
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
                <label className="block text-xs font-semibold text-gray-400 mb-2">Review Comment (Optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="3"
                  placeholder="Outline logistics details or reasons for decision..."
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
                className="btn-primary text-xs"
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

export default Coordination
