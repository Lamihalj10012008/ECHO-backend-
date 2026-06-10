import React, { useState, useEffect } from 'react';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ message: '', type: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('echo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });

    const endpoint = isRegisterMode ? 'register' : 'login';

    try {
      const response = await fetch(`http://127.0.0.1:8001/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegisterMode) {
          setAlert({ message: data.message, type: 'success' });
          setIsRegisterMode(false);
          setPassword('');
        } else {
          const loggedInUser = { username, role, message: data.message };
          localStorage.setItem('echo_user', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
        }
      } else {
        setAlert({
          message: data.detail || 'An unexpected authentication error occurred.',
          type: 'danger',
        });
      }
    } catch (error) {
      setAlert({
        message: 'Could not connect to the backend server. Is FastAPI active on port 8001?',
        type: 'danger',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('echo_user');
    setUser(null);
    setUsername('');
    setPassword('');
    setAlert({ message: '', type: '' });
  };

  const styles = {
    bodyWrapper: {
      background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      padding: 0,
    },
    authCard: {
      width: '440px',
      background: 'white',
      padding: '35px',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    },
    dashboardCard: {
      width: '650px',
      background: 'white',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    },
    logo: {
      fontSize: '42px',
      fontWeight: 'bold',
      color: '#2563eb',
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '14px',
    },
    btnPrimary: {
      width: '100%',
      background: '#2563eb',
      color: 'white',
      fontWeight: 'bold',
      border: 'none',
      padding: '10px',
      borderRadius: '6px',
      transition: 'background 0.2s ease',
    }
  };

  if (user) {
    return (
      <div style={styles.bodyWrapper}>
        <div style={styles.dashboardCard} className="text-center">
          <div style={styles.logo} className="mb-2">ECHO</div>
          <h2 className="text-dark mb-4">Governance Dashboard</h2>
          
          <div className="alert alert-success py-3 mb-4">
            <h5 className="mb-0">{user.message}</h5>
          </div>

          <div className="card my-4 p-4 bg-light text-start text-dark">
            <h6 className="text-muted text-uppercase tracking-wider small mb-3">Verified Active Session</h6>
            <p className="mb-2"><strong>Campus Username / Reg No:</strong> {user.username}</p>
            <p className="mb-0"><strong>Security Clearance Role:</strong> {user.role}</p>
          </div>

          <button onClick={handleLogout} className="btn btn-outline-danger px-5 mt-3 fw-bold">
            Log Out of Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.bodyWrapper}>
      <div style={styles.authCard}>
        
        <div className="text-center mb-4">
          <div style={styles.logo}>ECHO</div>
          <div style={styles.subtitle}>
            Educational Communication & Help Organizer
          </div>
          <h4 className="text-dark mt-3 mb-1 fw-bold">
            {isRegisterMode ? 'Create Account' : 'Account Login'}
          </h4>
        </div>

        {alert.message && (
          <div className={`alert alert-${alert.type} text-center small`} role="alert">
            {alert.message}
          </div>
        )}

        <form onSubmit={handleAuthSubmit}>
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold">Registration Number</label>
            <input
              type="text"
              className="form-control text-uppercase"
              placeholder="e.g., URK25CS7036"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-dark fw-semibold">Campus Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          <button 
            type="submit" 
            style={styles.btnPrimary}
            onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.background = '#2563eb'}
          >
            {isRegisterMode ? 'Register Account' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-3">
          <button 
            className="btn btn-link btn-sm text-decoration-none fw-semibold"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setAlert({ message: '', type: '' });
            }}
          >
            {isRegisterMode ? 'Already have an account? Login here' : "Don't have an account? Register here"}
          </button>
        </div>

        <hr className="text-secondary opacity-25 my-3" />

        <div className="text-center">
          <small className="text-muted">
            Smart Campus Governance System
          </small>
        </div>

      </div>
    </div>
  );
}
