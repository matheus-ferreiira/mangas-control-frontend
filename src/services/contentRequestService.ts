import api from './api';
import { ContentType } from './contentService';

export type ContentRequestStatus = 'pending' | 'approved' | 'rejected';

export const REQUEST_STATUS_LABELS: Record<ContentRequestStatus, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
};

export const REQUEST_STATUS_COLORS: Record<ContentRequestStatus, string> = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
};

export interface ContentRequest {
    id: number;
    name: string;
    alternative_names?: string[];
    type: ContentType;
    cover?: string;
    status: ContentRequestStatus;
    rejection_reason?: string;
    created_at?: string;
    user?: { id: number; name: string };
}

export const contentRequestService = {
    async create(payload: {
        name: string;
        alternative_names?: string[];
        type: ContentType;
        cover?: string;
    }): Promise<ContentRequest> {
        const { data } = await api.post('/content-requests', payload);
        return data as ContentRequest;
    },

    async getMy(): Promise<ContentRequest[]> {
        const { data } = await api.get('/content-requests/my');
        return (Array.isArray(data) ? data : data?.data ?? []) as ContentRequest[];
    },

    async getAll(): Promise<ContentRequest[]> {
        const { data } = await api.get('/content-requests');
        return (Array.isArray(data) ? data : data?.data ?? []) as ContentRequest[];
    },

    async approve(id: number): Promise<ContentRequest> {
        const { data } = await api.patch(`/content-requests/${id}/approve`);
        return data as ContentRequest;
    },

    async reject(id: number, rejection_reason: string): Promise<ContentRequest> {
        const { data } = await api.patch(`/content-requests/${id}/reject`, { rejection_reason });
        return data as ContentRequest;
    },
};
