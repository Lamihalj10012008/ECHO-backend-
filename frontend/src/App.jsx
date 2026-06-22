import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page Imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SessionDashboard from './pages/SessionDashboard';
import MfaSetup from './pages/MfaSetup';
import AdminAudit from './pages/AdminAudit';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Custom Email Verification router page
function VerifyEmailPage() {
  const [statusMsg, setStatusMsg] = React.useState('Verifying account token...');
  const [success, setSuccess] = React.useState(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');

    if (token && username) {
      import('./utils/api').then(({ default: api }) => {
        api.post(`/api/auth/verify-email?token=${token}&username=${username}`)
          .then((res) => {
            setStatusMsg(res.data.message);
            setSuccess(true);
          })
          .catch((err) => {
            setStatusMsg(err.response?.data?.detail || 'Verification failed. Token may be expired.');
            setSuccess(false);
          });
      });
    } else {
      setStatusMsg('Missing verification parameters.');
      setSuccess(false);
    }
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center text-center text-dark" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
      <div className="card p-5 shadow bg-white" style={{ maxWidth: '500px', borderRadius: '15px' }}>
        <h3 className="fw-bold mb-3">ECHO Account Verification</h3>
        <p className="lead fs-6 mb-4">{statusMsg}</p>
        {success !== null && (
          <a href="/login" className="btn btn-primary fw-bold px-4">
            Go to Login
          </a>
        )}
      </div>
    </div>
  );
}

export default function App() {
  React.useEffect(() => {
    // Dynamic bootstrap styles injection
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    document.head.appendChild(link);
    return () => {
      // Clean up bootstrap styles if needed, but for spa it is safe to keep
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Student', 'Faculty', 'Administrator']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute allowedRoles={['Student', 'Faculty', 'Administrator']}>
                  <SessionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mfa-setup"
              element={
                <ProtectedRoute allowedRoles={['Student', 'Faculty', 'Administrator']}>
                  <MfaSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-audit"
              element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <AdminAudit />
                </ProtectedRoute>
              }
            />

            {/* Default Catch-All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}