import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NovelReaderPage from '../../src/views/NovelReaderPage.vue';
import { novelReaderService } from '../../src/services/novelReaderService';
import { userContentService } from '../../src/services/userContentService';

vi.mock('../../src/services/novelReaderService', async () => ({
    ...await vi.importActual<typeof import('../../src/services/novelReaderService')>('../../src/services/novelReaderService'),
    novelReaderService: { index: vi.fn(), chapter: vi.fn() },
}));
vi.mock('../../src/services/userContentService', () => ({
    userContentService: { getAll: vi.fn(), getOne: vi.fn(), update: vi.fn(), create: vi.fn() },
}));

const index = { slug: 'novel', title: 'Novel', language: 'en', edition: 'original', first_chapter: 401, last_chapter: 403, chapters: [401, 402, 403] };
const chapter = { number: 401, title: 'Chapter 401', language: 'en', edition: 'original', paragraphs: ['First paragraph.', '<script>alert(1)</script>'], source_url: 'https://docs.google.com/document/d/test/edit', browser_url: 'https://reader.example/read/401?signature=test' };
const libraryItem = { id: 20, content_id: 10, current_units: 400, status: 'reading' as const, content: { id: 10, name: 'Novel', type: 'novel' as const } };
const ScrollContent = defineComponent({
    template: '<div><slot /></div>',
    mounted() {
        Object.assign(this.$el, { getScrollElement: async () => this.$el, scrollToPoint: async () => undefined });
    },
});

async function open(path = '/reader/10/401') {
    const router = createRouter({ history: createMemoryHistory(), routes: [
        { path: '/reader/:id/:chapter?', name: 'novel-reader', component: NovelReaderPage },
        { path: '/content/:id', component: { template: '<div />' } },
    ] });
    await router.push(path);
    await router.isReady();
    const wrapper = mount(NovelReaderPage, { global: { plugins: [router], stubs: { IonPage: { template: '<div><slot /></div>' }, IonContent: ScrollContent, IonSpinner: true } } });
    await flushPromises();
    return { wrapper, router };
}

beforeEach(() => {
    vi.clearAllMocks(); localStorage.clear();
    localStorage.setItem('auth_user', JSON.stringify({ id: 1 }));
    vi.mocked(novelReaderService.index).mockResolvedValue(index);
    vi.mocked(novelReaderService.chapter).mockImplementation(async (_id, number) => ({ ...chapter, number }));
    vi.mocked(userContentService.getAll).mockResolvedValue([libraryItem]);
    vi.mocked(userContentService.getOne).mockResolvedValue(libraryItem);
});

describe('NovelReaderPage', () => {
    it('renders escaped paragraphs and changes chapter without updating history', async () => {
        const { wrapper, router } = await open();
        expect(wrapper.findAll('article p')).toHaveLength(2);
        expect(wrapper.find('article script').exists()).toBe(false);
        expect(wrapper.find('article').text()).toContain('<script>alert(1)</script>');
        expect(wrapper.find('a[target="_blank"]').attributes('href')).toBe(chapter.browser_url);
        await wrapper.find('select').setValue('402'); await flushPromises();
        expect(router.currentRoute.value.path).toBe('/reader/10/402');
        expect(wrapper.find('.chapter-title strong').text()).toBe('402');
        expect(userContentService.update).not.toHaveBeenCalled();
        wrapper.unmount();
    });
    it('resumes a saved chapter and persists reading settings', async () => {
        localStorage.setItem('novel-position:1:10', JSON.stringify({ chapter: 402, ratio: 0.3 }));
        const { wrapper, router } = await open('/reader/10');
        expect(router.currentRoute.value.path).toBe('/reader/10/402');
        await wrapper.find('[aria-label="Aumentar fonte"]').trigger('click');
        expect(wrapper.find('article').attributes('style')).toContain('22px');
        expect(JSON.parse(localStorage.getItem('novel-reader-settings') || '{}').fontSize).toBe(22);
        wrapper.unmount();
    });
    it('does not lower newer progress when a chapter is marked complete', async () => {
        vi.mocked(userContentService.getOne).mockResolvedValue({ ...libraryItem, current_units: 450 });
        vi.mocked(userContentService.update).mockResolvedValue({ ...libraryItem, current_units: 450 });
        const { wrapper } = await open();
        await wrapper.find('.complete-button').trigger('click'); await flushPromises();
        expect(userContentService.update).toHaveBeenCalledWith(20, { current_units: 450 });
        expect(wrapper.text()).toContain('Histórico salvo até o capítulo 450.');
        wrapper.unmount();
    });
    it('shows a retry state when a chapter cannot be loaded', async () => {
        vi.mocked(novelReaderService.chapter).mockRejectedValue(new Error('Unavailable'));
        const { wrapper } = await open();
        expect(wrapper.find('[role="alert"]').text()).toContain('Unavailable');
        expect(wrapper.find('article').exists()).toBe(false);
        wrapper.unmount();
    });
});
