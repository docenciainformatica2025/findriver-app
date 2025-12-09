import axios from 'axios';
import { auth } from '../config/firebase';

const client = axios.create({
    // FIX: Use production URL as default if env var is missing
    baseURL: import.meta.env.VITE_API_URL || 'https://findriver-app.onrender.com/api/v1', // Updated fix
});

// Interceptor para agregar el token
client.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
