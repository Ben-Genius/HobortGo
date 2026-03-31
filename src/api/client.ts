import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const rawBaseUrl = (process.env.EXPO_PUBLIC_BASE_URL || 'http://192.168.100.208:3000/api').replace(/\/$/, '');
// Ensure the full versioned path: strip any trailing /v1 then append clean /v1
const BASE_URL = rawBaseUrl.endsWith('/api/v1')
    ? rawBaseUrl
    : rawBaseUrl.endsWith('/api')
    ? `${rawBaseUrl}/v1`
    : `${rawBaseUrl}/api/v1`;

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors, e.g., 401 Unauthorized -> logout
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
