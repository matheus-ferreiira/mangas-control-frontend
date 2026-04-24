<template>
    <ion-app>
        <ion-router-outlet />
        <PWAInstallPrompt />
    </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import PWAInstallPrompt from './components/PWAInstallPrompt.vue';
</script>
