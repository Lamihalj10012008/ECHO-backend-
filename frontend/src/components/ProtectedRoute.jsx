import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading Session...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce role-based access checks (RBAC)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="d-flex justify-content-center align-items-center text-center p-5" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: 'white' }}>
        <div className="card bg-dark text-white p-5 border-secondary" style={{ maxWidth: '500px', borderRadius: '15px' }}>
          <h1 className="text-danger mb-3">ACCESS DENIED</h1>
          <p className="lead mb-4">
            You do not possess the required security credentials to access this portal section.
          </p>
          <a href="/dashboard" className="btn btn-primary fw-bold px-4 py-2">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
