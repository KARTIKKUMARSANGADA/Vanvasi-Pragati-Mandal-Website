import axios from 'axios';
import { API_URL } from './config';

const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true
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
