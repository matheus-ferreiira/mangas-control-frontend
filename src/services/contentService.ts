import api from './api';

export type ContentType = 'manga' | 'anime' | 'novel';
export type ContentCatalogStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';

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

export const CATALOG_STATUS_LABELS: Record<ContentCatalogStatus, string> = {
    ongoing: 'Em Andamento',
    completed: 'Completo',
    hiatus: 'Hiato',
    cancelled: 'Cancelado',
};

export const CATALOG_STATUS_COLORS: Record<ContentCatalogStatus, string> = {
    ongoing: '#f59e0b',
    completed: '#10b981',
    hiatus: '#8b5cf6',
    cancelled: '#ef4444',
};

export const UNIT_LABEL: Record<ContentType, { short: string; plural: string }> = {
    manga: { short: 'cap.', plural: 'capítulos' },
    anime: { short: 'ep.', plural: 'episódios' },
    novel: { short: 'cap.', plural: 'capítulos' },
};

export interface Content {
    id: number;
    name: string;
    alternative_names?: string[];
    cover?: string;
    type: ContentType;
    total_units?: number;
    status?: ContentCatalogStatus;
    last_unit_update?: string;
}

export interface ContentFilters {
    type?: ContentType;
    status?: ContentCatalogStatus;
    search?: string;
    recent?: boolean;
}

export const contentService = {
    async getAll(filters?: ContentFilters): Promise<Content[]> {
        const params: Record<string, string | boolean> = {};
        if (filters?.type) params.type = filters.type;
        if (filters?.status) params.status = filters.status;
        if (filters?.search?.trim()) params.search = filters.search.trim();
        if (filters?.recent) params.recent = true;
        const { data } = await api.get('/contents', { params });
        return (Array.isArray(data) ? data : data?.data ?? []) as Content[];
    },

    async create(payload: Omit<Content, 'id'>, coverFile?: File): Promise<Content> {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('type', payload.type);
        if (payload.total_units != null) formData.append('total_units', String(payload.total_units));
        if (payload.status) formData.append('status', payload.status);
        if (payload.alternative_names?.length) {
            payload.alternative_names.forEach((n) => formData.append('alternative_names[]', n));
        }
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
        if (payload.status !== undefined) formData.append('status', payload.status ?? '');
        if (payload.alternative_names !== undefined) {
            if (payload.alternative_names.length) {
                payload.alternative_names.forEach((n) => formData.append('alternative_names[]', n));
            } else {
                formData.append('alternative_names', '');
            }
        }
        if (coverFile) formData.append('cover', coverFile);
        const { data } = await api.post(`/contents/${id}`, formData);
        return data as Content;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/contents/${id}`);
    },
};
