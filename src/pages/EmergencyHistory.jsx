import React, { useState } from 'react'
import { FaFilter, FaCalendarAlt } from 'react-icons/fa'
import EmergencyHistoryTable from '../components/EmergencyHistoryTable'
import { useAlert } from '../context/AlertContext'

const EmergencyHistory = () => {
  const { alerts } = useAlert()
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const emergencyTypes = ['medical', 'harassment', 'accident', 'fire', 'theft', 'other']

  const filterAlerts = () => {
    let filtered = alerts

    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus)
    }

    if (sortBy === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }

    return filtered
  }

  const filteredAlerts = filterAlerts()

  const getStatsByType = () => {
    const stats = {}
    alerts.forEach(alert => {
      stats[alert.type] = (stats[alert.type] || 0) + 1
    })
    return stats
  }

  const getStatsByStatus = () => {
    const stats = {}
    alerts.forEach(alert => {
      stats[alert.status] = (stats[alert.status] || 0) + 1
    })
    return stats
  }

  const statsByType = getStatsByType()
  const statsByStatus = getStatsByStatus()

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Emergency History</h1>
        <p className="text-gray-400">View past emergency incidents and their outcomes</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-400 text-sm">Total Emergencies</p>
          <p className="text-white font-bold text-3xl mt-2">{alerts.length}</p>
        </div>

        <div className="card">
          <p className="text-gray-400 text-sm">Resolved</p>
          <p className="text-green-400 font-bold text-3xl mt-2">
            {alerts.filter(a => a.status === 'resolved').length}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-400 text-sm">In Progress</p>
          <p className="text-orange-400 font-bold text-3xl mt-2">
            {alerts.filter(a => ['created', 'security_assigned', 'help_on_way', 'arrived'].includes(a.status)).length}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-400 text-sm">Success Rate</p>
          <p className="text-blue-400 font-bold text-3xl mt-2">
            {alerts.length > 0
              ? `${Math.round((alerts.filter(a => a.status === 'resolved').length / alerts.length) * 100)}%`
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <FaFilter /> Filter & Sort
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-400 text-sm">Emergency Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input mt-1"
            >
              <option value="all">All Types</option>
              {emergencyTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input mt-1"
            >
              <option value="all">All Statuses</option>
              <option value="created">Alert Created</option>
              <option value="security_assigned">Security Assigned</option>
              <option value="help_on_way">Help On The Way</option>
              <option value="arrived">Arrived</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input mt-1"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">📊 By Type</h3>
          <div className="space-y-2">
            {emergencyTypes.map(type => (
              <div key={type} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                <span className="text-white capitalize">{type}</span>
                <span className="font-bold text-red-400">{statsByType[type] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Status */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">📈 By Status</h3>
          <div className="space-y-2">
            {Object.entries(statsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                <span className="text-white capitalize">{status.replace(/_/g, ' ')}</span>
                <span className="font-bold text-blue-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      <EmergencyHistoryTable alerts={filteredAlerts} />

      {/* Export Options */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">📥 Export Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="btn-secondary w-full">
            📊 Export as CSV
          </button>
          <button className="btn-secondary w-full">
            📄 Export as PDF
          </button>
          <button className="btn-secondary w-full">
            <FaCalendarAlt className="inline mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Analysis Tips */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">💡 Emergency Response Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-dark-700 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-1">⏱️ Avg Response Time</p>
            <p className="text-white font-bold text-lg">4.5 min</p>
            <p className="text-gray-400 text-xs mt-1">Average from alert to security arrival</p>
          </div>

          <div className="p-3 bg-dark-700 rounded-lg">
            <p className="text-green-400 font-semibold mb-1">✓ Resolution Rate</p>
            <p className="text-white font-bold text-lg">98%</p>
            <p className="text-gray-400 text-xs mt-1">Successfully resolved incidents</p>
          </div>

          <div className="p-3 bg-dark-700 rounded-lg">
            <p className="text-blue-400 font-semibold mb-1">📍 Coverage</p>
            <p className="text-white font-bold text-lg">100%</p>
            <p className="text-gray-400 text-xs mt-1">Campus-wide emergency coverage</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyHistory
