import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        Accept: 'application/json',
    },
    paramsSerializer: (params) => {
        const search = new URLSearchParams();
        for (const [key, val] of Object.entries(params)) {
            if (Array.isArray(val)) {
                val.forEach((v) => search.append(`${key}[]`, String(v)));
            } else if (val != null) {
                search.set(key, String(val));
            }
        }
        return search.toString();
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        // Unwrap ApiResponse trait: { success, message, data: {...} }
        const d = response.data;
        if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
            response.data = d.data;
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
