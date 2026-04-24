import api from './api';

export interface Manga {
    id: number;
    name: string;
    cover?: string;
    total_chapters?: number;
}

export const mangaService = {
    async getAll(): Promise<Manga[]> {
        const { data } = await api.get('/mangas');
        return data;
    },

    async create(payload: Omit<Manga, 'id'>): Promise<Manga> {
        const { data } = await api.post('/mangas', payload);
        return data;
    },

    async update(id: number, payload: Partial<Omit<Manga, 'id'>>): Promise<Manga> {
        const { data } = await api.patch(`/mangas/${id}`, payload);
        return data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/mangas/${id}`);
    },

    async uploadCover(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/upload', formData, {
            headers: { 'Content-Type': undefined },
        });
        return data.url as string;
    },
};
