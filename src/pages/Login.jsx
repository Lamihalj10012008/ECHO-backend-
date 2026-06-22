import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FaLock, FaEnvelope, FaSignInAlt, FaUserGraduate, FaUserShield, FaUserPlus, FaUser, FaPhone } from 'react-icons/fa'

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('student')

  const handleLogin = async (e, customEmail = null, customPassword = null) => {
    if (e) e.preventDefault()
    
    const loginEmail = customEmail || email
    const loginPassword = customPassword || password

    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email: loginEmail,
        password: loginPassword
      })

      if (response.data && response.data.access_token) {
        const token = response.data.access_token
        
        // Decode JWT token loosely to retrieve user details, or hit /auth/me
        // For security and simplicity, let's fetch user profile /auth/me
        const profileResponse = await axios.get(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const user = profileResponse.data
        
        // Save to localStorage
        localStorage.setItem('authToken', token)
        localStorage.setItem('userRole', user.role)
        localStorage.setItem('userName', user.name)
        localStorage.setItem('userEmail', user.email)

        toast.success(`Welcome back, ${user.name}!`)
        
        // Update state to trigger redirect
        setToken(token)
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMsg = error.response?.data?.detail || 'Invalid email or password'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !role) {
      toast.error('Please fill in all required fields')
      return
    }

    const cleanName = name.trim()
    if (!/^[a-zA-Z\s]+$/.test(cleanName)) {
      toast.error('Name must contain only letters and spaces')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      await axios.post(`${apiUrl}/auth/register`, {
        name: cleanName,
        email: email,
        phone: phone || null,
        password: password,
        role: role
      })
      toast.success('Registration successful! Please sign in.')
      setIsSignUp(false)
      // Auto-populate email & clear password for easy login
      setEmail(email)
      setPassword('')
    } catch (error) {
      console.error('Registration error:', error)
      const errorMsg = error.response?.data?.detail || 'Registration failed'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-dark-900 px-4 relative overflow-hidden">
      {/* Background Neon Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-600/10 text-red-500 rounded-full mb-3 border border-red-600/20">
            {isSignUp ? <FaUserPlus className="text-2xl" /> : <FaLock className="text-2xl" />}
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">ECHO Platform</h2>
          <p className="text-gray-400 mt-2 text-sm">
            {isSignUp ? 'Create a Secure Account' : 'Secure Portal & Coordination Hub'}
          </p>
        </div>

        {isSignUp ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FaUser />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@campus.edu"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FaPhone />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1234567890"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FaLock />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 chars)"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input py-2 px-3 appearance-none cursor-pointer"
                required
              >
                <option value="student" className="bg-dark-800 text-white">Student</option>
                <option value="faculty" className="bg-dark-800 text-white">Faculty</option>
                <option value="security" className="bg-dark-800 text-white">Security</option>
                <option value="admin" className="bg-dark-800 text-white">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 justify-center text-base mt-2"
            >
              {loading ? <span className="spinner"></span> : 'Register Account'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-red-500 hover:text-red-400 text-sm font-semibold transition-colors"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Username / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@campus.edu"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 justify-center text-base"
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <FaSignInAlt />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-red-500 hover:text-red-400 text-sm font-semibold transition-colors"
                >
                  Don't have an account? Sign Up
                </button>
              </div>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-dark-800 px-3 text-gray-500 font-semibold">Demo Sandbox Login</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleLogin(null, 'andrea.susanna07@gmail.com', 'password')}
                disabled={loading}
                className="flex flex-col items-center p-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-blue-500/30 rounded-xl transition-all text-[11px] text-gray-300"
              >
                <FaUser className="text-blue-400 text-lg mb-2" />
                <span className="font-bold">Student</span>
                <span className="text-[9px] text-gray-500 mt-1">A. Susanna</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin(null, 'smith@echo.campus', 'password')}
                disabled={loading}
                className="flex flex-col items-center p-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-purple-500/30 rounded-xl transition-all text-[11px] text-gray-300"
              >
                <FaUserGraduate className="text-purple-400 text-lg mb-2" />
                <span className="font-bold">Faculty</span>
                <span className="text-[9px] text-gray-500 mt-1">Dr. Smith</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin(null, 'admin@echo.campus', 'password')}
                disabled={loading}
                className="flex flex-col items-center p-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-red-500/30 rounded-xl transition-all text-[11px] text-gray-300"
              >
                <FaUserShield className="text-red-400 text-lg mb-2" />
                <span className="font-bold">Admin</span>
                <span className="text-[9px] text-gray-500 mt-1">Admin Office</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Login
