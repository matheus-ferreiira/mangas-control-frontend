import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/tabs/discover',
    },
    {
        path: '/login',
        component: () => import('@/views/LoginPage.vue'),
    },
    {
        path: '/register',
        component: () => import('@/views/RegisterPage.vue'),
    },
    {
        path: '/forgot-password',
        component: () => import('@/views/ForgotPasswordPage.vue'),
    },
    {
        path: '/reset-password',
        component: () => import('@/views/ResetPasswordPage.vue'),
    },
    {
        path: '/tabs/',
        component: TabsPage,
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: '/tabs/discover' },
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
                path: 'activity',
                component: () => import('@/views/ActivityPage.vue'),
            },
            {
                path: 'profile',
                component: () => import('@/views/ProfilePage.vue'),
            },
        ],
    },
    {
        path: '/content/:id',
        component: () => import('@/views/CatalogDetailPage.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/catalog/:id',
        component: () => import('@/views/CatalogDetailPage.vue'),
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
        return '/tabs/discover';
    }
    if (to.meta.requiresAdmin) {
        try {
            const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
            if (user?.role !== 'admin') return '/tabs/discover';
        } catch {
            return '/tabs/discover';
        }
    }
});

export default router;
