/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        legacy(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api/],
                cleanupOutdatedCaches: true,
            },
            devOptions: {
                enabled: true,
            },
            manifest: {
                name: 'Neon Curator',
                short_name: 'Neon Curator',
                description: 'Gerencie sua coleção de mangás, animes e novels',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                orientation: 'portrait-primary' as ManifestOptions['orientation'],
                theme_color: '#000000',
                background_color: '#000000',
                categories: ['productivity', 'entertainment'],
                icons: [
                    {
                        src: '/favicon.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/favicon.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/favicon.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                shortcuts: [
                    {
                        name: 'Biblioteca',
                        short_name: 'Biblioteca',
                        description: 'Acesse sua biblioteca de conteúdos',
                        url: '/tabs/library',
                        icons: [{ src: '/favicon.png', sizes: '192x192', type: 'image/png' }],
                    },
                    {
                        name: 'Descobrir',
                        short_name: 'Descobrir',
                        description: 'Descubra novos conteúdos',
                        url: '/tabs/discover',
                        icons: [{ src: '/favicon.png', sizes: '192x192', type: 'image/png' }],
                    },
                    {
                        name: 'Adicionar',
                        short_name: 'Adicionar',
                        description: 'Adicione um novo conteúdo à biblioteca',
                        url: '/tabs/add',
                        icons: [{ src: '/favicon.png', sizes: '192x192', type: 'image/png' }],
                    },
                ],
            } as ManifestOptions,
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
    },
});
