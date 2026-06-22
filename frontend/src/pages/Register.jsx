import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Input states
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('Student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Security checks
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI status
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Password Policy Indicators
  const checkLength = password.length >= 12;
  const checkUpper = /[A-Z]/.test(password);
  const checkLower = /[a-z]/.test(password);
  const checkNumber = /\d/.test(password);
  const checkSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const checkMatch = password && password === confirmPassword;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });

    if (!(checkLength && checkUpper && checkLower && checkNumber && checkSpecial)) {
      setAlert({ message: 'Password does not meet university security policy standards.', type: 'danger' });
      return;
    }

    if (!checkMatch) {
      setAlert({ message: 'Passwords do not match.', type: 'danger' });
      return;
    }

    if (!captchaVerified) {
      setAlert({ message: 'Please complete the CAPTCHA security verification.', type: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const captchaToken = "mock_captcha_success_token";
      const res = await register(
        username,
        fullName,
        email,
        mobileNumber,
        department,
        password,
        confirmPassword,
        role,
        captchaToken
      );
      setLoading(false);
      setAlert({ message: res.message || 'Registration successful!', type: 'success' });
      
      // Auto redirect to login after delay
      setTimeout(() => {
        navigate('/login');
      }, 4000);
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
      padding: '40px 20px',
    },
    card: {
      width: '600px',
      background: 'rgba(255, 255, 255, 0.96)',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
      backdropFilter: 'blur(10px)',
    },
    logo: {
      fontSize: '40px',
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

  return (
    <div style={styles.bodyWrapper}>
      <div style={styles.card}>
        <div className="text-center mb-4">
          <div style={styles.logo}>ECHO</div>
          <h4 className="text-dark mt-2 fw-bold">Portal Registration</h4>
        </div>

        {alert.message && (
          <div className={`alert alert-${alert.type} text-center small`} role="alert">
            {alert.message}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit}>
          <div className="row">
            {/* Full Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-dark fw-semibold small">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Registration Number */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-dark fw-semibold small">Registration Number</label>
              <input
                type="text"
                className="form-control text-uppercase"
                placeholder="URK25CS7036"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>

          <div className="row">
            {/* University Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-dark fw-semibold small">University Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-dark fw-semibold small">Mobile Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+1555010022"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row">
            {/* Department */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-dark fw-semibold small">Department</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            {/* Role Selection */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-dark fw-semibold small">Campus Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>

          <div className="row">
            {/* Password */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-dark fw-semibold small">Password</label>
              <div style={styles.inputGroup}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingRight: '40px' }}
                  placeholder="••••••••••••"
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

            {/* Confirm Password */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-dark fw-semibold small">Confirm Password</label>
              <div style={styles.inputGroup}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingRight: '40px' }}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
          </div>

          {/* Password complexity indicators panel */}
          <div className="card p-3 mb-3 bg-light border-0">
            <h6 className="text-muted text-uppercase small mb-2 fw-bold" style={{ fontSize: '10px' }}>
              University Security Password Standards
            </h6>
            <div className="row small text-dark" style={{ fontSize: '12px' }}>
              <div className="col-md-6">
                <ul className="list-unstyled mb-0">
                  <li className={checkLength ? 'text-success' : 'text-danger'}>
                    {checkLength ? '✓' : '✗'} Minimum 12 characters
                  </li>
                  <li className={checkUpper ? 'text-success' : 'text-danger'}>
                    {checkUpper ? '✓' : '✗'} Contains uppercase letter (A-Z)
                  </li>
                  <li className={checkLower ? 'text-success' : 'text-danger'}>
                    {checkLower ? '✓' : '✗'} Contains lowercase letter (a-z)
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-unstyled mb-0">
                  <li className={checkNumber ? 'text-success' : 'text-danger'}>
                    {checkNumber ? '✓' : '✗'} Contains numerical digit (0-9)
                  </li>
                  <li className={checkSpecial ? 'text-success' : 'text-danger'}>
                    {checkSpecial ? '✓' : '✗'} Contains special character (!@#$%^&*)
                  </li>
                  <li className={checkMatch ? 'text-success' : 'text-danger'}>
                    {checkMatch ? '✓' : '✗'} Confirm Password matches Password
                  </li>
                </ul>
              </div>
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
                I am not a robot (CAPTCHA Security Check)
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center mt-3">
          <a href="/login" className="btn btn-link btn-sm text-decoration-none fw-semibold">
            Already registered? Login here
          </a>
        </div>
      </div>
    </div>
  );
}
