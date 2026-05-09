import api from './api';
import { Content } from './contentService';

export interface ContinueItem {
    user_content_id: number;
    content_id: number;
    title: string;
    cover?: string;
    type: string;
    current_units: number;
    total_units?: number;
    progress_pct: number;
}

export interface DiscoverHome {
    featured: Content | null;
    trending: Content[];
    top_anime: Content[];
    popular_manga: Content[];
    movies_and_tv: Content[];
    top_rated: Content[];
    recently_updated: Content[];
    new_additions: Content[];
    top_novels: Content[];
    completed_works: Content[];
    continue_items: ContinueItem[];
    recommendations: Content[];
    user_top_genres: string[];
}

export const discoverService = {
    async getHome(): Promise<DiscoverHome> {
        const { data } = await api.get('/discover/home');
        return data as DiscoverHome;
    },
};
