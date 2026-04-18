import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/tabs/library',
    },
    {
        path: '/login',
        component: () => import('@/views/LoginPage.vue'),
    },
    {
        path: '/tabs/',
        component: TabsPage,
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: '/tabs/library' },
            {
                path: 'library',
                component: () => import('@/views/LibraryPage.vue'),
            },
            {
                path: 'discover',
                component: () => import('@/views/DiscoverPage.vue'),
            },
            {
                path: 'add',
                component: () => import('@/views/AddUserMangaPage.vue'),
            },
            {
                path: 'sources',
                component: () => import('@/views/ManageSitesPage.vue'),
            },
            {
                path: 'profile',
                component: () => import('@/views/ProfilePage.vue'),
            },
        ],
    },
    {
        path: '/manga/:id',
        component: () => import('@/views/MangaDetailPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/manage-mangas',
        component: () => import('@/views/ManageMangasPage.vue'),
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to) => {
    const token = localStorage.getItem('auth_token');
    if (to.meta.requiresAuth && !token) {
        return '/login';
    }
    if (to.path === '/login' && token) {
        return '/tabs/library';
    }
});

export default router;
