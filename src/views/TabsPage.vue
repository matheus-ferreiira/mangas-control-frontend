<template>
    <IonPage>
        <IonTabs>
            <IonRouterOutlet></IonRouterOutlet>
            <IonTabBar slot="bottom">
                <IonTabButton tab="library" href="/tabs/library">
                    <IonIcon :icon="libraryOutline" />
                    <IonLabel>Biblioteca</IonLabel>
                </IonTabButton>

                <IonTabButton tab="discover" href="/tabs/discover">
                    <IonIcon :icon="compassOutline" />
                    <IonLabel>Descobrir</IonLabel>
                </IonTabButton>

                <IonTabButton tab="add" href="/tabs/add" class="tab-fab">
                    <div class="fab-circle">
                        <IonIcon :icon="addOutline" class="fab-icon" />
                    </div>
                    <IonLabel>Adicionar</IonLabel>
                </IonTabButton>

                <IonTabButton tab="sources" href="/tabs/sources">
                    <IonIcon :icon="cloudDownloadOutline" />
                    <IonLabel>Fontes</IonLabel>
                </IonTabButton>

                <IonTabButton tab="profile" href="/tabs/profile">
                    <IonIcon :icon="personOutline" />
                    <IonLabel>Perfil</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
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
    width: 36px;
    height: 36px;
    border-radius: 23px;
    background: linear-gradient(135deg, #00d4aa, #00b894);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -4px;
    box-shadow: 0 4px 16px rgba(0, 212, 170, 0.4);
    flex-shrink: 0;
}

.fab-icon {
    font-size: 22px;
    color: #000;
    font-weight: 900;
}
</style>
