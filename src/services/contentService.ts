import api from './api';

export type ContentType = 'manga' | 'anime' | 'novel' | 'movie' | 'tv';
export type ContentCatalogStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
export type ContentSortField = 'name' | 'rating' | 'popularity' | 'votes_count' | 'created_at' | 'updated_at' | 'score' | 'release_year';

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
    manga: 'Manga',
    anime: 'Anime',
    novel: 'Novel',
    movie: 'Filme',
    tv: 'Série',
};

export const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
    manga: 'bg-neon-accent/15 text-neon-accent',
    anime: 'bg-[#7b8ff5]/15 text-[#7b8ff5]',
    novel: 'bg-[#ffa26b]/15 text-[#ffa26b]',
    movie: 'bg-[#f87171]/15 text-[#f87171]',
    tv: 'bg-[#a78bfa]/15 text-[#a78bfa]',
};

export const CATALOG_STATUS_LABELS: Record<ContentCatalogStatus, string> = {
    ongoing: 'Em andamento',
    completed: 'Completo',
    hiatus: 'Hiato',
    cancelled: 'Cancelado',
};

export const CATALOG_STATUS_COLORS: Record<ContentCatalogStatus, string> = {
    ongoing: '#00d4aa',
    completed: '#10b981',
    hiatus: '#f59e0b',
    cancelled: '#ef4444',
};

export const UNIT_LABEL: Record<ContentType, { short: string; plural: string }> = {
    manga: { short: 'cap.', plural: 'capítulos' },
    anime: { short: 'ep.', plural: 'episódios' },
    novel: { short: 'cap.', plural: 'capítulos' },
    movie: { short: 'min', plural: 'minutos' },
    tv: { short: 'ep.', plural: 'episódios' },
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
    // Novos campos de metadata
    rating?: number;
    popularity?: number;
    votes_count?: number;
    synopsis?: string;
    genres?: string[];
    release_year?: number;
    original_language?: string;
    background?: string;
    score?: number;
    source?: 'jikan' | 'tmdb' | null;
    external_id?: string | null;
    is_adult?: boolean;
    is_in_library?: boolean;
    origin_type?: string;
    duration?: number;
    trailer_url?: string;
    trailer_embed_url?: string;
    country?: string;
    total_seasons?: number;
    duration_formatted?: string;
    studios?: string[];
    demographics?: string[];
    themes?: string[];
    tagline?: string;
    age_rating?: string;
    networks?: string[];
}

export interface ContentMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface PaginatedContent {
    items: Content[];
    meta: ContentMeta;
}

export interface ContentFilters {
    type?: ContentType;
    status?: ContentCatalogStatus;
    search?: string;
    recent?: boolean;
    genres?: string[];
    year?: number;
    year_min?: number;
    year_max?: number;
    rating_min?: number;
    rating_max?: number;
    votes_min?: number;
    language?: string;
    country?: string;
    is_adult?: boolean;
    page?: number;
    per_page?: number;
    sort?: ContentSortField;
    order?: 'asc' | 'desc';
}

const EMPTY_META: ContentMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0,
};

export const contentService = {
    async getAll(filters?: ContentFilters): Promise<PaginatedContent> {
        const params: Record<string, string | number | boolean | string[]> = {};
        if (filters?.type) params.type = filters.type;
        if (filters?.status) params.status = filters.status;
        if (filters?.search?.trim()) params.search = filters.search.trim();
        if (filters?.recent) params.recent = true;
        if (filters?.year) params.year = filters.year;
        if (filters?.year_min) params.year_min = filters.year_min;
        if (filters?.year_max) params.year_max = filters.year_max;
        if (filters?.rating_min != null && filters.rating_min > 0) params.rating_min = filters.rating_min;
        if (filters?.rating_max != null) params.rating_max = filters.rating_max;
        if (filters?.votes_min != null && filters.votes_min > 0) params.votes_min = filters.votes_min;
        if (filters?.language) params.language = filters.language;
        if (filters?.country) params.country = filters.country;
        if (filters?.is_adult != null) params.is_adult = filters.is_adult;
        if (filters?.page) params.page = filters.page;
        if (filters?.per_page) params.per_page = filters.per_page;
        if (filters?.sort) params.sort = filters.sort;
        if (filters?.order) params.order = filters.order;
        if (filters?.genres?.length) params.genres = filters.genres;

        const { data } = await api.get('/contents', { params });

        // Novo formato paginado: { items: [...], meta: {...} }
        if (data && Array.isArray(data.items)) {
            return data as PaginatedContent;
        }
        // Compatibilidade com formato antigo (array direto)
        const items = Array.isArray(data) ? data : [];
        return {
            items: items as Content[],
            meta: { ...EMPTY_META, total: items.length, per_page: items.length, last_page: 1 },
        };
    },

    async create(payload: Omit<Content, 'id'>, coverFile?: File): Promise<Content> {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('type', payload.type);
        if (payload.total_units != null) formData.append('total_units', String(payload.total_units));
        if (payload.total_seasons != null) formData.append('total_seasons', String(payload.total_seasons));
        if (payload.duration != null) formData.append('duration', String(payload.duration));
        if (payload.status) formData.append('status', payload.status);
        if (payload.synopsis) formData.append('synopsis', payload.synopsis);
        if (payload.release_year != null) formData.append('release_year', String(payload.release_year));
        if (payload.rating != null) formData.append('rating', String(payload.rating));
        if (payload.country) formData.append('country', payload.country);
        if (payload.original_language) formData.append('original_language', payload.original_language);
        if (payload.genres?.length) payload.genres.forEach((g) => formData.append('genres[]', g));
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
        if (payload.total_seasons !== undefined) {
            formData.append('total_seasons', payload.total_seasons != null ? String(payload.total_seasons) : '');
        }
        if (payload.duration !== undefined) {
            formData.append('duration', payload.duration != null ? String(payload.duration) : '');
        }
        if (payload.status !== undefined) formData.append('status', payload.status ?? '');
        if (payload.synopsis !== undefined) formData.append('synopsis', payload.synopsis ?? '');
        if (payload.release_year !== undefined) {
            formData.append('release_year', payload.release_year != null ? String(payload.release_year) : '');
        }
        if (payload.rating !== undefined) {
            formData.append('rating', payload.rating != null ? String(payload.rating) : '');
        }
        if (payload.country !== undefined) formData.append('country', payload.country ?? '');
        if (payload.original_language !== undefined) formData.append('original_language', payload.original_language ?? '');
        if (payload.genres !== undefined) {
            if (payload.genres.length) {
                payload.genres.forEach((g) => formData.append('genres[]', g));
            } else {
                formData.append('genres', '');
            }
        }
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

    async getById(id: number): Promise<Content | null> {
        try {
            const { data } = await api.get(`/contents/${id}`);
            if (!data || typeof data !== 'object' || !('id' in data)) return null;
            return data as Content;
        } catch {
            return null;
        }
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/contents/${id}`);
    },
};
