# Leitor de novels

Abra Swordmaster's Youngest Son na biblioteca e toque em **Ler cap. 401** (ou no próximo capítulo do histórico). **Abrir leitor** nos detalhes retoma a posição salva neste dispositivo ou permite selecionar qualquer capítulo entre 401 e 1147. Marque **Concluí o capítulo** ao terminar: navegar não altera capítulos concluídos. A posição fica separada por usuário e obra; o histórico continua no backend.

Fonte entre 16 e 32 px, tema claro/escuro e navegação anterior/próximo. Preferências ficam neste dispositivo. Texto inglês recuperado dos DOCX anteriores às sugestões de edição. Comentários e sugestões não entram na narrativa; não há revisão editorial integral.

## Tradução no celular

Toque em **Traduzir no navegador**. A página abre em aba externa, sem novo login, com link assinado válido por 12 horas. No Chrome: menu → Traduzir → Português. Ao voltar ao aplicativo, selecione o último capítulo lido e marque a conclusão para registrar o histórico. A tradução é do navegador, não uma API integrada. Quem receber o link pode ler até expirar; evite compartilhá-lo.

## Arquitetura

- Rota autenticada `/reader/:id/:chapter?`, fora das abas.
- `novelReaderService.ts`: `GET /api/contents/{id}/reader` e `GET /api/contents/{id}/reader/{chapter}`.
- `Content.reader` vem do backend, com faixa de capítulos e edição, sem IDs fixos de produção no frontend.
- `readingUrl()` prefere o leitor interno para capítulos disponíveis. Links externos continuam funcionando fora da faixa.
- `NovelReaderPage.vue` coordena carregamento, navegação, posição e progresso; `ReaderToolbar.vue` apresenta controles com props/eventos tipados.
- Parágrafos por interpolação Vue, sem HTML do documento.
- `vercel.json` encaminha rotas da SPA ao index, corrigindo 404 em links diretos e recargas.

## Validação e entrega

Build TypeScript/Vite e 14 testes aprovados, cobrindo links, seleção, retomada, fonte, texto escapado, erros e preservação do progresso mais recente. Lint de arquivos novos/serviços aprovado. O lint geral já falha em telas preexistentes, `dev-dist` e pasta de outro projeto.

Publicar backend antes do frontend, sem migration. Executados `npx cap sync android` e `gradlew assembleDebug`. APK: `android/app/build/outputs/apk/debug/app-debug.apk`. O aplicativo instalado precisa ser atualizado para receber a tela. Não testado em aparelho físico.
