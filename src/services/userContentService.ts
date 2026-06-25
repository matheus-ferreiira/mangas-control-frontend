import api from './api';
import { ContentType, ContentCatalogStatus } from './contentService';

export type ContentStatus = 'reading' | 'completed' | 'paused' | 'dropped' | 'plan_to_read';

export const STATUS_LABELS: Record<ContentStatus, string> = {
    reading: 'Lendo',
    completed: 'Completo',
    plan_to_read: 'Quero Ler',
    dropped: 'Abandonado',
    paused: 'Pausado',
};

export function getStatusLabel(status: ContentStatus, type: ContentType = 'manga'): string {
    const isVideo = type === 'anime' || type === 'movie' || type === 'tv';
    if (status === 'reading' && isVideo) return 'Assistindo';
    if (status === 'plan_to_read' && isVideo) return 'Quero Assistir';
    return STATUS_LABELS[status] ?? status;
}

export interface UserContent {
    id: number;
    user_id?: number;
    content_id: number;
    site_id?: number;
    user_site_id?: number;
    site_title?: string | null;
    site_last_chapter?: string | null;
    current_units: number;
    current_season?: number;
    progress_percent?: number | null;
    rating?: number | null;
    status: ContentStatus;
    last_unit_update?: string;
    last_interacted_at?: string;
    content?: {
        id: number;
        name: string;
        alternative_names?: string[];
        cover?: string;
        background?: string;
        type: ContentType;
        total_units?: number;
        total_seasons?: number;
        season_episodes?: Record<string, number> | null;
        status?: ContentCatalogStatus;
        last_unit_update?: string;
        genres?: string[];
        score?: number;
        rating?: number;
        release_year?: number;
        votes_count?: number;
        synopsis?: string;
        duration_formatted?: string;
        trailer_url?: string;
        trailer_embed_url?: string;
        country?: string;
        original_language?: string;
        is_adult?: boolean;
        origin_type?: string;
        age_rating?: string;
        tagline?: string;
        studios?: string[];
        demographics?: string[];
        themes?: string[];
        networks?: string[];
        duration?: number;
        source?: string;
        external_id?: string | null;
        popularity?: number;
    };
    site?: {
        id: number;
        name: string;
        url: string;
    };
    user_site?: {
        id: number;
        name: string;
        url?: string | null;
        logo_url?: string | null;
        type?: 'website' | 'app';
        is_favorite: boolean;
    };
}

export const userContentService = {
    async getAll(params?: { type?: ContentType; status?: ContentStatus; content_id?: number }): Promise<UserContent[]> {
        const { data } = await api.get('/user-contents', { params });
        if (Array.isArray(data)) return data as UserContent[];
        if (Array.isArray(data?.items)) return data.items as UserContent[];
        if (Array.isArray(data?.data)) return data.data as UserContent[];
        return [];
    },

    async getWithUpdates(): Promise<UserContent[]> {
        const { data } = await api.get('/user-contents/with-updates');
        if (Array.isArray(data)) return data as UserContent[];
        if (Array.isArray(data?.data)) return data.data as UserContent[];
        return [];
    },

    async getOne(id: number): Promise<UserContent> {
        const { data } = await api.get(`/user-contents/${id}`);
        return data as UserContent;
    },

    async create(payload: {
        content_id: number;
        site_id?: number;
        user_site_id?: number;
        site_title?: string | null;
        current_units?: number;
        current_season?: number;
        status: ContentStatus;
        rating?: number;
    }): Promise<UserContent> {
        const { data } = await api.post('/user-contents', payload);
        return data as UserContent;
    },

    async update(
        id: number,
        payload: {
            current_units?: number;
            current_season?: number;
            status?: ContentStatus;
            site_id?: number | null;
            user_site_id?: number | null;
            site_title?: string | null;
            rating?: number | null;
        }
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
