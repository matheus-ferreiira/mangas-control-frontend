<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="library" href="/tabs/library">
                    <ion-icon :icon="libraryOutline" />
                    <ion-label>Biblioteca</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="discover" href="/tabs/discover">
                    <ion-icon :icon="compassOutline" />
                    <ion-label>Descobrir</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="add" href="/tabs/add" class="tab-fab">
                    <div class="fab-circle">
                        <ion-icon :icon="addOutline" class="fab-icon" />
                    </div>
                    <ion-label>Adicionar</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="sources" href="/tabs/sources">
                    <ion-icon :icon="cloudDownloadOutline" />
                    <ion-label>Fontes</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="profile" href="/tabs/profile">
                    <ion-icon :icon="personOutline" />
                    <ion-label>Perfil</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage, IonTabs, IonTabBar, IonTabButton,
    IonLabel, IonIcon, IonRouterOutlet,
} from '@ionic/vue';
import { libraryOutline, compassOutline, addOutline, cloudDownloadOutline, personOutline } from 'ionicons/icons';

export default defineComponent({
    name: 'TabsPage',
    components: { IonPage, IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon, IonRouterOutlet },
    data() {
        return { libraryOutline, compassOutline, addOutline, cloudDownloadOutline, personOutline };
    },
});
</script>

<style scoped>
.tab-fab {
    --color: transparent;
    --color-selected: transparent;
    position: relative;
}

.tab-fab ion-label {
    color: var(--neon-accent) !important;
    font-size: 10px;
    font-weight: 600;
    margin-top: 2px;
}

.fab-circle {
    width: 46px;
    height: 46px;
    border-radius: 23px;
    background: linear-gradient(135deg, #00d4aa, #00b894);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -14px;
    box-shadow: 0 4px 16px rgba(0, 212, 170, 0.4);
    flex-shrink: 0;
}

.fab-icon {
    font-size: 22px;
    color: #000;
    font-weight: 900;
}
</style>
