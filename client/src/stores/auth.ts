import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        token: localStorage.getItem('token') || null,
        isAuthModalOpen: false,
        authMode: 'login' as 'login' | 'register',
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(username: string, password: string) {
            const response = await axios.post('http://localhost:3000/api/auth/login', { username, password });
            this.token = response.data.token;
            this.user = response.data.user;
            localStorage.setItem('token', this.token as string);
            localStorage.setItem('user', JSON.stringify(this.user));
            this.isAuthModalOpen = false;
        },
        async register(username: string, password: string) {
            const response = await axios.post('http://localhost:3000/api/auth/register', { username, password });
            this.token = response.data.token;
            this.user = response.data.user;
            localStorage.setItem('token', this.token as string);
            localStorage.setItem('user', JSON.stringify(this.user));
            this.isAuthModalOpen = false;
        },
        openAuth(mode: 'login' | 'register' = 'login') {
            this.authMode = mode;
            this.isAuthModalOpen = true;
        },
        closeAuth() {
            this.isAuthModalOpen = false;
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
});
