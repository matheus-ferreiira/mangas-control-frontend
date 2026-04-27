<template>
    <IonPage class="[--background:#0b0f1a]">
        <IonContent :fullscreen="true" class="[--background:#0b0f1a]">
            <div class="px-6 pt-14 pb-10">
                <!-- Back -->
                <button class="flex items-center gap-1.5 text-neon-muted mb-8" @click="$router.back()">
                    <IonIcon :icon="chevronBackOutline" class="text-base" />
                    <span class="text-[13px] font-semibold">Voltar</span>
                </button>

                <!-- Icon -->
                <div class="flex justify-center mb-6">
                    <div class="w-[60px] h-[60px] bg-neon-accent/12 rounded-[18px] flex items-center justify-center border border-neon-accent/20">
                        <IonIcon :icon="mailOutline" class="text-[32px] text-neon-accent" />
                    </div>
                </div>

                <h2 class="text-[24px] font-extrabold text-neon-text m-0 mb-1.5 text-center">Esqueceu a senha?</h2>
                <p class="text-sm text-neon-muted text-center m-0 mb-6 leading-relaxed">
                    Informe seu email e enviaremos<br/>um link para redefinir sua senha.
                </p>

                <!-- Success state -->
                <div v-if="sent" class="bg-[#10b981]/10 border border-[#10b981]/30 rounded-[16px] p-6 text-center">
                    <div class="text-[36px] mb-3">✉️</div>
                    <div class="text-base font-bold text-[#10b981] mb-2">Email enviado!</div>
                    <div class="text-sm text-neon-muted mb-5">Verifique sua caixa de entrada e siga as instruções.</div>
                    <IonButton expand="block" fill="outline" class="btn-outline" @click="$router.replace('/login')">Voltar ao Login</IonButton>
                </div>

                <!-- Form -->
                <div v-else class="bg-neon-surface border border-neon-border rounded-[20px] p-6">
                    <div class="mb-5">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-1.5">Email</span>
                        <IonInput
                            v-model="email"
                            type="email"
                            placeholder="seu@email.com"
                            fill="outline"
                            class="neon-input"
                            @keyup.enter="send"
                        />
                    </div>

                    <IonButton
                        expand="block"
                        class="btn-primary"
                        :disabled="loading || !email.trim()"
                        @click="send"
                    >
                        <IonSpinner v-if="loading" name="crescent" />
                        <span v-else>Enviar Link</span>
                    </IonButton>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner, IonButton, IonInput, toastController } from '@ionic/vue';
import { chevronBackOutline, mailOutline } from 'ionicons/icons';
import { authService } from '@/services/authService';

export default defineComponent({
    name: 'ForgotPasswordPage',
    components: { IonPage, IonContent, IonIcon, IonSpinner, IonButton, IonInput },
    data() {
        return {
            loading: false,
            sent: false,
            email: '',
            chevronBackOutline, mailOutline,
        };
    },
    methods: {
        async send() {
            if (!this.email.trim()) return;
            this.loading = true;
            try {
                await authService.forgotPassword(this.email.trim());
                this.sent = true;
            } catch {
                const toast = await toastController.create({ message: 'Falha ao enviar. Verifique o email informado.', duration: 3000, color: 'danger', position: 'top' });
                await toast.present();
            } finally {
                this.loading = false;
            }
        },
    },
});
</script>

<style scoped>
.btn-primary { --background: var(--neon-accent); --color: #000; --border-radius: 14px; font-weight: 700; height: 52px; }
.btn-outline { --border-radius: 12px; --color: var(--neon-accent); --border-color: var(--neon-accent); }

.neon-input {
    --background: #1a2035;
    --color: #f0f4ff;
    --placeholder-color: #4a5570;
    --border-color: #222840;
    --border-radius: 12px;
    --highlight-color-focused: #00d4aa;
    --padding-start: 16px;
    --padding-end: 16px;
    min-height: 50px;
    width: 100%;
}
</style>
