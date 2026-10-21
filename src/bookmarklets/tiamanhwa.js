/* eslint-env browser */
// Bookmarklet "Sincronizar TiaManhwa" — roda em tiamanhwa.com (o site bloqueia o
// servidor). Importado como texto em ProfilePage.vue (?raw), que troca
// '__API_BASE__' e '__TOKEN__', tira as linhas de comentário e gera o
// javascript: URL. Não use template literals de várias linhas nem comentário no
// fim de linha: cada linha é aparada antes de virar URL.
//
// Passos (ver back/docs/manhwas.md, seção TiaManhwa):
//  1. GET /user/sync-chapters/candidates → obras sem vínculo e IDs já vinculados;
//  2. listagem /manhwa/page/N/?m_orderby=latest → ID, título PT e último capítulo
//     de todo o catálogo do site;
//  3. histórico e favoritos da conta (/user-settings/?tab=history|bookmark);
//  4. busca do site (wp-manga-search-manga) pelas obras sem vínculo e página de
//     cada resultado → "Outros Títulos" e ano, que o back usa para vincular;
//  5. POST /user/sync-chapters com site = tiamanhwa e mostra o resumo.
(async () => {
    const API = '__API_BASE__';
    const TOKEN = '__TOKEN__';
    const STORE = 'neonCurator.tiaSearched';
    const SEARCH_TTL = 7 * 24 * 3600 * 1000;
    const MAX_DETAILS = 60;

    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;z-index:2147483647;right:16px;bottom:16px;max-width:340px;padding:12px 14px;border-radius:10px;background:#111;color:#f5a623;font:13px/1.4 system-ui,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.5)';
    // Etapa atual: entra na mensagem de erro para saber onde parou.
    let step = 'início';
    const status = (t) => { step = t; box.textContent = 'Neon Curator: ' + t; };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const parser = new DOMParser();

    const api = async (path, opts) => {
        const r = await fetch(API + path, Object.assign({ headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + TOKEN } }, opts || {}));
        const j = await r.json().catch(() => null);
        if (r.status === 401) throw new Error('este favorito guarda um login que não vale mais. No app, abra o Perfil, copie o bookmarklet do TiaManhwa de novo e troque o favorito antigo por ele.');
        if (!r.ok || !j || j.success === false) throw new Error((j && j.message) || 'API respondeu ' + r.status);
        return j.data;
    };

    const getDoc = async (url) => {
        const r = await fetch(url, { credentials: 'include' });
        if (!r.ok) return null;
        const html = await r.text();
        return { doc: parser.parseFromString(html, 'text/html'), html: html, url: r.url };
    };

    const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’‘`´]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const keys = (s) => { const k = norm(s); return [k, k.replace(/^(the|a|an|o|os|as) /, '')].filter((x) => x.length >= 3); };
    const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

    // /manhwa/{slug}/ (obra) ou /manhwa/{slug}/{capitulo}/
    const ref = (href) => {
        try {
            const p = new URL(href, location.origin).pathname.split('/').filter(Boolean);
            return p[0] === 'manhwa' && p[1] && p[1] !== 'page' ? { slug: p[1], chapter: p[2] || null } : null;
        } catch (e) {
            return null;
        }
    };

    // "Capítulo 100.5" → "100.5"; sem número no texto, usa o slug (capitulo-100-5).
    const chapterOf = (a) => {
        const m = text(a).match(/(\d+(?:[.,]\d+)?)/);
        if (m) return m[1].replace(',', '.');
        const r = ref(a.getAttribute('href'));
        const s = r && r.chapter && r.chapter.match(/(\d+)(?:-(\d+))?/);
        return s ? s[1] + (s[2] ? '.' + s[2] : '') : null;
    };

    try {
        if (!/(^|\.)tiamanhwa\.com$/.test(location.hostname)) {
            alert('Abra tiamanhwa.com e clique no favorito de novo.');
            return;
        }
        document.body.appendChild(box);

        status('carregando sua biblioteca...');
        const cand = await api('/user/sync-chapters/candidates?site=tiamanhwa');
        const linked = new Set((cand.linked || []).map(String));

        // 2. Listagem completa, 3 páginas por vez.
        const feed = new Map();
        const slugToId = new Map();
        let done = false;
        for (let page = 1; page <= 60 && !done; page += 3) {
            status('lendo lançamentos, página ' + page + '...');
            const batch = await Promise.all([page, page + 1, page + 2].map((p) => getDoc(location.origin + '/manhwa/' + (p > 1 ? 'page/' + p + '/' : '') + '?m_orderby=latest')));
            for (const res of batch) {
                const cards = res ? res.doc.querySelectorAll('.page-item-detail') : [];
                if (!cards.length) {
                    done = true;
                    continue;
                }
                cards.forEach((card) => {
                    const idEl = card.querySelector('[data-post-id]');
                    const a = card.querySelector('.post-title a');
                    const r = a && ref(a.getAttribute('href'));
                    if (!idEl || !r) return;
                    const id = idEl.getAttribute('data-post-id');
                    slugToId.set(r.slug, id);
                    const ch = card.querySelector('.chapter-item .chapter a');
                    const chapter = ch ? chapterOf(ch) : null;
                    if (chapter && !feed.has(id)) feed.set(id, { id: id, title: text(a), chapter: chapter });
                });
            }
        }

        // 3. Histórico e favoritos (só com login no site).
        let loggedIn = true;
        const settingsDocs = async (tab) => {
            const docs = [];
            let url = location.origin + '/user-settings/?tab=' + tab;
            for (let i = 0; i < 10 && url; i++) {
                const res = await getDoc(url);
                if (!res || res.url.indexOf('user-settings') < 0) {
                    if (i === 0) loggedIn = false;
                    break;
                }
                docs.push(res.doc);
                const next = res.doc.querySelector('.wp-pagenavi a.nextpostslink, a.next.page-numbers, .pagination a.next');
                const href = next && next.getAttribute('href');
                url = href ? new URL(href, location.origin).href : null;
            }
            return docs;
        };

        // Item do histórico/favorito: o bloco mais próximo que tenha link para a obra.
        const itemOf = (el) => {
            let n = el;
            for (let i = 0; i < 6 && n; i++, n = n.parentElement) {
                if (n.querySelector && n.querySelector('a[href*="/manhwa/"]')) return n;
            }
            return null;
        };
        const parseItem = (node, idHint) => {
            let slug = null;
            let title = '';
            let chapterLink = null;
            node.querySelectorAll('a[href*="/manhwa/"]').forEach((a) => {
                const r = ref(a.getAttribute('href'));
                if (!r) return;
                if (r.chapter) {
                    if (!chapterLink) chapterLink = a;
                    if (!slug) slug = r.slug;
                } else {
                    slug = slug || r.slug;
                    if (!title) title = text(a);
                }
            });
            if (!slug) return null;
            if (!title) {
                const img = node.querySelector('img[alt]');
                title = img ? img.getAttribute('alt').trim() : '';
            }
            const id = slugToId.get(slug) || (/^\d+$/.test(idHint || '') ? idHint : null);
            return id && title ? { id: id, slug: slug, title: title, chapterLink: chapterLink } : null;
        };

        const reading = new Map();
        status('lendo seu histórico...');
        for (const doc of await settingsDocs('history')) {
            const seen = new Set();
            doc.querySelectorAll('.history-content, .remove-manga-history[data-manga]').forEach((el) => {
                const node = el.classList.contains('history-content') ? el : itemOf(el);
                if (!node || seen.has(node)) return;
                seen.add(node);
                const btn = node.querySelector('[data-manga]') || (el.getAttribute('data-manga') ? el : null);
                const it = parseItem(node, btn && btn.getAttribute('data-manga'));
                if (it && !reading.has(it.id)) {
                    reading.set(it.id, { id: it.id, slug: it.slug, title: it.title, lastRead: it.chapterLink ? chapterOf(it.chapterLink) : null, listStatus: null });
                }
            });
        }
        let bookmarks = 0;
        if (loggedIn) {
            status('lendo seus favoritos...');
            for (const doc of await settingsDocs('bookmark')) {
                const seen = new Set();
                doc.querySelectorAll('.bookmark-checkbox, table.list-bookmark tr').forEach((el) => {
                    const node = el.tagName === 'TR' ? el : (el.closest('tr') || itemOf(el));
                    if (!node || seen.has(node)) return;
                    seen.add(node);
                    const cb = node.querySelector('.bookmark-checkbox');
                    const it = parseItem(node, cb && cb.value);
                    if (!it) return;
                    bookmarks++;
                    if (!reading.has(it.id)) {
                        reading.set(it.id, { id: it.id, slug: it.slug, title: it.title, lastRead: null, listStatus: 'plan_to_read' });
                    }
                });
            }
        }

        // Página da obra: "Outros Títulos", ano, tipo, status, capa e último capítulo.
        const details = new Map();
        const workDetails = async (slug) => {
            if (details.has(slug)) return details.get(slug);
            const res = await getDoc(location.origin + '/manhwa/' + slug + '/');
            let d = null;
            if (res) {
                const doc = res.doc;
                const info = {};
                doc.querySelectorAll('.post-content_item').forEach((it) => {
                    const h = it.querySelector('.summary-heading');
                    const v = it.querySelector('.summary-content');
                    if (h && v) info[norm(h.textContent)] = text(v);
                });
                const pick = (re) => {
                    const k = Object.keys(info).find((x) => re.test(x));
                    return k ? info[k] : null;
                };
                const h1 = doc.querySelector('.post-title h1');
                if (h1) h1.querySelectorAll('.manga-title-badges').forEach((b) => b.remove());
                const btn = doc.querySelector('.wp-manga-action-button[data-post]');
                const m = res.html.match(/"manga_id":"(\d+)"/);
                const id = slugToId.get(slug) || (btn && btn.getAttribute('data-post')) || (m && m[1]);
                // "Outros Títulos" é texto livre separado por vírgula; títulos com vírgula
                // ("Eat First, Mom") voltam juntando o pedaço curto ao anterior.
                const parts = (pick(/^(outros|alternativ)/) || '').split(/\s*[,;/]\s*/).filter(Boolean);
                const alts = parts.filter((p) => p.length >= 4);
                for (let i = 0; i + 1 < parts.length; i++) {
                    if (parts[i + 1].length < 4) alts.push(parts[i] + ', ' + parts[i + 1]);
                }
                const year = (pick(/^(lancamento|release|ano)/) || '').match(/\b(19|20)\d{2}\b/);
                const img = doc.querySelector('.summary_image img');
                const cover = img && (img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('src'));
                const ch = doc.querySelector('li.wp-manga-chapter a');
                if (id && h1) {
                    d = {
                        id: String(id),
                        title: text(h1),
                        alts: alts,
                        year: year ? year[0] : null,
                        type: pick(/^(tipo|type)/),
                        status: pick(/^status/),
                        cover: cover && cover.indexOf('https://') === 0 ? cover : null,
                        chapter: (ch && chapterOf(ch)) || ((feed.get(String(id)) || {}).chapter) || null,
                    };
                }
            }
            details.set(slug, d);
            return d;
        };

        // 4. Busca as obras sem vínculo (as não achadas esperam 7 dias para tentar de novo).
        let searched = {};
        try {
            searched = JSON.parse(localStorage.getItem(STORE) || '{}') || {};
        } catch (e) {
            searched = {};
        }
        // [] = o site respondeu "nada encontrado"; null = erro (limite de requisições,
        // Cloudflare...): espera e tenta de novo uma vez.
        const search = async (q) => {
            for (let attempt = 0; attempt < 2; attempt++) {
                if (attempt) await sleep(3000);
                const r = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', credentials: 'include', body: new URLSearchParams({ action: 'wp-manga-search-manga', title: q }) }).catch(() => null);
                const j = r && r.ok ? await r.json().catch(() => null) : null;
                if (j && typeof j.success === 'boolean') {
                    return j.success && Array.isArray(j.data) ? j.data.filter((x) => x && x.url) : [];
                }
            }
            return null;
        };
        const pending = (cand.unlinked || []).filter((c) => !(searched[c.id] > Date.now() - SEARCH_TTL));
        pending.sort((a, b) => (b.adult ? 1 : 0) - (a.adult ? 1 : 0));
        let found = 0;
        let searchErrors = 0;
        for (let i = 0; i < pending.length; i++) {
            const c = pending[i];
            status('procurando no site ' + (i + 1) + '/' + pending.length + ': ' + c.title);
            const ours = new Set([].concat(...c.names.map(keys)));
            let hit = false;
            let failed = false;
            // Obras +18 tentam até 4 nomes; as demais (raras no site), só o principal.
            for (const q of c.names.slice(0, c.adult ? 4 : 1)) {
                const results = await search(q);
                await sleep(250);
                if (results === null) {
                    failed = true;
                    continue;
                }
                for (const res of results.slice(0, 3)) {
                    const r = ref(res.url);
                    if (!r || linked.has(slugToId.get(r.slug))) continue;
                    const d = await workDetails(r.slug);
                    if (d && [d.title].concat(d.alts).some((t) => keys(t).some((k) => ours.has(k)))) hit = true;
                }
                if (hit) break;
            }
            if (hit) found++;
            // Busca que falhou não conta: a obra é procurada de novo no próximo clique.
            if (hit || !failed) searched[c.id] = Date.now();
            else searchErrors++;
        }

        // Histórico/favoritos de obras sem vínculo precisam dos títulos da página.
        let skipped = 0;
        let fetched = 0;
        for (const r of reading.values()) {
            if (linked.has(r.id) || details.has(r.slug)) continue;
            if (fetched >= MAX_DETAILS) {
                skipped++;
                continue;
            }
            fetched++;
            status('lendo obras do histórico (' + fetched + ')...');
            await workDetails(r.slug);
        }

        // 5. Envia.
        const releases = [];
        feed.forEach((f) => releases.push({ id: f.id, title: f.title, chapter: f.chapter }));
        details.forEach((d) => {
            if (d && d.chapter) releases.push({ id: d.id, title: d.title, alternativeTitles: d.alts, releaseYear: d.year, chapter: d.chapter });
        });
        const readingOut = [];
        reading.forEach((r) => {
            const d = details.get(r.slug);
            if (!d && !linked.has(r.id)) return;
            readingOut.push({
                id: r.id,
                title: (d && d.title) || r.title,
                alternativeTitles: d ? d.alts : [],
                releaseYear: d ? d.year : null,
                type: d ? d.type : null,
                status: d ? d.status : null,
                cover: d ? d.cover : null,
                lastRead: r.lastRead,
                available: (feed.get(r.id) || {}).chapter || (d && d.chapter) || null,
                readAt: null,
                listStatus: r.listStatus,
            });
        });
        if (!releases.length && !readingOut.length) {
            alert('Nenhum lançamento lido do TiaManhwa. O site mudou o layout?');
            return;
        }

        status('enviando...');
        const dt = await api('/user/sync-chapters', { method: 'POST', body: JSON.stringify({ site: 'tiamanhwa', releases: releases, reading: readingOut }) });
        // Só depois do envio: se a API falhar, a busca é refeita no próximo clique.
        try {
            localStorage.setItem(STORE, JSON.stringify(searched));
        } catch (e) {
            // sem localStorage: só busca de novo no próximo clique
        }

        const nc = dt.new_chapters || [];
        const total = dt.total_linked || 0;
        let msg = total + ' obra(s) vinculadas ao TiaManhwa.\n' + nc.length + ' com capítulo novo, ' + Math.max(total - nc.length, 0) + ' em dia.';
        if (nc.length) msg += '\n' + nc.slice(0, 12).map((n) => '• ' + n.title + ': ' + n.current + ' → ' + n.available).join('\n') + (nc.length > 12 ? '\n• ...' : '');
        msg += '\n\n(' + feed.size + ' obras lidas do site, ' + (dt.linked || 0) + ' nova(s) vinculação(ões); ' + pending.length + ' obra(s) da biblioteca procuradas, ' + found + ' achada(s).)';
        if (searchErrors) msg += '\nA busca do site falhou para ' + searchErrors + ' obra(s); elas são procuradas de novo no próximo clique.';
        const al = dt.auto_linked || [];
        const am = dt.ambiguous || [];
        if (al.length) msg += '\n\nVinculadas por semelhança, confira (' + al.length + '): ' + al.map((a) => a.title + ' = ' + a.site_title).join('; ');
        if (am.length) msg += '\n\nAmbíguas, ajuste o título no site (' + am.length + '): ' + am.map((a) => a.title).join(', ');
        if (loggedIn) {
            msg += '\n\nHistórico/favoritos: ' + reading.size + ' obra(s) (' + bookmarks + ' favorito(s)), ' + (dt.progressed || 0) + ' com progresso atualizado.';
            if (skipped) msg += ' ' + skipped + ' ficam para o próximo clique.';
        } else {
            msg += '\n\nSem login no TiaManhwa: histórico e favoritos não foram lidos.';
        }
        const ad = dt.added || [];
        const im = dt.importing || [];
        const li = dt.last_import;
        if (ad.length) msg += '\nAdicionadas à biblioteca (' + ad.length + '): ' + ad.map((a) => a.title).join(', ');
        if (im.length) msg += '\nImportando em segundo plano (' + im.length + '), pode fechar a aba: ' + im.join(', ');
        if (li && li.status === 'done' && li.results) {
            const fl = li.results.filter((r) => r.via === 'failed');
            msg += '\n\nÚltima importação: ' + (li.results.length - fl.length) + ' importada(s)' + (fl.length ? ', ' + fl.length + ' falharam (tenta de novo no próximo sync): ' + fl.map((r) => r.title).join(', ') : '') + '.';
        }
        alert(msg);
    } catch (e) {
        alert('Erro (etapa: ' + step + '): ' + (e && e.message));
    } finally {
        box.remove();
    }
})();
