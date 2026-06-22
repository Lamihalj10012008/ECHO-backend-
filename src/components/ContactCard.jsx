import React from 'react'
import { FaPhone, FaWhatsapp } from 'react-icons/fa'

const ContactCard = ({ contact, onCall, onWhatsApp }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{contact.icon}</div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">{contact.name}</h3>
          <p className="text-gray-400 text-sm">{contact.phone}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onCall(contact)}
          className="flex-1 btn-primary flex justify-center items-center gap-2"
          title={`Call ${contact.name}`}
        >
          <FaPhone /> Call
        </button>
        <button
          onClick={() => onWhatsApp(contact)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white btn flex justify-center items-center gap-2"
          title={`WhatsApp ${contact.name}`}
        >
          <FaWhatsapp /> WhatsApp
        </button>
      </div>
    </div>
  )
}

export default ContactCard
