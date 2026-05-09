<template>
    <IonPage>
        <IonTabs>
            <IonRouterOutlet></IonRouterOutlet>
            <IonTabBar slot="bottom" style="--background: #131826; --border: 1px solid #262d40; height: 60px;">
                <IonTabButton tab="library" href="/tabs/library" style="--color: #6b738a; --color-selected: #5eead4;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="6" height="16" rx="1.5"/>
                        <rect x="11" y="4" width="6" height="16" rx="1.5"/>
                        <path d="M19 6l3 14"/>
                    </svg>
                    <IonLabel>Biblioteca</IonLabel>
                </IonTabButton>

                <IonTabButton tab="discover" href="/tabs/discover" style="--color: #6b738a; --color-selected: #5eead4;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="m20 20-3.5-3.5"/>
                    </svg>
                    <IonLabel>Explorar</IonLabel>
                </IonTabButton>

                <IonTabButton tab="activity" href="/tabs/activity" style="--color: #6b738a; --color-selected: #5eead4;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12h4l3-7 4 14 3-7h4"/>
                    </svg>
                    <IonLabel>Atividade</IonLabel>
                </IonTabButton>

                <IonTabButton tab="profile" href="/tabs/profile" style="--color: #6b738a; --color-selected: #5eead4;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
                    </svg>
                    <IonLabel>Perfil</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonTabs, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet } from '@ionic/vue';

export default defineComponent({
    name: 'TabsPage',
    components: { IonPage, IonTabs, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet },
});
</script>

<style>
ion-tab-bar {
    --background: #131826;
}
ion-tab-button {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.01em;
}
ion-tab-button ion-label {
    font-size: 10px !important;
    font-weight: 600;
    margin-top: 3px;
}
</style>
