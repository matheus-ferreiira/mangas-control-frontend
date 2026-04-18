import api from './api';

export interface Site {
    id: number;
    name: string;
    url: string;
}

export const siteService = {
    async getAll(): Promise<Site[]> {
        const { data } = await api.get('/sites');
        return data;
    },

    async create(payload: Omit<Site, 'id'>): Promise<Site> {
        const { data } = await api.post('/sites', payload);
        return data;
    },

    async update(
        id: number,
        payload: Partial<Omit<Site, 'id'>>
    ): Promise<Site> {
        const { data } = await api.put(`/sites/${id}`, payload);
        return data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/sites/${id}`);
    },
};
