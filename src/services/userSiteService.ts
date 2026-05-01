import api from './api';

export interface UserSite {
    id: number;
    user_id?: number;
    name: string;
    url: string;
    is_favorite: boolean;
}

export const userSiteService = {
    async getAll(): Promise<UserSite[]> {
        const { data } = await api.get('/user-sites');
        const list = Array.isArray(data) ? data : data?.data ?? [];
        return (list as UserSite[]).sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
    },

    async create(payload: Pick<UserSite, 'name' | 'url' | 'is_favorite'>): Promise<UserSite> {
        const { data } = await api.post('/user-sites', payload);
        return data as UserSite;
    },

    async update(id: number, payload: Partial<Pick<UserSite, 'name' | 'url' | 'is_favorite'>>): Promise<UserSite> {
        const { data } = await api.put(`/user-sites/${id}`, payload);
        return data as UserSite;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/user-sites/${id}`);
    },

    async toggleFavorite(site: UserSite): Promise<UserSite> {
        return userSiteService.update(site.id, { is_favorite: !site.is_favorite });
    },
};
