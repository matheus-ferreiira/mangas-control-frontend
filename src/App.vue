<template>
    <IonApp>
        <IonRouterOutlet />
        <PWAInstallPrompt />
    </IonApp>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import PWAInstallPrompt from './components/PWAInstallPrompt.vue';
</script>
