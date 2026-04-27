<template>
    <IonPage class="[--background:#0b0f1a]">
        <IonContent :fullscreen="true" class="[--background:#0b0f1a]">
            <div class="px-6 pt-14 pb-10">
                <!-- Icon -->
                <div class="flex justify-center mb-6">
                    <div class="w-[60px] h-[60px] bg-neon-accent/12 rounded-[18px] flex items-center justify-center border border-neon-accent/20">
                        <IonIcon :icon="lockClosedOutline" class="text-[32px] text-neon-accent" />
                    </div>
                </div>

                <h2 class="text-[24px] font-extrabold text-neon-text m-0 mb-1.5 text-center">Nova senha</h2>
                <p class="text-sm text-neon-muted text-center m-0 mb-6">Escolha uma senha forte para sua conta.</p>

                <!-- Success state -->
                <div v-if="done" class="bg-[#10b981]/10 border border-[#10b981]/30 rounded-[16px] p-6 text-center">
                    <div class="text-[36px] mb-3">✓</div>
                    <div class="text-base font-bold text-[#10b981] mb-2">Senha redefinida!</div>
                    <div class="text-sm text-neon-muted mb-5">Sua senha foi atualizada com sucesso.</div>
                    <IonButton expand="block" class="btn-primary" @click="$router.replace('/login')">Ir para o Login</IonButton>
                </div>

                <!-- Invalid token -->
                <div v-else-if="!token" class="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-[16px] p-6 text-center">
                    <div class="text-sm text-[#ef4444] mb-4">Link inválido ou expirado.</div>
                    <IonButton expand="block" fill="outline" class="btn-danger-outline" @click="$router.replace('/forgot-password')">Solicitar novo link</IonButton>
                </div>

                <!-- Form -->
                <div v-else class="bg-neon-surface border border-neon-border rounded-[20px] p-6">
                    <div class="mb-3">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-1.5">Email</span>
                        <IonInput v-model="form.email" type="email" placeholder="seu@email.com" fill="outline" class="neon-input" />
                    </div>
                    <div class="mb-3">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-1.5">Nova senha</span>
                        <IonInput v-model="form.password" type="password" placeholder="Mínimo 8 caracteres" fill="outline" class="neon-input" />
                    </div>
                    <div class="mb-5">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-1.5">Confirmar senha</span>
                        <IonInput v-model="form.password_confirmation" type="password" placeholder="Repita a nova senha" fill="outline" class="neon-input" />
                        <p v-if="passwordMismatch" class="text-[11px] text-[#ef4444] mt-1 ml-1">As senhas não coincidem.</p>
                    </div>

                    <IonButton
                        expand="block"
                        class="btn-primary"
                        :disabled="loading || !canSubmit"
                        @click="resetPassword"
                    >
                        <IonSpinner v-if="loading" name="crescent" />
                        <span v-else>Redefinir Senha</span>
                    </IonButton>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner, IonButton, IonInput, toastController } from '@ionic/vue';
import { lockClosedOutline } from 'ionicons/icons';
import { authService } from '@/services/authService';

export default defineComponent({
    name: 'ResetPasswordPage',
    components: { IonPage, IonContent, IonIcon, IonSpinner, IonButton, IonInput },
    data() {
        return {
            loading: false,
            done: false,
            form: { email: '', password: '', password_confirmation: '' },
            lockClosedOutline,
        };
    },
    computed: {
        token(): string {
            return (this.$route.query.token as string) ?? '';
        },
        passwordMismatch(): boolean {
            return !!(this.form.password_confirmation && this.form.password !== this.form.password_confirmation);
        },
        canSubmit(): boolean {
            return !!(
                this.form.email.trim() &&
                this.form.password.length >= 8 &&
                this.form.password === this.form.password_confirmation
            );
        },
    },
    created() {
        const emailFromQuery = this.$route.query.email as string;
        if (emailFromQuery) this.form.email = emailFromQuery;
    },
    methods: {
        async resetPassword() {
            if (!this.canSubmit || !this.token) return;
            this.loading = true;
            try {
                await authService.resetPassword({
                    token: this.token,
                    email: this.form.email.trim(),
                    password: this.form.password,
                    password_confirmation: this.form.password_confirmation,
                });
                this.done = true;
            } catch {
                const toast = await toastController.create({ message: 'Falha ao redefinir. O link pode ter expirado.', duration: 3000, color: 'danger', position: 'top' });
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
.btn-danger-outline { --border-radius: 12px; --color: #ef4444; --border-color: rgba(239,68,68,0.4); }

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
