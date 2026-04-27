import api from './api';

export interface User {
    id: number;
    name: string;
    username?: string;
    email: string;
    avatar?: string;
    role?: string;
}

export const authService = {
    async loginWithGoogle(token: string): Promise<{ token: string; user: User }> {
        const { data } = await api.post('/auth/google', { token });
        return { token: data.access_token as string, user: data.user as User };
    },

    async login(email: string, password: string): Promise<{ token: string; user: User }> {
        const { data } = await api.post('/auth/login', { email, password });
        return { token: data.access_token as string, user: data.user as User };
    },

    async register(payload: {
        name: string;
        username: string;
        email: string;
        password: string;
    }): Promise<{ token: string; user: User }> {
        const { data } = await api.post('/auth/register', payload);
        return { token: data.access_token as string, user: data.user as User };
    },

    async forgotPassword(email: string): Promise<void> {
        await api.post('/auth/forgot-password', { email });
    },

    async resetPassword(payload: {
        token: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<void> {
        await api.post('/auth/reset-password', payload);
    },

    async getUser(): Promise<User> {
        const { data } = await api.get('/auth/me');
        return data as User;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },
};
