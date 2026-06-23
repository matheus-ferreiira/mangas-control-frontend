<template>
    <IonPage class="[--background:#05070b]">
        <IonContent :fullscreen="true" class="[--background:#05070b]">
            <div class="px-6 pt-14 pb-10">
                <!-- Icon -->
                <div class="flex justify-center mb-6">
                    <div class="w-[60px] h-[60px] bg-neon-accent/12 rounded-[18px] flex items-center justify-center border border-neon-accent/20">
                        <IonIcon :icon="lockClosedOutline" class="text-[32px] text-neon-accent" />
                    </div>
                </div>

                <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 6px; text-align: center; font-family: 'Sora', system-ui, sans-serif; color: #e9edf2;">Nova senha</h2>
                <p class="text-sm text-neon-muted text-center m-0 mb-6">Escolha uma senha forte para sua conta.</p>

                <!-- Success state -->
                <div v-if="done" class="bg-neon-accent-dim border border-neon-accent-mid rounded-[16px] p-6 text-center">
                    <div class="text-[36px] mb-3">✓</div>
                    <div class="text-base font-bold text-neon-accent mb-2">Senha redefinida!</div>
                    <div class="text-sm text-neon-muted mb-5">Sua senha foi atualizada com sucesso.</div>
                    <IonButton expand="block" class="btn-primary" @click="$router.replace('/login')">Ir para o Login</IonButton>
                </div>

                <!-- Invalid token -->
                <div v-else-if="!token" style="background: rgba(239,107,107,0.08); border: 1px solid rgba(239,107,107,0.25); border-radius: 16px; padding: 24px; text-align: center;">
                    <div style="font-size: 14px; color: #ef6b6b; margin-bottom: 16px;">Link inválido ou expirado.</div>
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
                        <p v-if="passwordMismatch" style="font-size: 11px; color: #ef6b6b; margin-top: 4px; margin-left: 4px;">As senhas não coincidem.</p>
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
.btn-primary { --background: #f5a623; --color: #050608; --border-radius: 14px; font-weight: 800; height: 52px; }
.btn-danger-outline { --border-radius: 12px; --color: #ef6b6b; --border-color: rgba(239,107,107,0.35); }

.neon-input {
    --background: rgba(255,255,255,0.025);
    --color: #e9edf2;
    --placeholder-color: rgba(233,237,242,0.28);
    --border-color: rgba(255,255,255,0.06);
    --border-radius: 12px;
    --highlight-color-focused: #f5a623;
    --padding-start: 16px;
    --padding-end: 16px;
    min-height: 50px;
    width: 100%;
}
</style>
