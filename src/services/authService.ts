import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

export const authService = {
    async login(email: string): Promise<{ token: string; user: User }> {
        const { data } = await api.post('/auth/login', { email });
        return data;
    },

    async loginWithGoogle(
        token: string
    ): Promise<{ token: string; user: User }> {
        const { data } = await api.post('/auth/google', { token });
        return data;
    },

    async getUser(): Promise<User> {
        const { data } = await api.get('/auth/user');
        return data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },
};
