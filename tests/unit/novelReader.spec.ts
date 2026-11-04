import { describe, expect, it } from 'vitest';
import { readerPath, startingChapter, ReaderIndex } from '../../src/services/novelReaderService';
import { readingUrl, UserContent } from '../../src/services/userContentService';

const edition: ReaderIndex = {
    slug: 'test', title: 'Novel', language: 'en', edition: 'original',
    first_chapter: 401, last_chapter: 403, chapters: [401, 402, 403],
};

describe('novel reader routing', () => {
    it('uses internal reader only for available chapters', () => {
        const content = { id: 10, reader: edition };
        expect(readerPath(content, 401)).toBe('/reader/10/401');
        expect(readerPath(content, 400)).toBeNull();
        expect(readerPath(content, 404)).toBeNull();
        expect(readerPath({ id: 11 }, 401)).toBeNull();
    });
    it('starts at the next available chapter or resumes a valid position', () => {
        expect(startingChapter(edition, 0)).toBe(401);
        expect(startingChapter(edition, 401)).toBe(402);
        expect(startingChapter(edition, 403)).toBe(403);
        expect(startingChapter(edition, 402, 401)).toBe(401);
        expect(startingChapter(edition, 401, 900)).toBe(402);
    });
    it('prefers prepared text and preserves external links outside the corpus', () => {
        const uc = {
            current_units: 400, chapter_url: 'https://example.com/{n}',
            content: { id: 10, type: 'novel', reader: edition },
        } as UserContent;
        expect(readingUrl(uc)).toBe('/reader/10/401');
        expect(readingUrl(uc, 400)).toBe('https://example.com/400');
        expect(readingUrl(uc, 404)).toBe('https://example.com/404');
    });
});
