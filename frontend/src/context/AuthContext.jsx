import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

const extractErrorMessage = (error, defaultMsg = 'An error occurred.') => {
  if (!error || !error.response) {
    return error?.message || defaultMsg;
  }
  const data = error.response.data;
  if (!data) return defaultMsg;
  const detail = data.detail;
  if (!detail) return defaultMsg;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(d => d.msg || JSON.stringify(d)).join('; ');
  }
  if (typeof detail === 'object') {
    return detail.message || JSON.stringify(detail);
  }
  return defaultMsg;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mfaPendingUser, setMfaPendingUser] = useState(null); // Tracks username/role during login MFA checkpoint
  const [loading, setLoading] = useState(true);

  // Initialize and check active session status on load
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('echo_access_token') || sessionStorage.getItem('echo_access_token');
      if (accessToken) {
        try {
          // Verify access token validity against backend
          const response = await api.get('/api/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('Session initialization failed:', error);
          const savedUser = localStorage.getItem('echo_user') || sessionStorage.getItem('echo_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password, role, rememberMe = false, captchaToken = "mock_captcha_success_token") => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
        role,
        remember_me: rememberMe,
        device_fingerprint: navigator.userAgent
      });

      const data = response.data;

      if (data.mfa_required) {
        // Multi-Factor checkpoint triggered
        setMfaPendingUser({ username, role, temp_token: data.access_token, rememberMe });
        setLoading(false);
        return { mfaRequired: true };
      }

      // Successful login
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('echo_access_token', data.access_token);
      storage.setItem('echo_refresh_token', data.refresh_token);
      localStorage.setItem('echo_remember_me', rememberMe ? 'true' : 'false');
      
      const userProfile = await api.get('/api/users/me');
      setUser(userProfile.data);
      storage.setItem('echo_user', JSON.stringify(userProfile.data));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      throw extractErrorMessage(error, 'Login failed. Please check credentials.');
    }
  };

  const loginWithMfa = async (code) => {
    if (!mfaPendingUser) {
      throw 'MFA session context expired. Please log in again.';
    }
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        username: mfaPendingUser.username,
        password: '', // Password verified in step 1, mfaPendingUser tracks the token
        role: mfaPendingUser.role,
        mfa_code: code,
        remember_me: mfaPendingUser.rememberMe,
        device_fingerprint: navigator.userAgent
      }, {
        headers: {
          // Send temporary access token to identify session
          'Authorization': `Bearer ${mfaPendingUser.temp_token}`
        }
      });

      const data = response.data;
      const storage = mfaPendingUser.rememberMe ? localStorage : sessionStorage;
      storage.setItem('echo_access_token', data.access_token);
      storage.setItem('echo_refresh_token', data.refresh_token);
      localStorage.setItem('echo_remember_me', mfaPendingUser.rememberMe ? 'true' : 'false');

      const userProfile = await api.get('/api/users/me');
      setUser(userProfile.data);
      storage.setItem('echo_user', JSON.stringify(userProfile.data));
      setMfaPendingUser(null);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      throw extractErrorMessage(error, 'MFA validation failed.');
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Best-effort logout of current session in database
      await api.post('/api/sessions/logout-all').catch(() => {});
    } finally {
      // Clear all local/session states
      localStorage.removeItem('echo_access_token');
      localStorage.removeItem('echo_refresh_token');
      localStorage.removeItem('echo_user');
      localStorage.removeItem('echo_remember_me');
      sessionStorage.removeItem('echo_access_token');
      sessionStorage.removeItem('echo_refresh_token');
      sessionStorage.removeItem('echo_user');
      setUser(null);
      setMfaPendingUser(null);
      setLoading(false);
    }
  };

  const register = async (username, fullName, email, mobileNumber, department, password, confirmPassword, role, captchaToken) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        username,
        full_name: fullName,
        email,
        mobile_number: mobileNumber,
        department,
        password,
        confirm_password: confirmPassword,
        role,
        captcha_token: captchaToken
      });
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      throw extractErrorMessage(error, 'Registration failed.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        mfaPendingUser,
        login,
        loginWithMfa,
        logout,
        register,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
