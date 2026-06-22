import React, { useState } from 'react';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });
    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setAlert({
        message: response.data.message || 'If an account exists with this email, a reset link has been dispatched.',
        type: 'success'
      });
    } catch (err) {
      setAlert({
        message: err.response?.data?.detail || 'An error occurred while requesting reset link.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    bodyWrapper: {
      background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    },
    card: {
      width: '450px',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
      backdropFilter: 'blur(10px)',
    },
    logo: {
      fontSize: '48px',
      fontWeight: '900',
      color: '#2563eb',
      letterSpacing: '1px',
    }
  };

  return (
    <div style={styles.bodyWrapper}>
      <div style={styles.card}>
        <div className="text-center mb-4">
          <div style={styles.logo}>ECHO</div>
          <h4 className="text-dark mt-3 fw-bold">Forgot Password</h4>
          <p className="text-muted small">Enter your registered email address below, and we will send you a secure link to reset your password.</p>
        </div>

        {alert.message && (
          <div className={`alert alert-${alert.type} text-center small`} role="alert">
            {alert.message}
          </div>
        )}

        <form onSubmit={handleForgotSubmit}>
          <div className="mb-4">
            <label className="form-label text-dark fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="user@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm" disabled={loading}>
            {loading ? 'Processing request...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/login" className="btn btn-link btn-sm text-decoration-none fw-semibold">
            Return to Login
          </a>
        </div>
      </div>
    </div>
  );
}
