import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'users'

  const fetchData = async () => {
    setLoading(true);
    setAlert({ message: '', type: '' });
    try {
      const logsRes = await api.get('/api/admin/audit-logs');
      const usersRes = await api.get('/api/admin/users');
      setLogs(logsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setAlert({ message: 'Failed to retrieve administrative records. Ensure admin privilege is active.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLockUser = async (username) => {
    if (!window.confirm(`Are you sure you want to administratively lock the account for user ${username}?`)) {
      return;
    }
    try {
      await api.post(`/api/admin/users/${username}/lock`);
      setAlert({ message: `Account for ${username} successfully locked.`, type: 'success' });
      fetchData();
    } catch (err) {
      setAlert({ message: err.response?.data?.detail || 'Failed to lock user.', type: 'danger' });
    }
  };

  const handleUnlockUser = async (username) => {
    try {
      await api.post(`/api/admin/users/${username}/unlock`);
      setAlert({ message: `Account for ${username} successfully unlocked.`, type: 'success' });
      fetchData();
    } catch (err) {
      setAlert({ message: err.response?.data?.detail || 'Failed to unlock user.', type: 'danger' });
    }
  };

  return (
    <div className="container py-5 text-dark">
      <div className="row justify-content-center">
        <div className="col-lg-12">
          <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: '20px' }}>
            
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
              <div>
                <h2 className="fw-bold mb-0">Security Auditing & Governance</h2>
                <p className="text-muted small mb-0">System-wide monitoring, user access states, and threat mitigations.</p>
              </div>
              <button onClick={fetchData} className="btn btn-outline-primary fw-bold" disabled={loading}>
                Refresh Data
              </button>
            </div>

            {alert.message && (
              <div className={`alert alert-${alert.type} text-center`} role="alert">
                {alert.message}
              </div>
            )}

            {/* Tab Navigators */}
            <ul className="nav nav-pills mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold px-4 py-2 ${activeTab === 'logs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('logs')}
                >
                  Security Audit Logs
                </button>
              </li>
              <li className="nav-item ms-2">
                <button
                  className={`nav-link fw-bold px-4 py-2 ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  Campus Users List
                </button>
              </li>
            </ul>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading Admin records...</span>
                </div>
              </div>
            ) : activeTab === 'logs' ? (
              /* TAB 1: AUDIT LOGS */
              <div className="table-responsive">
                <table className="table table-hover align-middle border-light">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Timestamp</th>
                      <th scope="col">User</th>
                      <th scope="col">Action</th>
                      <th scope="col">Details</th>
                      <th scope="col">IP Address</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="small text-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="fw-bold small">{log.username}</td>
                        <td>
                          <span className="badge bg-secondary font-monospace">{log.action}</span>
                        </td>
                        <td className="small">{log.details}</td>
                        <td className="small font-monospace">{log.ip_address}</td>
                        <td>
                          {log.status === 'SUCCESS' ? (
                            <span className="badge bg-success-subtle text-success px-3 py-1">Success</span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger px-3 py-1">Failure</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* TAB 2: USERS LIST */
              <div className="table-responsive">
                <table className="table table-hover align-middle border-light">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Reg Number / Username</th>
                      <th scope="col">Campus Role</th>
                      <th scope="col">Status</th>
                      <th scope="col">Email Verified</th>
                      <th scope="col">MFA Status</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.username}>
                        <td className="fw-bold text-primary">{u.username}</td>
                        <td>
                          <span className="badge bg-dark px-3 py-1 text-uppercase">{u.role}</span>
                        </td>
                        <td>
                          {u.lockout_until && new Date(u.lockout_until) > new Date() ? (
                            <span className="badge bg-danger text-white px-3 py-1">Temporarily Locked</span>
                          ) : u.is_active ? (
                            <span className="badge bg-success text-white px-3 py-1">Active</span>
                          ) : (
                            <span className="badge bg-secondary text-white px-3 py-1">Deactivated</span>
                          )}
                        </td>
                        <td>
                          {u.is_verified ? (
                            <span className="text-success fw-bold">✓ Verified</span>
                          ) : (
                            <span className="text-muted small">Pending Verification</span>
                          )}
                        </td>
                        <td>
                          {u.mfa_enabled ? (
                            <span className="badge bg-primary px-3 py-1">Enabled (TOTP)</span>
                          ) : (
                            <span className="badge bg-secondary px-3 py-1">Disabled</span>
                          )}
                        </td>
                        <td className="text-end">
                          {u.lockout_until && new Date(u.lockout_until) > new Date() ? (
                            <button onClick={() => handleUnlockUser(u.username)} className="btn btn-sm btn-outline-success fw-bold">
                              Unlock User
                            </button>
                          ) : (
                            <button onClick={() => handleLockUser(u.username)} className="btn btn-sm btn-outline-danger fw-bold">
                              Lock User
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
