import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary px-4 py-3">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold text-primary fs-3" href="/dashboard" style={{ letterSpacing: '1px' }}>
          ECHO
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link fw-semibold px-3" href="/dashboard">
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold px-3" href="/sessions">
                Active Sessions
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold px-3" href="/mfa-setup">
                Security (MFA)
              </a>
            </li>
            {user.role === 'Administrator' && (
              <li className="nav-item">
                <a className="nav-link text-warning fw-bold px-3" href="/admin-audit">
                  Audit Logs
                </a>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-secondary px-3 py-2 text-uppercase fw-semibold" style={{ letterSpacing: '0.5px' }}>
              {user.role} ({user.username})
            </span>
            <button onClick={() => logout().then(() => navigate('/login'))} className="btn btn-outline-danger btn-sm fw-bold px-3 py-2">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
