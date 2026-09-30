import { reactive } from 'vue';

/**
 * Mudanças na biblioteca feitas nesta sessão (adicionar/remover), para telas
 * que guardam listas em memória (Discover) se atualizarem ao voltar, sem
 * depender de recarregar tudo.
 */
export const libraryStore = reactive({
    /** content_id → está na biblioteca */
    changes: {} as Record<number, boolean>,
    /** incrementa a cada mudança; telas comparam com o último valor visto */
    version: 0,

    mark(contentId: number, inLibrary: boolean) {
        this.changes[contentId] = inLibrary;
        this.version++;
    },
});
