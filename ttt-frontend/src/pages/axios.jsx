import axios from 'axios';

// Create Axios instance with base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/', // your Django API URL
});

// Add a request interceptor to include JWT token in the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      // Handle unauthorized error (token expired, etc.)
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:8000/api/token/refresh/', { refresh: refreshToken });
          const { access } = res.data;
          localStorage.setItem('access', access);  // Update the access token
          error.config.headers['Authorization'] = `Bearer ${access}`;
          return axios(error.config);  // Retry the original request with the new access token
        } catch (err) {
          // Handle refresh token failure (user must log in again)
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login';  // Redirect to login page
        }
      } else {
        window.location.href = '/login';  // No refresh token available, redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
