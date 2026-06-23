# DESIGN_SYSTEM.md — Neon Curator
> Referência máxima de design: **ToonLivre** (https://toonlivre.net)  
> Este arquivo é a fonte da verdade para qualquer decisão visual no frontend.  
> Toda nova tela, componente ou alteração deve ser validada contra ele antes de implementar.

---

## 1. Filosofia de Design

O ToonLivre estabelece a estética de referência: **dark-first, content-led, sem frescura**.

- O conteúdo (capas) é o design. A UI existe para servir a imagem, nunca competir com ela.
- Fundo escuro profundo (quase preto) deixa as capas coloridas respirarem.
- Tipografia limpa, hierarquia clara: título em destaque colorido, metadados em cinza discreto.
- Zero decoração gratuita — sem gradientes ornamentais, sem shadows exagerados, sem animações sem propósito.
- Densidade informacional média: 6 cards por linha no desktop, capas grandes, 3 linhas de capítulos abaixo de cada card.

---

## 2. Paleta de Cores

### Cores base (dark mode — padrão do app)

| Token              | Hex       | Uso                                                  |
|--------------------|-----------|------------------------------------------------------|
| `--bg-primary`     | `#0f0f0f` | Fundo da página (quase preto, não puro)              |
| `--bg-secondary`   | `#1a1a1a` | Cards, modais, painéis elevados                      |
| `--bg-tertiary`    | `#242424` | Hover de cards, inputs, badges de fundo              |
| `--bg-navbar`      | `#111111` | Barra de navegação (ligeiramente mais escura)        |
| `--border-default` | `#2a2a2a` | Bordas sutis, separadores                            |
| `--border-hover`   | `#3a3a3a` | Bordas em hover                                      |

### Cores de texto

| Token                | Hex       | Uso                                          |
|----------------------|-----------|----------------------------------------------|
| `--text-primary`     | `#f0f0f0` | Títulos, conteúdo principal                  |
| `--text-secondary`   | `#a0a0a0` | Metadados, subtítulos, labels                |
| `--text-muted`       | `#606060` | Timestamps, informações terciárias           |
| `--text-title-card`  | `#f5a623` | Títulos de cards (laranja/âmbar vibrante)    |

### Cores de acento e semântica

| Token              | Hex       | Uso                                                  |
|--------------------|-----------|------------------------------------------------------|
| `--accent-primary` | `#f5a623` | Cor principal de destaque (laranja/âmbar — igual título de cards) |
| `--accent-fire`    | `#ff6b35` | Ícone de "lançamentos" (chama), CTAs quentes         |
| `--dot-new`        | `#4ade80` | Ponto indicador de conteúdo recente/novo (verde)     |
| `--dot-old`        | `#3a3a3a` | Ponto indicador de conteúdo antigo (cinza)           |
| `--badge-bg`       | `rgba(0,0,0,0.65)` | Fundo de badges sobre imagem (ex: "MANHWA") |
| `--badge-text`     | `#ffffff` | Texto de badges sobre imagem                         |

### Cores de tipo de conteúdo (badges)
Todos usam fundo `rgba(0,0,0,0.65)` + texto branco. A diferenciação é feita só pelo texto, não pela cor do badge.

---

## 3. Tipografia

### Fonte
- **Principal**: sistema sans-serif nativo — `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Não usar fontes decorativas. Clareza acima de tudo.

### Escala de tamanhos

| Uso                         | Tamanho  | Peso   | Cor                    |
|-----------------------------|----------|--------|------------------------|
| Título de seção (Lançamentos) | `1.2rem` | `600`  | `--text-primary`       |
| Ícone de seção (🔥)          | `1rem`   | —      | `--accent-fire`        |
| Título de card (truncado)   | `0.85rem`| `500`  | `--text-title-card` (laranja) |
| Linha de capítulo — número  | `0.8rem` | `400`  | `--text-secondary`     |
| Linha de capítulo — tempo   | `0.75rem`| `400`  | `--text-muted`         |
| Badge de tipo (MANHWA)      | `0.65rem`| `600`  | `--badge-text`         |
| Label de navegação          | `0.9rem` | `400`  | `--text-secondary`     |

### Regras de texto
- Títulos de cards: sempre truncados com `text-overflow: ellipsis` em uma linha
- Nunca quebrar título de card em múltiplas linhas
- Capítulos: máximo 3 linhas visíveis por card, o resto escondido

---

## 4. Layout e Grid

### Desktop (≥ 1024px)
- **Grid de cards**: 6 colunas, `gap: 16px`
- Container máximo: `1440px`, centralizado, padding lateral `24px`
- Navbar: altura `56px`, fixa no topo, `z-index: 100`
- Seção title (ex: "Lançamentos"): `margin-bottom: 16px`, alinhado à esquerda

### Tablet (768px – 1023px)
- Grid de cards: 4 colunas
- Container padding lateral: `16px`

### Mobile (< 768px)
- Grid de cards: 2 colunas
- Container padding lateral: `12px`
- Navbar: simplificada (só ícones essenciais)

### Proporção dos cards
- **Capa (imagem)**: proporção `2:3` (portrait) — `aspect-ratio: 2/3`
- Imagem: `object-fit: cover`, `border-radius: 8px`
- Card total: sem border explícita, fundo `--bg-secondary`
- Espaço abaixo da capa (metadados): padding `8px 0`

---

## 5. Componentes

### 5.1 ContentCard (card de conteúdo)

**Estrutura visual:**
```
┌──────────────────┐
│  [BADGE TIPO]  ♡ │  ← badge no topo esquerdo, favorito no topo direito
│                  │
│   CAPA (2:3)     │
│                  │
└──────────────────┘
 Título do Conteúdo...    ← laranja, truncado, 1 linha
 ● Cap. 17      Há 21 min ← dot verde + número + tempo relativo
 ● Cap. 16      Há 21 min
 ● Cap. 15      Há 21 min
```

**Regras:**
- Badge de tipo: `position: absolute`, `top: 8px`, `left: 8px`
  - Padding: `2px 6px`, `border-radius: 3px`, fundo `rgba(0,0,0,0.65)`
  - Texto: `0.65rem`, `font-weight: 600`, `letter-spacing: 0.5px`, UPPERCASE
- Ícone de favorito: `position: absolute`, `top: 8px`, `right: 8px`
  - Tamanho `18px`, cor branca com opacidade 70%, sólido quando ativo
- Dot indicador de capítulo:
  - Verde (`--dot-new`) se publicado há menos de 24h
  - Cinza (`--dot-old`) se mais antigo
  - Tamanho: `6px`, `border-radius: 50%`, inline com texto
- Hover no card: leve scale `1.02` na imagem, `transition: 0.2s ease`
- Cursor: `pointer` no card inteiro

### 5.2 Navbar

**Estrutura:**
```
[Logo]                    [🔍] [☀️/🌙] [🔔] [👤]
```

**Regras:**
- Fundo: `--bg-navbar` (`#111111`)
- Borda inferior: `1px solid --border-default`
- Logo: texto + ícone de livro, `font-weight: 700`, cor branca
- Ícones da direita: `24px`, cor `--text-secondary`, hover `--text-primary`
- Toggle de tema: presente (☀️/🌙)
- Notificações: sino com badge opcional
- Posição: `position: fixed`, `top: 0`, `width: 100%`

### 5.3 Section Header (cabeçalho de seção)

**Estrutura:**
```
🔥 Lançamentos                              [⊞] [≡]
```

**Regras:**
- Ícone: emoji ou SVG de chama, cor `--accent-fire`
- Título: `1.2rem`, `font-weight: 600`, `--text-primary`
- Toggle de visualização (grid/lista): botões no canto direito
  - Tamanho: `32px × 32px`, `border-radius: 6px`
  - Ativo: fundo `--bg-tertiary`, borda `--border-hover`
  - Inativo: transparente
- Separador: linha `1px solid --border-default` abaixo ou `margin-bottom: 20px`

### 5.4 Badges de tipo

Texto em UPPERCASE, sem cor específica por tipo — todos usam o mesmo estilo:
- `MANHWA`, `MANHUA`, `MANGA`, `WEBTOON`, `ANIME`, `NOVEL`
- Fundo: `rgba(0,0,0,0.65)` sobre a imagem
- Texto: branco, `0.65rem`, bold

### 5.5 Indicador de progresso de capítulo/episódio

```
● Cap. 17      Há 21 min.
```
- Dot: `6px`, cor verde se recente, cinza se antigo
- Número: `--text-secondary`, `0.8rem`
- Tempo: `--text-muted`, `0.75rem`, alinhado à direita (flex: space-between)
- Altura de linha: `24px` por item
- Máximo 3 itens visíveis

---

## 6. Interações e Animações

### Princípios
- Animações sutis e rápidas — nunca mais de `300ms`
- Só animar o que tem propósito funcional
- `prefers-reduced-motion` deve ser respeitado

### Transições definidas

| Interação               | Propriedade          | Duração  | Easing        |
|-------------------------|----------------------|----------|---------------|
| Hover em card           | `transform: scale`   | `200ms`  | `ease`        |
| Hover em botão          | `background-color`   | `150ms`  | `ease`        |
| Hover em link nav       | `color`              | `150ms`  | `ease`        |
| Abertura de modal       | `opacity + transform`| `250ms`  | `ease-out`    |
| Toggle de tema          | `background + color` | `200ms`  | `ease`        |
| Loading skeleton        | `opacity`            | `1s`     | `ease-in-out` (loop) |

### Hover no card de conteúdo
```css
.content-card:hover .card-image {
  transform: scale(1.03);
  transition: transform 200ms ease;
}
```

---

## 7. Iconografia

- Usar **Ionic Icons** (já disponível no projeto via Ionic Framework)
- Tamanho padrão inline: `20px`
- Tamanho em navbar: `24px`
- Tamanho em badges/labels: `16px`
- Cor: herdar do contexto (`currentColor`) — nunca hardcodar cor em ícone
- Preferir versão `outline` para estado normal, `solid/filled` para estado ativo

### Ícones-chave do projeto

| Ação/contexto       | Ionic Icon               |
|---------------------|--------------------------|
| Buscar              | `search-outline`         |
| Toggle tema         | `sunny-outline` / `moon-outline` |
| Notificações        | `notifications-outline`  |
| Perfil/usuário      | `person-outline`         |
| Favorito (inativo)  | `heart-outline`          |
| Favorito (ativo)    | `heart`                  |
| Ver em grid         | `grid-outline`           |
| Ver em lista        | `list-outline`           |
| Lançamentos         | `flame-outline`          |
| Configurações       | `settings-outline`       |
| Fechar/voltar       | `close-outline` / `arrow-back-outline` |

---

## 8. Estados de UI

### Loading / Skeleton
- Usar skeleton com fundo `--bg-tertiary` e animação de pulse suave
- Cards em loading: manter proporção `2:3` da capa
- Nunca mostrar spinner giratório no lugar de cards — sempre skeleton

### Estado vazio
- Ícone grande centralizado + texto explicativo breve
- Cor: `--text-muted`
- Nunca mensagem genérica "Nenhum resultado" — ser específico

### Erro
- Toast/snackbar na parte inferior da tela
- Fundo: vermelho escuro `#3d1515`, borda `#e74c3c`, texto branco
- Duração: `4000ms` antes de desaparecer
- Não bloquear o conteúdo com erro — mostrar o que tiver e informar o que falhou

### Conteúdo adulto (+18)
- Card exibe overlay com blur e ícone de cadeado enquanto não confirmado
- Badge `+18` em vermelho sobre o card
- Ao habilitar nas configurações, o blur some com transição suave

---

## 9. Modo Claro (Light Mode)

O app é **dark-first**. O modo claro existe mas é secundário.

| Token dark         | Token light equivalente |
|--------------------|-------------------------|
| `--bg-primary: #0f0f0f`   | `#f5f5f5`       |
| `--bg-secondary: #1a1a1a` | `#ffffff`       |
| `--bg-tertiary: #242424`  | `#ebebeb`       |
| `--bg-navbar: #111111`    | `#ffffff`       |
| `--text-primary: #f0f0f0` | `#111111`       |
| `--text-secondary: #a0a0a0`| `#555555`      |
| `--text-muted: #606060`   | `#888888`       |
| `--border-default: #2a2a2a`| `#e0e0e0`      |
| `--accent-primary: #f5a623`| `#e6920a` (ligeiramente mais escuro para contraste) |

---

## 10. Decisões de Design que NÃO fazer

Estes padrões existem em outros projetos mas contradizem a referência ToonLivre:

| ❌ Evitar                                      | ✅ Fazer no lugar                         |
|------------------------------------------------|-------------------------------------------|
| Cards com bordas coloridas por tipo            | Badge de tipo sobre a imagem              |
| Gradiente decorativo no fundo da página        | Fundo sólido escuro (`#0f0f0f`)           |
| Título de card em branco                       | Título de card em laranja (`#f5a623`)     |
| Capa quadrada (1:1)                            | Capa portrait (2:3)                       |
| Spinner de loading no lugar de card            | Skeleton com proporção correta            |
| Modal full-screen para detalhes                | Página dedicada de detalhe                |
| Botões com bordas arredondadas exageradas (pill)| Border-radius moderado: `6–8px`          |
| Sombras exageradas / drop shadows pesados      | Bordas sutis ou elevação sem sombra       |
| Texto em CAPS em títulos de seção              | Sentence case nos títulos de seção        |
| Cores diferentes por tipo de conteúdo no badge | Todos os badges com mesmo estilo visual   |

---

## 11. Checklist antes de implementar qualquer tela nova

Antes de codar qualquer componente ou tela nova, verificar:

- [ ] O fundo da página é `--bg-primary` (`#0f0f0f`)?
- [ ] Cards usam proporção `2:3` para capas?
- [ ] Títulos de cards estão em laranja (`--text-title-card`)?
- [ ] Badges de tipo estão no canto superior esquerdo da imagem?
- [ ] Metadados (capítulos, datas) usam `--text-secondary` e `--text-muted`?
- [ ] Hover nos cards tem `scale(1.02–1.03)` na imagem?
- [ ] Ícones são do Ionic, tamanho correto, cor herdada?
- [ ] Não há bordas coloridas nos cards?
- [ ] Loading usa skeleton, não spinner?
- [ ] A tela funciona no grid 6/4/2 colunas (desktop/tablet/mobile)?
- [ ] Conteúdo adulto tem overlay + badge `+18` quando configuração está desligada?

---

## 12. Referência de Telas (pelo ToonLivre)

### Tela principal (Home/Discover)
- Hero opcional com banner do conteúdo em destaque
- Seções horizontais por categoria: "Lançamentos 🔥", "Em Alta", "Populares", etc.
- Cada seção: título + toggle grid/lista + grid de cards
- Scroll infinito ou paginação discreta no rodapé

### Tela de catálogo/biblioteca
- Mesma grid de cards
- Filtros no topo: tipo, gênero, status, ordenação
- Filtros em chips horizontais com scroll — não em sidebar

### Tela de detalhe do conteúdo
- Banner/backdrop no topo com overlay gradiente
- Capa + informações ao lado (título, tipo, status, nota, gêneros)
- Lista de capítulos/episódios abaixo
- Botão de ação principal (Adicionar à biblioteca / Continuar lendo)

### Tela de perfil/biblioteca pessoal
- Grid de cards com indicador de progresso
- Filtros por status: Lendo / Completo / Pretendo / Pausado / Abandonado

---

*Última atualização: gerado a partir da análise visual do ToonLivre (toonlivre.net)*  
*Sempre que o ToonLivre atualizar o design, revisar este arquivo.*
