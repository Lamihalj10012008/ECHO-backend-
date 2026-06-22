import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function MfaSetup() {
  const { user, setUser } = useAuth();
  
  // MFA States
  const [active, setActive] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  
  // UI status
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [step, setStep] = useState(1); // 1 = enroll initiate, 2 = QR code/verify code, 3 = show backup codes

  useEffect(() => {
    if (user) {
      setActive(user.mfa_enabled);
    }
  }, [user]);

  const handleEnrollInitiate = async () => {
    setLoading(true);
    setAlert({ message: '', type: '' });
    try {
      const response = await api.post('/api/mfa/enroll');
      const data = response.data;
      setQrCode(data.qr_code_data_uri);
      setSecret(data.secret);
      setBackupCodes(data.backup_codes);
      setStep(2);
    } catch (err) {
      setAlert({ message: err.response?.data?.detail || 'Failed to initiate MFA enrollment.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ message: '', type: '' });
    try {
      await api.post('/api/mfa/verify', { code: verificationCode });
      
      // Update local state
      setUser({ ...user, mfa_enabled: true });
      setActive(true);
      setStep(3);
    } catch (err) {
      setAlert({ message: err.response?.data?.detail || 'MFA validation failed.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ message: '', type: '' });
    try {
      await api.post('/api/mfa/disable', { code: disableCode });
      setUser({ ...user, mfa_enabled: false });
      setActive(false);
      setStep(1);
      setAlert({ message: 'MFA successfully disabled.', type: 'success' });
    } catch (err) {
      setAlert({ message: err.response?.data?.detail || 'Failed to disable MFA.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 text-dark">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 p-4 bg-white" style={{ borderRadius: '20px' }}>
            <h2 className="fw-bold mb-3 border-bottom pb-2">Multi-Factor Authentication (MFA)</h2>
            <p className="text-muted lead small">
              MFA adds an extra layer of security to your university portal account. When logging in, you will be required to provide a 6-digit TOTP code from an authenticator app.
            </p>

            {alert.message && (
              <div className={`alert alert-${alert.type} my-3 text-center`} role="alert">
                {alert.message}
              </div>
            )}

            {/* CASE A: MFA is active */}
            {active ? (
              <div className="alert alert-success p-4">
                <h4 className="alert-heading fw-bold">✓ Multi-Factor Authentication is Enabled</h4>
                <p className="mb-4">Your account security matches university governance production standards.</p>
                <hr />
                
                <h5 className="fw-bold text-dark mt-4">Disable MFA</h5>
                <p className="text-muted small">To deactivate MFA security, enter a valid 6-digit token code:</p>
                <form onSubmit={handleDisableMfa} className="row g-2 align-items-center">
                  <div className="col-auto">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="000000"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="col-auto">
                    <button type="submit" className="btn btn-danger fw-bold" disabled={loading}>
                      Deactivate MFA
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* CASE B: MFA is inactive */
              <div>
                {step === 1 && (
                  <div className="p-4 text-center bg-light rounded-3">
                    <h5 className="fw-bold mb-3">Your Account is Currently Unprotected</h5>
                    <p className="text-muted mb-4 small">
                      Please enroll in MFA to safeguard your registration sessions and profile records.
                    </p>
                    <button onClick={handleEnrollInitiate} className="btn btn-primary btn-lg fw-bold px-4 shadow-sm" disabled={loading}>
                      {loading ? 'Initializing Setup...' : 'Enroll in Authenticator MFA'}
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h5 className="fw-bold mb-3">Step 1: Scan this QR Code</h5>
                    <p className="text-muted small">
                      Open your authenticator app (Google Authenticator, Microsoft Authenticator, or Authy) and scan the QR code below:
                    </p>

                    <div className="text-center my-4 p-3 border rounded bg-light d-inline-block">
                      <img src={qrCode} alt="TOTP QR Code" style={{ maxWidth: '200px' }} />
                      <div className="mt-2 small text-muted">
                        Secret key: <code>{secret}</code>
                      </div>
                    </div>

                    <h5 className="fw-bold mt-4 mb-3">Step 2: Enter Verification Code</h5>
                    <p className="text-muted small">Enter the 6-digit code displayed in your authenticator app to complete setup:</p>
                    <form onSubmit={handleVerifySubmit} className="row g-2 align-items-center">
                      <div className="col-auto">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="col-auto">
                        <button type="submit" className="btn btn-primary btn-lg fw-bold px-4" disabled={loading}>
                          Verify & Activate
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {step === 3 && (
                  <div className="alert alert-warning p-4">
                    <h4 className="fw-bold text-dark mb-3">💾 Save Your Backup Recovery Codes</h4>
                    <p className="small text-muted mb-3">
                      If you lose access to your device, you can use these backup recovery codes to access your account. Store them securely—each code can only be used once.
                    </p>
                    <div className="card p-3 bg-dark text-white font-monospace mb-4">
                      <div className="row">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="col-6 py-1">
                            {index + 1}. <code>{code}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setStep(1)} className="btn btn-success fw-bold px-4">
                      Done, Go Back
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
