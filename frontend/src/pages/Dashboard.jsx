import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const styles = {
    card: {
      borderRadius: '20px',
      border: 'none',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    actionCard: {
      borderRadius: '16px',
      border: '1px solid rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    }
  };

  return (
    <div className="container py-5 text-dark">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          {/* Welcome Panel */}
          <div className="card bg-primary text-white p-5 mb-5 shadow-sm" style={styles.card}>
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="fw-black display-5 mb-2">Welcome Back, {user?.username}</h1>
                <p className="lead mb-0">ECHO Campus Governance Student & Faculty Portal</p>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <span className="badge bg-light text-primary fs-6 px-3 py-2 text-uppercase fw-bold shadow-sm">
                  Verified Role: {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <h3 className="fw-bold mb-4">Security & Portal Management</h3>
          <div className="row g-4">
            
            {/* MFA Security Action */}
            <div className="col-md-4">
              <div 
                className="card h-100 p-4 bg-white" 
                style={styles.actionCard}
                onClick={() => window.location.href = '/mfa-setup'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="fs-1 text-primary mb-3">🛡️</div>
                <h5 className="fw-bold">Multi-Factor Auth (MFA)</h5>
                <p className="text-muted small">
                  Activate TOTP security keys to double-protect account credentials from hijackers.
                </p>
                <div className="mt-auto text-primary fw-bold small">
                  Manage MFA →
                </div>
              </div>
            </div>

            {/* Active Session Management Action */}
            <div className="col-md-4">
              <div 
                className="card h-100 p-4 bg-white" 
                style={styles.actionCard}
                onClick={() => window.location.href = '/sessions'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="fs-1 text-success mb-3">💻</div>
                <h5 className="fw-bold">Active Sessions</h5>
                <p className="text-muted small">
                  Track active logins, monitor device IP addresses, and instantly revoke foreign sessions.
                </p>
                <div className="mt-auto text-success fw-bold small">
                  Manage Sessions →
                </div>
              </div>
            </div>

            {/* System Audit Dashboard (Only for Admin) */}
            {user?.role === 'Administrator' && (
              <div className="col-md-4">
                <div 
                  className="card h-100 p-4 bg-white border-warning" 
                  style={styles.actionCard}
                  onClick={() => window.location.href = '/admin-audit'}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="fs-1 text-warning mb-3">🔍</div>
                  <h5 className="fw-bold text-dark">Administrative Audits</h5>
                  <p className="text-muted small">
                    Access real-time security audit trails, monitor failed brute-force attacks, and lock/unlock users.
                  </p>
                  <div className="mt-auto text-warning fw-bold small">
                    Open Logs Dashboard →
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Governance Notice */}
          <div className="card mt-5 bg-light border-0 p-4" style={styles.card}>
            <h5 className="fw-bold mb-2">Campus Governance Policy Notice</h5>
            <p className="text-muted small mb-0">
              ECHO is monitored under strict educational safety protocols. All authentication modifications, session revocations, and configuration changes are recorded in the read-only security audit log.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
