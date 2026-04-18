<template>
    <ion-page class="login-page">
        <ion-content :fullscreen="true" class="login-content">
            <!-- Logo -->
            <div class="logo-section">
                <div class="logo-icon-wrap">
                    <ion-icon :icon="bookSharp" class="logo-icon" />
                </div>
                <h1 class="app-name">
                    <span class="name-neon">NEON</span>
                    <span class="name-curator"> CURATOR</span>
                </h1>
                <p class="tagline">
                    Arquivando as melhores narrativas<br />visuais do mundo.
                </p>
            </div>

            <!-- Auth card -->
            <div class="auth-card">
                <h2 class="card-title">Bem-vindo de volta</h2>
                <p class="card-subtitle">
                    Entre para acessar seus arquivos digitais.
                </p>

                <!-- Google -->
                <button
                    class="google-btn"
                    :class="{ loading: loading }"
                    :disabled="loading"
                    @click="loginWithGoogle"
                >
                    <ion-spinner v-if="loading" name="crescent" class="btn-spinner" />
                    <template v-else>
                        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Entrar com Google
                    </template>
                </button>

                <p class="register-link">
                    Acesso apenas via Google.<br />
                    <span class="muted-text">Fale com o administrador para obter acesso.</span>
                </p>
            </div>

            <!-- Atmospheric images -->
            <div class="atm-section">
                <div class="atm-img atm-left">
                    <div class="atm-overlay"></div>
                </div>
                <div class="atm-img atm-right">
                    <div class="atm-overlay"></div>
                </div>
            </div>

            <!-- Footer -->
            <div class="login-footer">
                <p class="footer-copy">© 2024 DIGITAL ARCHIVIST PROTOCOL</p>
                <div class="footer-links">
                    <a href="#" class="footer-link">POLÍTICA DE PRIVACIDADE</a>
                    <a href="#" class="footer-link">TERMOS DE USO</a>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner, toastController } from '@ionic/vue';
import { bookSharp } from 'ionicons/icons';
import { authService } from '@/services/authService';
import { authStore } from '@/store/auth';

export default defineComponent({
    name: 'LoginPage',
    components: { IonPage, IonContent, IonIcon, IonSpinner },
    data() {
        return { loading: false, bookSharp };
    },
    methods: {
        loginWithGoogle() {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            if (!clientId) {
                toastController.create({
                    message: 'Configure VITE_GOOGLE_CLIENT_ID no arquivo .env',
                    duration: 3000, color: 'warning', position: 'top',
                }).then((t) => t.present());
                return;
            }

            const g = (window as any).google;
            if (!g) {
                toastController.create({
                    message: 'Google Sign-In não disponível. Recarregue a página.',
                    duration: 2500, color: 'warning', position: 'top',
                }).then((t) => t.present());
                return;
            }

            g.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: { credential: string }) => {
                    this.loading = true;
                    try {
                        const res = await authService.loginWithGoogle(response.credential);
                        authStore.setAuth(res.token, res.user);
                        this.$router.replace('/tabs/library');
                    } catch {
                        const toast = await toastController.create({
                            message: 'Falha no login. Verifique suas credenciais.',
                            duration: 2500, color: 'danger', position: 'top',
                        });
                        await toast.present();
                    } finally {
                        this.loading = false;
                    }
                },
                use_fedcm_for_prompt: false,
            });

            this.loading = true;
            g.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    this.loading = false;
                    toastController.create({
                        message: 'Pop-up bloqueado. Verifique as configurações do navegador.',
                        duration: 3000, color: 'warning', position: 'top',
                    }).then((t) => t.present());
                }
            });
        },
    },
});
</script>

<style scoped>
.login-page,
.login-content {
    --background: #0a0e1a;
}

/* Logo */
.logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 24px 32px;
}

.logo-icon-wrap {
    width: 72px;
    height: 72px;
    background: var(--neon-accent-dim);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    border: 1px solid rgba(0, 229, 176, 0.2);
}

.logo-icon {
    font-size: 40px;
    color: var(--neon-accent);
}

.app-name {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 4px;
    margin: 0 0 10px;
    line-height: 1;
}

.name-neon { color: #5b6ee1; }
.name-curator { color: #00e5b0; }

.tagline {
    color: #8892a4;
    font-size: 14px;
    text-align: center;
    line-height: 1.5;
    margin: 0;
}

/* Auth card */
.auth-card {
    background: #131929;
    border: 1px solid #1e2538;
    border-radius: 20px;
    margin: 0 20px 24px;
    padding: 28px 24px;
}

.card-title {
    font-size: 22px;
    font-weight: 800;
    color: #e8eaf0;
    margin: 0 0 6px;
}

.card-subtitle {
    font-size: 14px;
    color: #6b7a99;
    margin: 0 0 24px;
}

/* Google button */
.google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #1a2035;
    border: 1px solid #1e2538;
    border-radius: 14px;
    padding: 16px;
    color: #e8eaf0;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    -webkit-tap-highlight-color: transparent;
    min-height: 52px;
}

.google-btn:not(:disabled):active {
    background: #212b45;
}

.google-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.google-btn.loading {
    border-color: rgba(0, 229, 176, 0.3);
}

.btn-spinner {
    width: 20px;
    height: 20px;
    --color: #00e5b0;
}

.register-link {
    text-align: center;
    font-size: 13px;
    color: #6b7a99;
    margin: 20px 0 0;
    line-height: 1.5;
}

.muted-text {
    font-size: 12px;
    color: #4a5568;
}

/* Atmospheric */
.atm-section {
    display: flex;
    gap: 8px;
    margin: 0 20px 24px;
    height: 140px;
}

.atm-img {
    flex: 1;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
}

.atm-left {
    background: linear-gradient(135deg, #0d1a2d 0%, #1a0d2e 100%);
}

.atm-right {
    background: linear-gradient(135deg, #0d1a2d 0%, #0d2d1a 100%);
}

.atm-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10, 14, 26, 0.8) 0%, transparent 50%);
}

/* Footer */
.login-footer {
    padding: 0 24px 40px;
    text-align: center;
}

.footer-copy {
    font-size: 10px;
    color: #4a5568;
    letter-spacing: 0.5px;
    margin: 0 0 8px;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.footer-link {
    font-size: 10px;
    color: #4a5568;
    text-decoration: none;
    letter-spacing: 0.5px;
}
</style>
