<template>
    <IonPage class="[--background:#0b0f1a]">
        <IonContent :fullscreen="true" class="[--background:#0b0f1a]">
            <!-- Logo -->
            <div class="flex flex-col items-center px-6 pt-16 pb-8">
                <div class="w-[72px] h-[72px] bg-neon-accent/12 rounded-[20px] flex items-center justify-center mb-4 border border-neon-accent/20">
                    <IonIcon :icon="bookSharp" class="text-[40px] text-neon-accent" />
                </div>
                <h1 class="text-[28px] font-black tracking-[4px] m-0 mb-2.5 leading-none">
                    <span class="text-neon-blue">NEON</span>
                    <span class="text-neon-accent"> CURATOR</span>
                </h1>
                <p class="text-neon-muted text-sm text-center leading-relaxed m-0">
                    Arquivando as melhores narrativas<br />visuais do mundo.
                </p>
            </div>

            <!-- Auth card -->
            <div class="mx-5 mb-6 bg-neon-surface border border-neon-border rounded-[20px] p-7">
                <h2 class="text-[22px] font-extrabold text-neon-text m-0 mb-1.5">Bem-vindo de volta</h2>
                <p class="text-sm text-neon-muted m-0 mb-6">Entre para acessar seus arquivos digitais.</p>

                <IonButton
                    expand="block"
                    fill="outline"
                    class="google-btn"
                    :disabled="loading"
                    @click="loginWithGoogle"
                >
                    <IonSpinner v-if="loading" slot="start" name="crescent" style="width:20px;height:20px;--color:#00d4aa" />
                    <template v-else>
                        <span slot="start" style="display:flex;align-items:center;margin-inline-end:10px">
                            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                        </span>
                        Entrar com Google
                    </template>
                </IonButton>

                <p class="text-center text-[13px] text-neon-muted mt-5 mb-0 leading-relaxed">
                    Acesso apenas via Google.<br />
                    <span class="text-[12px] text-[#4a5568]">Fale com o administrador para obter acesso.</span>
                </p>
            </div>

            <!-- Atmospheric -->
            <div class="flex gap-2 mx-5 mb-6 h-[140px]">
                <div class="flex-1 rounded-2xl bg-gradient-to-br from-[#0d1a2d] to-[#1a0d2e] relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-t from-[rgba(10,14,26,0.8)] to-transparent"></div>
                </div>
                <div class="flex-1 rounded-2xl bg-gradient-to-br from-[#0d1a2d] to-[#0d2d1a] relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-t from-[rgba(10,14,26,0.8)] to-transparent"></div>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 pb-10 text-center">
                <p class="text-[10px] text-[#4a5568] tracking-[0.5px] m-0 mb-2">© 2025 PROTOCOLO ARQUIVISTA DIGITAL</p>
                <div class="flex justify-center gap-5">
                    <a href="#" class="text-[10px] text-[#4a5568] no-underline tracking-[0.5px]">POLÍTICA DE PRIVACIDADE</a>
                    <a href="#" class="text-[10px] text-[#4a5568] no-underline tracking-[0.5px]">TERMOS DE USO</a>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner, IonButton, toastController } from '@ionic/vue';
import { bookSharp } from 'ionicons/icons';
import { authService } from '@/services/authService';
import { authStore } from '@/store/auth';

export default defineComponent({
    name: 'LoginPage',
    components: { IonPage, IonContent, IonIcon, IonSpinner, IonButton },
    data() {
        return { loading: false, bookSharp };
    },
    methods: {
        loginWithGoogle() {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            if (!clientId) {
                toastController.create({ message: 'Configure VITE_GOOGLE_CLIENT_ID no arquivo .env', duration: 3000, color: 'warning', position: 'top' }).then((t) => t.present());
                return;
            }
            const g = (window as any).google;
            if (!g) {
                toastController.create({ message: 'Google Sign-In não disponível. Recarregue a página.', duration: 2500, color: 'warning', position: 'top' }).then((t) => t.present());
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
                        const toast = await toastController.create({ message: 'Falha no login. Verifique suas credenciais.', duration: 2500, color: 'danger', position: 'top' });
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
                    toastController.create({ message: 'Pop-up bloqueado. Verifique as configurações do navegador.', duration: 3000, color: 'warning', position: 'top' }).then((t) => t.present());
                }
            });
        },
    },
});
</script>

<style scoped>
.google-btn {
    --background: #1a2035;
    --color: #f0f4ff;
    --border-color: #222840;
    --border-radius: 14px;
    --border-width: 1px;
    --letter-spacing: 0;
    height: 52px;
    font-size: 15px;
    font-weight: 600;
    text-transform: none;
}
</style>
