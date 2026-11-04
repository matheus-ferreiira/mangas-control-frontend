import { describe, expect, test } from 'vitest';
import { nextUnit, readingUrl, UserContent } from '@/services/userContentService';

const item = (over: Partial<UserContent> = {}): UserContent => ({
    id: 1,
    content_id: 1,
    current_units: 448,
    status: 'reading',
    content: { id: 1, name: "Swordmaster's Youngest Son", type: 'novel', total_units: 1147 },
    ...over,
});

describe('nextUnit', () => {
    test('é o capítulo atual + 1', () => {
        expect(nextUnit(item())).toBe(449);
    });

    test('não passa do total', () => {
        expect(nextUnit(item({ current_units: 1147 }))).toBe(1147);
        expect(nextUnit(item(), 448)).toBe(448);
    });

    test('sem total conhecido, só soma 1', () => {
        expect(nextUnit(item({ content: undefined }))).toBe(449);
    });
});

describe('readingUrl', () => {
    test('troca {n} pelo próximo capítulo', () => {
        const uc = item({ chapter_url: 'https://daotekno.com/series/swordmasters-youngest-son/{n}/' });
        expect(readingUrl(uc)).toBe('https://daotekno.com/series/swordmasters-youngest-son/449/');
    });

    test('troca todas as ocorrências e aceita o número calculado fora', () => {
        const uc = item({ chapter_url: 'https://site.com/{n}?cap={n}' });
        expect(readingUrl(uc, 10)).toBe('https://site.com/10?cap=10');
    });

    test('link sem {n} abre como está', () => {
        expect(readingUrl(item({ chapter_url: 'https://site.com/obra' }))).toBe('https://site.com/obra');
    });

    test('sem link, cai na página do site', () => {
        const userSite = { id: 1, name: 'Toon', url: 'https://toonlivre.net', is_favorite: false };
        expect(readingUrl(item({ user_site: userSite }))).toBe('https://toonlivre.net');
        expect(readingUrl(item({ site: { id: 2, name: 'Tia', url: 'https://tiamanhwa.com' } }))).toBe('https://tiamanhwa.com');
        expect(readingUrl(item({ chapter_url: '  ' }))).toBeNull();
    });
});
