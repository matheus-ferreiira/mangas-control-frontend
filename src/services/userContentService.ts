import api from './api';
import { ContentType } from './contentService';

export type ContentStatus = 'reading' | 'completed' | 'paused' | 'dropped' | 'plan_to_read';

export const STATUS_LABELS: Record<ContentStatus, string> = {
    reading: 'Lendo',
    completed: 'Completo',
    plan_to_read: 'Quero Ler',
    dropped: 'Abandonado',
    paused: 'Pausado',
};

export function getStatusLabel(status: ContentStatus, type: ContentType = 'manga'): string {
    if (status === 'reading' && type === 'anime') return 'Assistindo';
    if (status === 'plan_to_read' && type === 'anime') return 'Quero Assistir';
    return STATUS_LABELS[status] ?? status;
}

export interface UserContent {
    id: number;
    user_id?: number;
    content_id: number;
    site_id?: number;
    current_units: number;
    rating?: number | null;
    status: ContentStatus;
    content?: {
        id: number;
        name: string;
        cover?: string;
        type: ContentType;
        total_units?: number;
    };
    site?: {
        id: number;
        name: string;
        url: string;
    };
}

export const userContentService = {
    async getAll(params?: { type?: ContentType; status?: ContentStatus }): Promise<UserContent[]> {
        const { data } = await api.get('/user-contents', { params });
        return (Array.isArray(data) ? data : data?.data ?? []) as UserContent[];
    },

    async getOne(id: number): Promise<UserContent> {
        const { data } = await api.get(`/user-contents/${id}`);
        return data as UserContent;
    },

    async create(payload: {
        content_id: number;
        site_id?: number;
        current_units?: number;
        status: ContentStatus;
        rating?: number;
    }): Promise<UserContent> {
        const { data } = await api.post('/user-contents', payload);
        return data as UserContent;
    },

    async update(
        id: number,
        payload: Partial<Pick<UserContent, 'current_units' | 'status' | 'site_id' | 'rating'>>
    ): Promise<UserContent> {
        const { data } = await api.patch(`/user-contents/${id}`, payload);
        return data as UserContent;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/user-contents/${id}`);
    },

    async increment(id: number): Promise<UserContent> {
        const { data } = await api.patch(`/user-contents/${id}/increment`);
        return data as UserContent;
    },
};
