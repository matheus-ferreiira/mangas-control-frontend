import api from './api';

export type ContentType = 'manga' | 'anime' | 'novel';

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
    manga: 'Manga',
    anime: 'Anime',
    novel: 'Novel',
};

export const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
    manga: 'bg-neon-accent/15 text-neon-accent',
    anime: 'bg-[#7b8ff5]/15 text-[#7b8ff5]',
    novel: 'bg-[#ffa26b]/15 text-[#ffa26b]',
};

export const UNIT_LABEL: Record<ContentType, { short: string; plural: string }> = {
    manga: { short: 'cap.', plural: 'capítulos' },
    anime: { short: 'ep.', plural: 'episódios' },
    novel: { short: 'cap.', plural: 'capítulos' },
};

export interface Content {
    id: number;
    name: string;
    cover?: string;
    type: ContentType;
    total_units?: number;
}

export const contentService = {
    async getAll(type?: ContentType): Promise<Content[]> {
        const params = type ? { type } : {};
        const { data } = await api.get('/contents', { params });
        return (Array.isArray(data) ? data : data?.data ?? []) as Content[];
    },

    async create(payload: Omit<Content, 'id'>, coverFile?: File): Promise<Content> {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('type', payload.type);
        if (payload.total_units != null) formData.append('total_units', String(payload.total_units));
        if (coverFile) formData.append('cover', coverFile);
        const { data } = await api.post('/contents', formData);
        return data as Content;
    },

    async update(id: number, payload: Partial<Omit<Content, 'id'>>, coverFile?: File): Promise<Content> {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        if (payload.name != null) formData.append('name', payload.name);
        if (payload.type != null) formData.append('type', payload.type);
        if (payload.total_units !== undefined) {
            formData.append('total_units', payload.total_units != null ? String(payload.total_units) : '');
        }
        if (coverFile) formData.append('cover', coverFile);
        const { data } = await api.post(`/contents/${id}`, formData);
        return data as Content;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/contents/${id}`);
    },
};
