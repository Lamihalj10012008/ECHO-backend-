import React, { useState } from 'react'
import { FaTrash, FaCheckDouble } from 'react-icons/fa'
import NotificationCard from '../components/NotificationCard'
import { useAlert } from '../context/AlertContext'
import { toast } from 'react-toastify'

const NotificationCenter = () => {
  const { notifications, markNotificationAsRead } = useAlert()
  const [filter, setFilter] = useState('all') // all, unread, read

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId)
    toast.success('Notification marked as read')
  }

  const handleDismiss = (notificationId) => {
    // In a real app, this would delete the notification
    toast.info('Notification dismissed')
  }

  const handleMarkAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        markNotificationAsRead(n.id)
      }
    })
    toast.success('All notifications marked as read')
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Notification Center</h1>
        <p className="text-gray-400">Stay updated on emergency responses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-400 text-sm">Total Notifications</p>
          <p className="text-white font-bold text-3xl mt-2">{notifications.length}</p>
        </div>

        <div className="card">
          <p className="text-gray-400 text-sm">Unread</p>
          <p className="text-red-400 font-bold text-3xl mt-2">{unreadCount}</p>
        </div>

        <div className="card">
          <p className="text-gray-400 text-sm">Read</p>
          <p className="text-green-400 font-bold text-3xl mt-2">
            {notifications.length - unreadCount}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="card hover:bg-dark-700/50 transition-all cursor-pointer"
          >
            <p className="text-gray-400 text-sm">Action</p>
            <p className="text-white font-semibold mt-2 flex items-center gap-2">
              <FaCheckDouble /> Mark All
            </p>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-dark-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            filter === 'all'
              ? 'text-red-600 border-red-600'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            filter === 'unread'
              ? 'text-red-600 border-red-600'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            filter === 'read'
              ? 'text-red-600 border-red-600'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={handleMarkAsRead}
              onDismiss={handleDismiss}
            />
          ))
        ) : (
          <div className="card text-center py-12">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-white font-semibold text-lg mb-2">No Notifications</h3>
            <p className="text-gray-400">
              {filter === 'unread' && 'You have read all notifications'}
              {filter === 'read' && 'No read notifications'}
              {filter === 'all' && 'Your notification center is empty'}
            </p>
          </div>
        )}
      </div>

      {/* Notification Categories Info */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">📚 Notification Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-dark-700 rounded-lg">
            <p className="badge badge-red mb-2">Alert Updates</p>
            <p className="text-gray-400 text-sm">
              Notifications about your active emergency alerts and status changes
            </p>
          </div>

          <div className="p-3 bg-dark-700 rounded-lg">
            <p className="badge badge-blue mb-2">Contact Notifications</p>
            <p className="text-gray-400 text-sm">
              Updates when emergency contacts are notified
            </p>
          </div>

          <div className="p-3 bg-dark-700 rounded-lg">
            <p className="badge badge-green mb-2">Resolution Alerts</p>
            <p className="text-gray-400 text-sm">
              Confirmations when emergencies are resolved
            </p>
          </div>

          <div className="p-3 bg-dark-700 rounded-lg">
            <p className="badge badge-yellow mb-2">System Notifications</p>
            <p className="text-gray-400 text-sm">
              Important updates about the system and your account
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences Link */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Customize Notifications</h3>
            <p className="text-gray-400 text-sm mt-1">
              Manage which notifications you receive
            </p>
          </div>
          <a href="/settings" className="btn-primary">
            Go to Settings →
          </a>
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter
