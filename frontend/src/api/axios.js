import axios from 'axios';

const instance = axios.create({
    baseURL: (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000') + '/api'
});

// Add a request interceptor to include token
instance.interceptors.request.use(
    (config) => {
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
        if (adminInfo && adminInfo.access_token) {
            config.headers.Authorization = `Bearer ${adminInfo.access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
