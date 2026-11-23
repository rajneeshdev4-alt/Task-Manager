import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const normalized = {
      message: data?.message || 'Something went wrong. Please try again.',
      errors: data?.errors || [],
      status: error.response?.status,
    };
    return Promise.reject(normalized);
  }
);

export { api };
