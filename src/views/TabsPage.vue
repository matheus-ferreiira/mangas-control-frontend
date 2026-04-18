<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="library" href="/tabs/library">
                    <ion-icon :icon="libraryOutline" />
                    <ion-label>Library</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="discover" href="/tabs/discover">
                    <ion-icon :icon="compassOutline" />
                    <ion-label>Discover</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="add" href="/tabs/add" class="tab-add">
                    <div class="add-btn-wrap">
                        <ion-icon :icon="addCircle" class="add-icon" />
                    </div>
                    <ion-label>Add</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="sources" href="/tabs/sources">
                    <ion-icon :icon="cloudDownloadOutline" />
                    <ion-label>Sources</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="profile" href="/tabs/profile">
                    <ion-icon :icon="personOutline" />
                    <ion-label>Profile</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonIcon,
    IonRouterOutlet,
} from '@ionic/vue';
import {
    libraryOutline,
    compassOutline,
    addCircle,
    cloudDownloadOutline,
    personOutline,
} from 'ionicons/icons';

export default defineComponent({
    name: 'TabsPage',
    components: {
        IonPage,
        IonTabs,
        IonTabBar,
        IonTabButton,
        IonLabel,
        IonIcon,
        IonRouterOutlet,
    },
    data() {
        return {
            libraryOutline,
            compassOutline,
            addCircle,
            cloudDownloadOutline,
            personOutline,
        };
    },
});
</script>

<style scoped>
.tab-add .add-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
}

.tab-add .add-icon {
    font-size: 32px;
    color: var(--neon-accent);
    filter: drop-shadow(0 0 8px var(--neon-accent-glow));
}

.tab-add ion-label {
    color: var(--neon-accent) !important;
}
</style>
