import React, { useState, useEffect } from 'react'
import { FaEdit, FaSave, FaTimes, FaTrash, FaUserPlus, FaPhone, FaWhatsapp, FaShieldAlt, FaSpinner } from 'react-icons/fa'
import { useAlert } from '../context/AlertContext'
import { toast } from 'react-toastify'
import ContactCard from '../components/ContactCard'

const EmergencyContacts = () => {
  const { 
    emergencyContacts, 
    fetchContacts, 
    addContact, 
    editContact, 
    deleteContact 
  } = useAlert()

  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  
  // New contact form state
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRelationship, setNewRelationship] = useState('Parent')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Phone validation helper
  const validatePhone = (phone) => {
    const cleaned = phone.replace(/[\s\-()]/g, '')
    const phoneRegex = /^\+?\d{10,15}$/
    return phoneRegex.test(cleaned)
  }

  const handleCall = (contact) => {
    const phoneNumber = contact.phone_number.replace(/[^0-9+]/g, '')
    window.location.href = `tel:${phoneNumber}`
    toast.info(`Initiating call to ${contact.contact_name}...`)
  }

  const handleWhatsApp = (contact) => {
    const phoneNumber = contact.phone_number.replace(/[^0-9+]/g, '')
    const message = encodeURIComponent(`Emergency SOS Alert from student. Location details: Campus. Please stand by.`)
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
    toast.info(`Opening WhatsApp chat with ${contact.contact_name}...`)
  }

  const handleEditStart = (contact) => {
    setEditingId(contact.id)
    setEditData({ ...contact })
  }

  const handleSaveEdit = async () => {
    if (!editData.contact_name || editData.contact_name.trim().length < 2) {
      toast.error("Contact name must be at least 2 characters.")
      return
    }
    if (!validatePhone(editData.phone_number)) {
      toast.error("Invalid phone number. Must be 10-15 digits.")
      return
    }

    try {
      await editContact(editingId, {
        contact_name: editData.contact_name,
        phone_number: editData.phone_number,
        relationship: editData.relationship
      })
      setEditingId(null)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddNew = async (e) => {
    e.preventDefault()
    if (!newName.trim() || newName.trim().length < 2) {
      toast.error("Please enter a valid contact name.")
      return
    }
    if (!validatePhone(newPhone)) {
      toast.error("Invalid phone number format. Must contain 10-15 digits.")
      return
    }

    // Client-side duplicate check
    const cleanNewPhone = newPhone.replace(/[\s\-()]/g, '')
    const isDuplicate = emergencyContacts.some(c => c.phone_number.replace(/[\s\-()]/g, '') === cleanNewPhone)
    
    if (isDuplicate) {
      toast.info("This phone number is already in your emergency contacts. Updating existing contact.")
    }

    setAdding(true)
    try {
      await addContact({
        contact_name: newName,
        phone_number: newPhone,
        relationship: newRelationship
      })
      // Clear form
      setNewName('')
      setNewPhone('')
      setNewRelationship('Parent')
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this emergency contact?")) {
      try {
        await deleteContact(id)
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Emergency Contacts</h1>
        <p className="text-gray-400">Manage contacts who will be notified instantly via SMS and WhatsApp when you trigger an SOS.</p>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {emergencyContacts.map(contact => (
          <div key={contact.id}>
            {editingId === contact.id ? (
              // Edit Form Card
              <div className="card space-y-4 border-l-4 border-amber-500 bg-dark-800/80">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-bold text-lg">Edit Contact</h3>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white">
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-xs uppercase font-semibold">Contact Name</label>
                    <input
                      type="text"
                      value={editData.contact_name}
                      onChange={(e) => setEditData({ ...editData, contact_name: e.target.value })}
                      className="input mt-1"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase font-semibold">Phone Number</label>
                    <input
                      type="tel"
                      value={editData.phone_number}
                      onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                      className="input mt-1"
                      placeholder="e.g. +919876543210"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase font-semibold">Relationship</label>
                    <select
                      value={editData.relationship || 'Parent'}
                      onChange={(e) => setEditData({ ...editData, relationship: e.target.value })}
                      className="input mt-1"
                    >
                      <option value="Parent">Parent</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Relative">Relative</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 btn-primary bg-amber-600 hover:bg-amber-700 flex justify-center items-center gap-2"
                  >
                    <FaSave /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 btn-secondary flex justify-center items-center gap-2"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="relative group">
                {/* Standardize properties so ContactCard displays correctly */}
                <ContactCard
                  contact={{
                    id: contact.id,
                    name: contact.contact_name,
                    phone: contact.phone_number,
                    whatsapp: contact.phone_number, // Same number
                    icon: contact.relationship === 'Parent' ? '👨‍👩‍👧' : contact.relationship === 'Guardian' ? '👴' : '🏠'
                  }}
                  onCall={() => handleCall(contact)}
                  onWhatsApp={() => handleWhatsApp(contact)}
                />
                
                <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditStart(contact)}
                    className="p-2 bg-dark-700 hover:bg-dark-600 text-amber-400 rounded-lg text-sm transition-colors"
                    title="Edit contact"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 bg-dark-700 hover:bg-red-900/40 text-red-400 rounded-lg text-sm transition-colors"
                    title="Delete contact"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Contact Form */}
      <div className="card max-w-xl">
        <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
          <FaUserPlus className="text-red-500" /> Add New Emergency Contact
        </h3>
        
        <form onSubmit={handleAddNew} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase">Contact Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full Name"
                className="input mt-1"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase">Phone Number</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+919876543210"
                className="input mt-1"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase">Relationship</label>
            <select
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              className="input mt-1"
            >
              <option value="Parent">Parent</option>
              <option value="Guardian">Guardian</option>
              <option value="Relative">Relative</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={adding} 
            className="btn-primary w-full flex justify-center items-center gap-2"
          >
            {adding ? <FaSpinner className="animate-spin" /> : <FaUserPlus />} Add Contact
          </button>
        </form>
      </div>

      {/* Campus Emergency Services */}
      <div className="card border border-red-500/20 bg-red-950/10">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <FaShieldAlt className="text-red-500 animate-pulse" /> Campus Security Quick Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-dark-800/80 rounded-xl border border-dark-700 text-center">
            <span className="text-red-500 font-extrabold text-2xl block">100</span>
            <span className="text-white text-sm font-semibold">Campus Police</span>
            <span className="text-gray-500 text-xs block mt-1">General Security Post</span>
          </div>
          <div className="p-4 bg-dark-800/80 rounded-xl border border-dark-700 text-center">
            <span className="text-blue-500 font-extrabold text-2xl block">102</span>
            <span className="text-white text-sm font-semibold">Medical ER</span>
            <span className="text-gray-500 text-xs block mt-1">Health Care Unit</span>
          </div>
          <div className="p-4 bg-dark-800/80 rounded-xl border border-dark-700 text-center">
            <span className="text-orange-500 font-extrabold text-2xl block">101</span>
            <span className="text-white text-sm font-semibold">Fire Control</span>
            <span className="text-gray-500 text-xs block mt-1">Safety Department</span>
          </div>
          <div className="p-4 bg-dark-800/80 rounded-xl border border-dark-700 text-center">
            <span className="text-purple-500 font-extrabold text-2xl block">103</span>
            <span className="text-white text-sm font-semibold">Crisis Hotline</span>
            <span className="text-gray-500 text-xs block mt-1">Mental Health Desk</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyContacts
