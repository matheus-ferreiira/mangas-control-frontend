import api from './api';

export type MangaStatus =
    | 'reading'
    | 'completed'
    | 'plan_to_read'
    | 'dropped'
    | 'paused';

export interface UserManga {
    id: number;
    manga_id: number;
    site_id?: number;
    current_chapters: number;
    status: MangaStatus;
    manga?: {
        id: number;
        name: string;
        cover?: string;
        total_chapters?: number;
    };
    site?: {
        id: number;
        name: string;
        url: string;
    };
}

export const STATUS_LABELS: Record<MangaStatus, string> = {
    reading: 'Lendo',
    completed: 'Completo',
    plan_to_read: 'Quero Ler',
    dropped: 'Abandonado',
    paused: 'Pausado',
};

export const STATUS_COLORS: Record<MangaStatus, string> = {
    reading: 'primary',
    completed: 'success',
    plan_to_read: 'medium',
    dropped: 'danger',
    paused: 'warning',
};

export const userMangaService = {
    async getAll(): Promise<UserManga[]> {
        const { data } = await api.get('/user-mangas');
        return (Array.isArray(data) ? data : data?.data ?? []) as UserManga[];
    },

    async getOne(id: number): Promise<UserManga> {
        const { data } = await api.get(`/user-mangas/${id}`);
        return data as UserManga;
    },

    async create(payload: {
        manga_id: number;
        site_id: number;
        current_chapters?: number;
        status: MangaStatus;
    }): Promise<UserManga> {
        const { data } = await api.post('/user-mangas', payload);
        return data as UserManga;
    },

    async update(
        id: number,
        payload: Partial<Pick<UserManga, 'current_chapters' | 'status' | 'site_id'>>
    ): Promise<UserManga> {
        const { data } = await api.patch(`/user-mangas/${id}`, payload);
        return data as UserManga;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/user-mangas/${id}`);
    },

    async increment(id: number): Promise<UserManga> {
        const { data } = await api.patch(`/user-mangas/${id}/increment`);
        return data as UserManga;
    },
};
