import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import MusicInputView from '@/views/MusicInputView.vue';
import MusicSeparationView from '@/views/MusicSeparationView.vue';
import MusicConversionView from '@/views/MusicConversionView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/separation',
            name: 'separation',
            component: MusicSeparationView,
        },
        {
            path: '/conversion',
            name: 'conversion',
            component: MusicConversionView,
        },
        {
            path: '/input',
            name: 'input',
            component: MusicInputView,
        },
    ],
});

export default router;
