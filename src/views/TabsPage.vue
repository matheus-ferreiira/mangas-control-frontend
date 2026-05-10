<template>
    <IonPage>
        <IonTabs>
            <IonRouterOutlet></IonRouterOutlet>
            <!-- Ghost tab bar — required by Ionic router, visually hidden -->
            <IonTabBar slot="bottom" class="ghost-tab-bar">
                <IonTabButton tab="library" href="/tabs/library" />
                <IonTabButton tab="discover" href="/tabs/discover" />
                <IonTabButton tab="activity" href="/tabs/activity" />
                <IonTabButton tab="profile" href="/tabs/profile" />
            </IonTabBar>
        </IonTabs>

        <!-- Custom floating pill nav -->
        <div class="float-nav">
            <div class="float-pill">
                <button class="float-btn" :class="{ active: activeTab === 'library' }" @click="go('/tabs/library')">
                    <div class="float-inner">
                        <svg class="float-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="6" height="16" rx="1.5"/>
                            <rect x="11" y="4" width="6" height="16" rx="1.5"/>
                            <path d="M19 6l3 14"/>
                        </svg>
                        <span class="float-label">Biblioteca</span>
                    </div>
                </button>

                <button class="float-btn" :class="{ active: activeTab === 'discover' }" @click="go('/tabs/discover')">
                    <div class="float-inner">
                        <svg class="float-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="7"/>
                            <path d="m20 20-3.5-3.5"/>
                        </svg>
                        <span class="float-label">Explorar</span>
                    </div>
                </button>

                <button class="float-btn" :class="{ active: activeTab === 'activity' }" @click="go('/tabs/activity')">
                    <div class="float-inner">
                        <svg class="float-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12h4l3-7 4 14 3-7h4"/>
                        </svg>
                        <span class="float-label">Atividade</span>
                    </div>
                </button>

                <button class="float-btn" :class="{ active: activeTab === 'profile' }" @click="go('/tabs/profile')">
                    <div class="float-inner">
                        <svg class="float-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
                        </svg>
                        <span class="float-label">Perfil</span>
                    </div>
                </button>
            </div>
        </div>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonTabs, IonTabBar, IonTabButton, IonRouterOutlet } from '@ionic/vue';

export default defineComponent({
    name: 'TabsPage',
    components: { IonPage, IonTabs, IonTabBar, IonTabButton, IonRouterOutlet },
    computed: {
        activeTab(): string {
            const path = this.$route.path;
            if (path.includes('/tabs/library')) return 'library';
            if (path.includes('/tabs/discover')) return 'discover';
            if (path.includes('/tabs/activity')) return 'activity';
            if (path.includes('/tabs/profile')) return 'profile';
            return 'library';
        },
    },
    methods: {
        go(path: string) {
            this.$router.push(path);
        },
    },
});
</script>

<style>
/* Ghost tab bar — routing only */
.ghost-tab-bar {
    height: 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    border-top: none !important;
    --border: none !important;
}

/* Floating nav wrapper — sits over IonTabs content */
.float-nav {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    display: flex;
    justify-content: center;
    padding: 10px 24px;
    padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
    pointer-events: none;
}

/* Glass pill container */
.float-pill {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 5px;
    background: hsl(220 30% 4% / 0.88);
    backdrop-filter: blur(32px) saturate(180%);
    -webkit-backdrop-filter: blur(32px) saturate(180%);
    border: 1px solid hsl(0 0% 100% / 0.09);
    border-radius: 999px;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.55),
        0 2px 8px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 hsl(0 0% 100% / 0.06);
    pointer-events: all;
}

/* Tab button reset */
.float-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    outline: none;
    -webkit-tap-highlight-color: transparent;
}

/* Inner pill — inactive */
.float-inner {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    transition: background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
    color: hsl(213 10% 42%);
}

/* Inner pill — active */
.float-btn.active .float-inner {
    background: hsl(158 100% 48% / 0.13);
    box-shadow:
        0 0 18px hsl(158 100% 48% / 0.22),
        inset 0 0 0 1px hsl(158 100% 48% / 0.28);
    color: #00F5A0;
}

.float-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    stroke: currentColor;
    display: block;
}

.float-label {
    font-family: 'Sora', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.01em;
    white-space: nowrap;
    color: currentColor;
    display: none;
}

.float-btn.active .float-label {
    display: block;
}
</style>
