import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

export const authService = {
    async loginWithGoogle(token: string): Promise<{ token: string; user: User }> {
        const { data } = await api.post('/auth/google', { token });
        // Backend returns: { user: UserResource, access_token: string, token_type: string }
        return { token: data.access_token as string, user: data.user as User };
    },

    async getUser(): Promise<User> {
        const { data } = await api.get('/auth/me');
        return data as User;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },
};
