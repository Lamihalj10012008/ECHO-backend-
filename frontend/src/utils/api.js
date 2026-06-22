import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT access token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('echo_access_token') || sessionStorage.getItem('echo_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle automatic refresh token rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Guard: check if error response exists and status is 401 (Unauthorized)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in-progress, queue request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('echo_refresh_token') || sessionStorage.getItem('echo_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        // No refresh token: clear user and reject
        return Promise.reject(error);
      }

      try {
        // Post to backend to rotate access and refresh tokens
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        
        // Save rotated credentials
        const rememberMe = localStorage.getItem('echo_remember_me') === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;
        
        storage.setItem('echo_access_token', access_token);
        storage.setItem('echo_refresh_token', refresh_token);

        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

        processQueue(null, access_token);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Revocation hijacked or refresh token expired: clear all session states
        localStorage.removeItem('echo_access_token');
        localStorage.removeItem('echo_refresh_token');
        localStorage.removeItem('echo_user');
        localStorage.removeItem('echo_remember_me');
        sessionStorage.removeItem('echo_access_token');
        sessionStorage.removeItem('echo_refresh_token');
        sessionStorage.removeItem('echo_user');
        
        // Trigger page reload to auth gateway
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
