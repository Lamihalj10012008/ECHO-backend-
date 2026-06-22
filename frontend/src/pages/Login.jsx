import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginWithMfa, mfaPendingUser } = useAuth();
  const navigate = useNavigate();

  // Input states
  const [username, setUsername] = useState(''); // Email or Registration Number
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Verification checks
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI status
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });

    if (!captchaVerified) {
      setAlert({ message: 'Please complete the security CAPTCHA verification.', type: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const res = await login(username, password, role, rememberMe);
      setLoading(false);
      if (res && res.mfaRequired) {
        setAlert({ message: 'MFA challenge triggered. Please enter your authentication code.', type: 'info' });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoading(false);
      setAlert({ message: String(err), type: 'danger' });
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });
    setLoading(true);

    try {
      await loginWithMfa(mfaCode);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setAlert({ message: String(err), type: 'danger' });
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
    },
    inputGroup: {
      position: 'relative',
    },
    eyeBtn: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: '#64748b',
      padding: '5px',
      display: 'flex',
      alignItems: 'center',
      zIndex: 5,
    }
  };

  if (mfaPendingUser) {
    return (
      <div style={styles.bodyWrapper}>
        <div style={styles.card}>
          <div className="text-center mb-4">
            <div style={styles.logo}>ECHO</div>
            <h4 className="text-dark mt-3 fw-bold">Multi-Factor Authentication</h4>
            <p className="text-muted small">Enter the 6-digit verification code from your authenticator app or a backup code.</p>
          </div>

          {alert.message && (
            <div className={`alert alert-${alert.type} text-center small`} role="alert">
              {alert.message}
            </div>
          )}

          <form onSubmit={handleMfaSubmit}>
            <div className="mb-4">
              <label className="form-label text-dark fw-semibold">Verification Code</label>
              <input
                type="text"
                className="form-control form-control-lg text-center"
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={10}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.bodyWrapper}>
      <div style={styles.card}>
        <div className="text-center mb-4">
          <div style={styles.logo}>ECHO</div>
          <div className="text-muted small">Educational Communication & Help Organizer</div>
          <h4 className="text-dark mt-3 mb-1 fw-bold">Secure Portal Sign In</h4>
        </div>

        {alert.message && (
          <div className={`alert alert-${alert.type} text-center small`} role="alert">
            {alert.message}
          </div>
        )}

        <form onSubmit={handleInitialSubmit}>
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold">Email or Registration Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. name@university.edu or URK25CS7036"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <label className="form-label text-dark fw-semibold mb-0">Password</label>
              <a href="/forgot-password" style={{ fontSize: '12px' }} className="text-decoration-none fw-semibold text-primary">
                Forgot Password?
              </a>
            </div>
            <div style={styles.inputGroup} className="mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingRight: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a16 16 0 0 0-2.79.24l.77.774a6 6 0 0 1 2.02-.214c2.119.074 4.12 1.272 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold">Campus Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMeCheck"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label className="form-check-label text-dark small fw-semibold cursor-pointer" htmlFor="rememberMeCheck" style={{ userSelect: 'none' }}>
                Remember Me
              </label>
            </div>
          </div>

          {/* CAPTCHA Support Checkbox Mock */}
          <div className="card p-3 mb-4 bg-light border-light">
            <div className="form-check d-flex align-items-center gap-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="captchaCheck"
                checked={captchaVerified}
                onChange={(e) => setCaptchaVerified(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label className="form-check-label text-dark small fw-semibold cursor-pointer" htmlFor="captchaCheck" style={{ userSelect: 'none' }}>
                I am not a robot (CAPTCHA Security)
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-3">
          <a href="/register" className="btn btn-link btn-sm text-decoration-none fw-semibold">
            Need an account? Register here
          </a>
        </div>
      </div>
    </div>
  );
}
