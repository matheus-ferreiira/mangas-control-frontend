import api from './api';

export interface ReaderEdition {
    slug: string;
    title: string;
    language: string;
    edition: string;
    first_chapter: number;
    last_chapter: number;
}

export interface ReaderIndex extends ReaderEdition {
    chapters: number[];
}

export interface ReaderChapter {
    number: number;
    title: string;
    language: string;
    paragraphs: string[];
    source_url: string;
    edition: string;
    browser_url: string;
}

export function readerPath(content: { id: number; reader?: ReaderEdition | null }, chapter?: number): string | null {
    if (!content.reader) return null;
    if (chapter != null && (chapter < content.reader.first_chapter || chapter > content.reader.last_chapter)) return null;
    return `/reader/${content.id}${chapter == null ? '' : `/${chapter}`}`;
}

export function startingChapter(index: ReaderIndex, progress: number, saved?: number): number {
    if (saved != null && index.chapters.includes(saved)) return saved;
    return index.chapters.find((number) => number > progress) ?? index.last_chapter;
}

export const novelReaderService = {
    async index(id: number): Promise<ReaderIndex> {
        const { data } = await api.get(`/contents/${id}/reader`);
        return data;
    },
    async chapter(id: number, chapter: number): Promise<ReaderChapter> {
        const { data } = await api.get(`/contents/${id}/reader/${chapter}`);
        return data;
    },
};
