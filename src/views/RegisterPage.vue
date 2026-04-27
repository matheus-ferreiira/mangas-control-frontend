<template>
    <IonPage class="[--background:#0b0f1a]">
        <IonContent :fullscreen="true" class="[--background:#0b0f1a]">
            <div class="px-6 pt-14 pb-10">
                <!-- Logo mark -->
                <div class="flex justify-center mb-6">
                    <div class="w-[60px] h-[60px] bg-neon-accent/12 rounded-[18px] flex items-center justify-center border border-neon-accent/20">
                        <IonIcon :icon="bookSharp" class="text-[32px] text-neon-accent" />
                    </div>
                </div>

                <h2 class="text-[24px] font-extrabold text-neon-text m-0 mb-1 text-center">Criar conta</h2>
                <p class="text-sm text-neon-muted text-center m-0 mb-6">Junte-se ao Neon Curator</p>

                <!-- Form card -->
                <div class="bg-neon-surface border border-neon-border rounded-[20px] p-6">

                    <div class="mb-3">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-1.5">Nome completo</span>
                        <IonInput v-model="form.name" placeholder="Seu nome" fill="outline" class="neon-input" />
                    </div>

                    <div class="mb-3">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-1.5">Usuário</span>
                        <IonInput v-model="form.username" placeholder="@usuario" fill="outline" class="neon-input" autocapitalize="none" />
                    </div>

                    <div class="mb-3">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-1.5">Email</span>
                        <IonInput v-model="form.email" type="email" placeholder="seu@email.com" fill="outline" class="neon-input" />
                    </div>

                    <div class="mb-5">
                        <span class="block text-[11px] font-bold uppercase tracking-[1.5px] text-neon-muted mb-1.5">Senha</span>
                        <IonInput v-model="form.password" type="password" placeholder="Mínimo 8 caracteres" fill="outline" class="neon-input" />
                    </div>

                    <IonButton
                        expand="block"
                        class="btn-primary mb-4"
                        :disabled="loading || !canSubmit"
                        @click="register"
                    >
                        <IonSpinner v-if="loading" name="crescent" />
                        <span v-else>Criar Conta</span>
                    </IonButton>

                    <p class="text-center text-[13px] text-neon-muted m-0">
                        Já tem conta?
                        <button class="text-neon-accent font-bold ml-1" @click="$router.replace('/login')">Entrar</button>
                    </p>
                </div>
            </div>
        </IonContent>
    </IonPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner, IonButton, IonInput, toastController } from '@ionic/vue';
import { bookSharp } from 'ionicons/icons';
import { authService } from '@/services/authService';
import { authStore } from '@/store/auth';

export default defineComponent({
    name: 'RegisterPage',
    components: { IonPage, IonContent, IonIcon, IonSpinner, IonButton, IonInput },
    data() {
        return {
            loading: false,
            form: { name: '', username: '', email: '', password: '' },
            bookSharp,
        };
    },
    computed: {
        canSubmit(): boolean {
            return !!(this.form.name.trim() && this.form.username.trim() && this.form.email.trim() && this.form.password.length >= 8);
        },
    },
    methods: {
        async register() {
            if (!this.canSubmit) return;
            this.loading = true;
            try {
                const res = await authService.register({
                    name: this.form.name.trim(),
                    username: this.form.username.trim(),
                    email: this.form.email.trim(),
                    password: this.form.password,
                });
                authStore.setAuth(res.token, res.user);
                this.$router.replace('/tabs/library');
            } catch (err: any) {
                const message = err?.response?.data?.message ?? 'Falha ao criar conta. Tente novamente.';
                const toast = await toastController.create({ message, duration: 3000, color: 'danger', position: 'top' });
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
