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
        <p class="tagline">Archiving the world's finest<br />visual narratives.</p>
      </div>

      <!-- Auth card -->
      <div class="auth-card">
        <h2 class="card-title">Welcome back</h2>
        <p class="card-subtitle">Sign in to access your digital archives.</p>

        <!-- Google -->
        <button class="google-btn" @click="loginWithGoogle">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Login com Google
        </button>

        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">OU CONTINUE COM</span>
          <span class="divider-line"></span>
        </div>

        <!-- Email -->
        <div class="field-group">
          <div class="input-wrap">
            <ion-icon :icon="mailOutline" class="input-icon" />
            <input
              v-model="email"
              type="email"
              placeholder="Email Address"
              class="email-input"
              @keyup.enter="continueWithEmail"
            />
          </div>
        </div>

        <ion-button
          expand="block"
          class="continue-btn"
          :disabled="loading || !email"
          @click="continueWithEmail"
        >
          <ion-spinner v-if="loading" name="crescent" />
          <span v-else>Continue</span>
        </ion-button>

        <p class="register-link">
          Don't have an archive yet?
          <a href="#" @click.prevent="beginCollecting" class="accent-link">Begin Collecting</a>
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
          <a href="#" class="footer-link">PRIVACY LEXICON</a>
          <a href="#" class="footer-link">SERVICE TERMS</a>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonPage, IonContent, IonButton, IonIcon, IonSpinner,
  toastController,
} from '@ionic/vue'
import { bookSharp, mailOutline } from 'ionicons/icons'
import { authService } from '@/services/authService'
import { authStore } from '@/store/auth'

export default defineComponent({
  name: 'LoginPage',
  components: { IonPage, IonContent, IonButton, IonIcon, IonSpinner },
  data() {
    return {
      email: '',
      loading: false,
      bookSharp,
      mailOutline,
    }
  },
  methods: {
    async continueWithEmail() {
      if (!this.email.trim()) return
      this.loading = true
      try {
        const res = await authService.login(this.email.trim())
        authStore.setAuth(res.token, res.user)
        this.$router.replace('/tabs/library')
      } catch {
        const toast = await toastController.create({
          message: 'Login failed. Check your credentials.',
          duration: 2500,
          color: 'danger',
          position: 'top',
        })
        await toast.present()
      } finally {
        this.loading = false
      }
    },

    async loginWithGoogle() {
      const toast = await toastController.create({
        message: 'Google login integration pending.',
        duration: 2000,
        color: 'warning',
        position: 'top',
      })
      await toast.present()
    },

    async beginCollecting() {
      const toast = await toastController.create({
        message: 'Registration coming soon.',
        duration: 2000,
        position: 'top',
      })
      await toast.present()
    },
  },
})
</script>

<style scoped>
.login-page {
  --background: #0a0e1a;
}

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

.name-neon {
  color: #5b6ee1;
}

.name-curator {
  color: #00e5b0;
}

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

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #1a2035;
  border: 1px solid #1e2538;
  border-radius: 14px;
  padding: 14px;
  color: #e8eaf0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.google-btn:active {
  background: #212b45;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #1e2538;
}

.divider-text {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #4a5568;
  white-space: nowrap;
}

.field-group {
  margin-bottom: 16px;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1a2035;
  border: 1px solid #1e2538;
  border-radius: 14px;
  padding: 14px 16px;
  transition: border-color 0.2s;
}

.input-wrap:focus-within {
  border-color: rgba(0, 229, 176, 0.4);
}

.input-icon {
  color: #4a5568;
  font-size: 20px;
  flex-shrink: 0;
}

.email-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e8eaf0;
  font-size: 15px;
  min-width: 0;
}

.email-input::placeholder {
  color: #4a5568;
}

.continue-btn {
  --background: #5b6ee1;
  --background-activated: #4a5dc9;
  --border-radius: 14px;
  --color: #ffffff;
  height: 52px;
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 16px;
  letter-spacing: 0.5px;
}

.register-link {
  text-align: center;
  font-size: 13px;
  color: #6b7a99;
  margin: 0;
}

.accent-link {
  color: #00e5b0;
  font-weight: 700;
  text-decoration: none;
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
