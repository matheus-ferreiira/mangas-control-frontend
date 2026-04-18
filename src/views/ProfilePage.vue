<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title class="toolbar-title">
                    <span class="title-gradient">Profile</span>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="content-pad">
                <!-- Avatar + info -->
                <div class="profile-hero">
                    <div class="avatar-wrap">
                        <img
                            v-if="user?.avatar"
                            :src="user.avatar"
                            alt="Avatar"
                            class="avatar-img"
                        />
                        <ion-icon
                            v-else
                            :icon="personCircleOutline"
                            class="avatar-icon"
                        />
                    </div>
                    <h2 class="user-name">{{ user?.name || 'Curator' }}</h2>
                    <p class="user-email">{{ user?.email }}</p>
                    <div class="curator-badge">
                        <ion-icon :icon="shieldCheckmarkOutline" />
                        Digital Archivist
                    </div>
                </div>

                <!-- Stats -->
                <div class="stats-card">
                    <div class="stat-item">
                        <span class="stat-num">{{ stats.total }}</span>
                        <span class="stat-lbl">Total</span>
                    </div>
                    <div class="stat-sep"></div>
                    <div class="stat-item">
                        <span class="stat-num accent">{{ stats.reading }}</span>
                        <span class="stat-lbl">Reading</span>
                    </div>
                    <div class="stat-sep"></div>
                    <div class="stat-item">
                        <span class="stat-num blue">{{ stats.completed }}</span>
                        <span class="stat-lbl">Completed</span>
                    </div>
                </div>

                <!-- Links -->
                <div class="menu-section">
                    <span class="section-label">Management</span>

                    <div
                        class="menu-item"
                        @click="$router.push('/manage-mangas')"
                    >
                        <div class="menu-icon-wrap menu-teal">
                            <ion-icon :icon="bookOutline" />
                        </div>
                        <span class="menu-text">Manga Catalog</span>
                        <ion-icon
                            :icon="chevronForwardOutline"
                            class="menu-chevron"
                        />
                    </div>

                    <div
                        class="menu-item"
                        @click="$router.push('/tabs/sources')"
                    >
                        <div class="menu-icon-wrap menu-blue">
                            <ion-icon :icon="cloudDownloadOutline" />
                        </div>
                        <span class="menu-text">Manage Sources</span>
                        <ion-icon
                            :icon="chevronForwardOutline"
                            class="menu-chevron"
                        />
                    </div>
                </div>

                <div class="menu-section">
                    <span class="section-label">Account</span>

                    <div class="menu-item danger" @click="confirmLogout">
                        <div class="menu-icon-wrap menu-red">
                            <ion-icon :icon="logOutOutline" />
                        </div>
                        <span class="menu-text">Sign Out</span>
                        <ion-icon
                            :icon="chevronForwardOutline"
                            class="menu-chevron"
                        />
                    </div>
                </div>

                <p class="footer-text">© 2024 Digital Archivist Protocol</p>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    alertController,
    toastController,
} from '@ionic/vue';
import {
    personCircleOutline,
    shieldCheckmarkOutline,
    bookOutline,
    cloudDownloadOutline,
    chevronForwardOutline,
    logOutOutline,
} from 'ionicons/icons';
import { authStore } from '@/store/auth';
import { authService } from '@/services/authService';
import { userMangaService, UserManga } from '@/services/userMangaService';

export default defineComponent({
    name: 'ProfilePage',
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonIcon,
    },
    data() {
        return {
            userMangas: [] as UserManga[],
            personCircleOutline,
            shieldCheckmarkOutline,
            bookOutline,
            cloudDownloadOutline,
            chevronForwardOutline,
            logOutOutline,
        };
    },
    computed: {
        user() {
            return authStore.user;
        },
        stats() {
            return {
                total: this.userMangas.length,
                reading: this.userMangas.filter((m) => m.status === 'reading')
                    .length,
                completed: this.userMangas.filter(
                    (m) => m.status === 'completed'
                ).length,
            };
        },
    },
    async ionViewWillEnter() {
        try {
            this.userMangas = await userMangaService.getAll();
        } catch {
            // non-blocking
        }
    },
    methods: {
        async confirmLogout() {
            const alert = await alertController.create({
                header: 'Sign Out',
                message: 'Are you sure you want to sign out?',
                buttons: [
                    { text: 'Cancel', role: 'cancel' },
                    {
                        text: 'Sign Out',
                        role: 'destructive',
                        handler: () => this.logout(),
                    },
                ],
            });
            await alert.present();
        },

        async logout() {
            try {
                await authService.logout();
            } catch {
                // proceed regardless
            } finally {
                authStore.clearAuth();
                this.$router.replace('/login');
            }
        },
    },
});
</script>

<style scoped>
.toolbar-title {
    font-weight: 800;
    font-size: 18px;
}
.title-gradient {
    background: linear-gradient(135deg, #5b6ee1, #00e5b0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.content-pad {
    padding: 24px 20px 100px;
}

/* Profile hero */
.profile-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0 28px;
    text-align: center;
}

.avatar-wrap {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 2px solid var(--neon-accent);
    overflow: hidden;
    background: var(--neon-surface-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 0 20px var(--neon-accent-glow);
}
.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.avatar-icon {
    font-size: 56px;
    color: var(--neon-text-muted);
}

.user-name {
    font-size: 22px;
    font-weight: 800;
    color: #e8eaf0;
    margin: 0 0 4px;
}
.user-email {
    font-size: 14px;
    color: var(--neon-text-muted);
    margin: 0 0 14px;
}

.curator-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--neon-accent-dim);
    border: 1px solid rgba(0, 229, 176, 0.3);
    border-radius: 20px;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 700;
    color: var(--neon-accent);
}

/* Stats */
.stats-card {
    display: flex;
    align-items: center;
    background: var(--neon-surface);
    border: 1px solid var(--neon-border);
    border-radius: 18px;
    padding: 20px;
    margin-bottom: 28px;
}

.stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
.stat-num {
    font-size: 28px;
    font-weight: 900;
    color: #e8eaf0;
    line-height: 1;
}
.stat-num.accent {
    color: var(--neon-accent);
}
.stat-num.blue {
    color: #7b8ff5;
}
.stat-lbl {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--neon-text-muted);
}
.stat-sep {
    width: 1px;
    height: 36px;
    background: var(--neon-border);
}

/* Menu */
.menu-section {
    margin-bottom: 24px;
}
.section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--neon-text-muted);
    margin-bottom: 10px;
    display: block;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--neon-surface);
    border: 1px solid var(--neon-border);
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 8px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: border-color 0.2s;
}
.menu-item:active {
    border-color: var(--neon-accent);
}

.menu-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}
.menu-teal {
    background: rgba(0, 229, 176, 0.12);
    color: var(--neon-accent);
}
.menu-blue {
    background: rgba(91, 110, 225, 0.12);
    color: #7b8ff5;
}
.menu-red {
    background: rgba(255, 71, 87, 0.12);
    color: #ff6b7a;
}

.menu-text {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: #e8eaf0;
}
.menu-chevron {
    color: var(--neon-text-muted);
    font-size: 18px;
}

.footer-text {
    text-align: center;
    font-size: 11px;
    color: #4a5568;
    margin-top: 12px;
}
</style>
