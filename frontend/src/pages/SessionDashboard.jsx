import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function SessionDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: '', type: '' });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/sessions/active');
      setSessions(response.data);
    } catch (err) {
      setAlert({ message: 'Failed to retrieve active sessions.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    setAlert({ message: '', type: '' });
    try {
      await api.post(`/api/sessions/revoke/${sessionId}`);
      setAlert({ message: 'Session successfully revoked.', type: 'success' });
      fetchSessions();
    } catch (err) {
      setAlert({ message: err.response?.data?.detail || 'Failed to revoke session.', type: 'danger' });
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to terminate all of your active sessions? You will need to log in again.')) {
      return;
    }
    setAlert({ message: '', type: '' });
    try {
      await api.post('/api/sessions/logout-all');
      setAlert({ message: 'All other sessions revoked.', type: 'success' });
      fetchSessions();
    } catch (err) {
      setAlert({ message: err.response?.data?.detail || 'Failed to revoke all sessions.', type: 'danger' });
    }
  };

  return (
    <div className="container py-5 text-dark">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: '20px' }}>
            
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-3">
              <div>
                <h2 className="fw-bold mb-0">Active Login Sessions</h2>
                <p className="text-muted small mb-0">Monitor active devices currently connected to your campus account.</p>
              </div>
              <button onClick={handleLogoutAll} className="btn btn-outline-danger fw-bold shadow-sm">
                Log Out of All Devices
              </button>
            </div>

            {alert.message && (
              <div className={`alert alert-${alert.type} text-center`} role="alert">
                {alert.message}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading Sessions...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle border-light">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Device / User Agent</th>
                      <th scope="col">IP Address</th>
                      <th scope="col">Last Activity</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className={s.is_current ? 'table-primary-subtle' : ''}>
                        <td>
                          <div className="fw-semibold small">{s.user_agent || 'Unknown Device'}</div>
                          <div className="text-muted" style={{ fontSize: '10px' }}>Session ID: {s.id}</div>
                        </td>
                        <td className="small font-monospace">{s.ip_address}</td>
                        <td className="small">{new Date(s.last_activity).toLocaleString()}</td>
                        <td>
                          {s.is_current ? (
                            <span className="badge bg-primary px-3 py-1">Current Session</span>
                          ) : (
                            <span className="badge bg-success px-3 py-1">Active</span>
                          )}
                        </td>
                        <td className="text-end">
                          {!s.is_current && (
                            <button onClick={() => handleRevoke(s.id)} className="btn btn-sm btn-outline-danger fw-bold">
                              Revoke Session
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
