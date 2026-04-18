import api from './api'

export type MangaStatus = 'reading' | 'completed' | 'plan_to_read' | 'dropped' | 'on_hold'

export interface UserManga {
  id: number
  manga_id: number
  site_id?: number
  current_chapter: number
  status: MangaStatus
  manga?: {
    id: number
    name: string
    cover_url?: string
    total_chapters?: number
  }
  site?: {
    id: number
    name: string
    url: string
  }
}

export const STATUS_LABELS: Record<MangaStatus, string> = {
  reading: 'Reading',
  completed: 'Completed',
  plan_to_read: 'Plan to Read',
  dropped: 'Dropped',
  on_hold: 'On Hold',
}

export const STATUS_COLORS: Record<MangaStatus, string> = {
  reading: 'primary',
  completed: 'success',
  plan_to_read: 'medium',
  dropped: 'danger',
  on_hold: 'warning',
}

export const userMangaService = {
  async getAll(): Promise<UserManga[]> {
    const { data } = await api.get('/user-mangas')
    return data
  },

  async getOne(id: number): Promise<UserManga> {
    const { data } = await api.get(`/user-mangas/${id}`)
    return data
  },

  async create(payload: {
    manga_id: number
    site_id?: number
    current_chapter?: number
    status: MangaStatus
  }): Promise<UserManga> {
    const { data } = await api.post('/user-mangas', payload)
    return data
  },

  async update(
    id: number,
    payload: Partial<Pick<UserManga, 'current_chapter' | 'status' | 'site_id'>>
  ): Promise<UserManga> {
    const { data } = await api.put(`/user-mangas/${id}`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/user-mangas/${id}`)
  },

  async increment(id: number): Promise<UserManga> {
    const { data } = await api.post(`/user-mangas/${id}/increment`)
    return data
  },

  async decrement(id: number): Promise<UserManga> {
    const { data } = await api.post(`/user-mangas/${id}/decrement`)
    return data
  },
}
