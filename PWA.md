# PWA - Progressive Web App

O Neon Curator agora suporta instalação como Progressive Web App (PWA), permitindo que você instale a aplicação no seu dispositivo assim como um app nativo.

## O que foi adicionado

### 1. **Manifest.json**
Arquivo `public/manifest.json` que descreve a aplicação com:
- Nome, descrição e ícones
- Temas e cores de fundo
- Shortcuts para páginas principais (Biblioteca, Descobrir, Adicionar)
- Configuração para instalação standalone

### 2. **Service Worker**
Arquivo `public/sw.js` que gerencia:
- Cache inteligente de assets (CSS, JS, imagens)
- Suporte offline com estratégia "Network First" para HTML e "Cache First" para assets
- Auto-atualização do cache quando há novas versões
- Fallback para modo offline com mensagem amigável

### 3. **Componente de Instalação**
`src/components/PWAInstallPrompt.vue` - Um banner fixo que:
- Detecta quando a PWA pode ser instalada
- Exibe um prompt ao usuário para instalar
- Permite descartar e mostrar novamente depois
- Se descartar 2 vezes, não mostra mais na sessão

### 4. **Configurações**
- **vite.config.ts**: Integração do plugin vite-plugin-pwa
- **index.html**: Meta tags necessárias para PWA, manifest.json e script de instalação
- **App.vue**: Componente PWAInstallPrompt integrado na app

## Como instalar no seu dispositivo

### Desktop (Chrome, Edge, Firefox, Safari)
1. Abra a aplicação em `http://localhost:5174/` (ou seu URL de deploy)
2. Quando tudo estiver carregado, você verá um banner na parte inferior: **"Instalar Neon Curator"**
3. Clique em **"Instalar"**
4. Confirm a instalação no diálogo do navegador
5. A app será instalada como um app standalone na sua máquina

### Mobile (Android Chrome)
1. Acesse a aplicação no navegador Chrome do seu celular
2. Você verá um prompt de instalação (banner na parte inferior)
3. Toque em **"Instalar"**
4. A app será adicionada à tela inicial

### iOS (Safari)
1. Abra em Safari em um dispositivo iOS
2. Toque no botão de compartilhamento (compartilhe ícone)
3. Toque em **"Adicionar à Tela Inicial"**
4. Nomeie como desejar (recomendado: "Neon Curator")
5. A app será adicionada à tela inicial

## Recursos offline

Depois de instalar, a aplicação:
- ✅ Funciona mesmo sem internet
- ✅ Carrega a interface inicial do cache
- ✅ Permite navegar pelo histórico do cache
- ✅ Sincroniza dados quando a internet retornar

## Arquivos criados/modificados

```
📁 Novo
├── public/
│   ├── manifest.json      (Metadados da PWA)
│   ├── pwa-install.js     (Script de detecção de instalação)
│   └── sw.js              (Service Worker)
├── src/components/
│   └── PWAInstallPrompt.vue (Banner de instalação)
├── vite.config.ts         (Configuração do plugin vite-plugin-pwa)
├── index.html             (Meta tags e scripts PWA)
└── src/App.vue            (Integração do componente)
```

## Dependências adicionadas

```json
{
  "devDependencies": {
    "vite-plugin-pwa": "^0.x.x",
    "workbox-cli": "^7.x.x"
  }
}
```

## Desenvolvendo localmente

Para testar a PWA em desenvolvimento:

```bash
npm run dev
```

O Service Worker funcionará em modo desenvolvimento também.

Para testar o build de produção:

```bash
npm run build
npm run preview
```

## Troubleshooting

### O banner não aparece?
- Verifique se `pwa-install.js` está sendo carregado (veja o console do navegador)
- Em produção, precisa estar em HTTPS (Service Workers requerem HTTPS)
- O banner não aparece em navegadores que já detectaram que a app pode ser instalada

### Service Worker não está registrando?
- Verifique o console do navegador para erros
- Certifique-se de que a aplicação está sendo servida com HTTPS (em produção)
- Limpe o cache do navegador: DevTools → Application → Clear storage

### Cache desatualizado?
- Service Workers com `skipWaiting: true` atualizam automaticamente
- Recarregue a página após atualizar o código
- Verifique a aba "Application" → "Service Workers" no DevTools

## Leitura adicional

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Vite Plugin PWA](https://vite-plugin-pwa.netlify.app/)
- [Web Manifest Specification](https://www.w3.org/TR/appmanifest/)
