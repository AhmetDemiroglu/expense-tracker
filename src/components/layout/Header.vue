<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-toggle" @click="toggleSidebar" aria-label="Toggle Menu">
        <i class="fas fa-bars"></i>
      </button>
      
      <router-link to="/" class="brand">
        <img 
          src="@/assets/logo.png" 
          alt="Bütçe360° Logo" 
          class="logo"
        />
        <h1 class="brand-name">
          <span class="butce">Bütçe</span>
          <span class="derece">360°</span>
        </h1>
      </router-link>
    </div>
    
    <div class="header-right">
      <template v-if="!isAuthenticated">
        <div class="auth-warning">
          <i class="fas fa-exclamation-circle"></i>
          Lütfen giriş yapınız
        </div>
        <button class="auth-btn login-btn" @click="openLoginModal">
          <i class="fas fa-sign-in-alt"></i>
          Giriş Yap
        </button>
        <button class="auth-btn register-btn" @click="openRegisterModal">
          <i class="fas fa-user-plus"></i>
          Kayıt Ol
        </button>
      </template>
      
      <div v-else class="user-menu">
        <div class="user-greeting">
          <p class="welcome-text">Hoşgeldin,</p>
          <router-link to="/profile" class="user-name">
            {{ user?.displayName }}
          </router-link>
        </div>
        <button class="auth-btn logout-btn" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          Çıkış Yap
        </button>
      </div>
    </div>

    <!-- Auth Modalları -->
    <AuthModal 
      v-if="showAuthModal"
      :mode="authMode"
      @close="closeAuthModal"
    />
  </header>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import AuthModal from '@/components/auth/AuthModal.vue'

export default {
  name: 'Header',
  components: {
    AuthModal
  },
  emits: ['toggle-sidebar'],
  setup() {
    const store = useStore()
    const showAuthModal = ref(false)
    const authMode = ref('login') // 'login' veya 'register'
    const showUserMenu = ref(false)

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const user = computed(() => store.state.auth.user)
    const userName = computed(() => store.getters['auth/userName'])

    const openLoginModal = () => {
      authMode.value = 'login'
      showAuthModal.value = true
    }

    const openRegisterModal = () => {
      authMode.value = 'register'
      showAuthModal.value = true
    }

    const closeAuthModal = () => {
      showAuthModal.value = false
    }

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
      } catch (error) {
        console.error('Çıkış yapılamadı:', error)
      }
    }

    return {
      isAuthenticated,
      user,
      showAuthModal,
      authMode,
      showUserMenu,
      openLoginModal,
      openRegisterModal,
      closeAuthModal,
      handleLogout,
      userName
    }
  }
}
</script>

<style scoped>
@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.header {
  background: #FFFFFF;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(0,59,92,0.1);
  box-shadow: 0 2px 4px rgba(0, 59, 92, 0.05);
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 72px;
  background: linear-gradient(
    270deg,
    rgba(0, 155, 159, 0.15) 0%,
    rgba(0, 178, 169, 0.1) 25%,
    rgba(0, 59, 92, 0.05) 50%,
    rgba(0, 178, 169, 0.1) 75%,
    rgba(0, 155, 159, 0.15) 100%
  );
  background-size: 200% 100%;
  animation: gradientAnimation 10s ease infinite;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #FFFFFF;
  transition: color 0.2s ease;
}

.menu-toggle:hover {
  color: #00B2A9;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
}

.logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.brand-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.75rem;
  margin: 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.butce {
  color: #003B5C;
  font-weight: 600;
}

.derece {
  color: #009B9F;
  font-weight: 700;
}

/* Mobil responsive tasarım */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .brand {
    margin-left: 0.75rem;
  }

  .brand-name {
    font-size: 1.5rem;
  }

  .logo {
    width: 40px;
    height: 40px;
  }
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.login-btn {
  background-color: transparent;
  color: #003B5C;
  border: 1px solid #003B5C;
}

.login-btn:hover {
  background-color: #003B5C;
  color: white;
}

.register-btn {
  background-color: #00B2A9;
  color: white;
}

.register-btn:hover {
  background-color: #009b94;
}

.auth-warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.welcome-text {
  color: #666;
  margin: 0;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
}

.logout-btn:hover {
  background-color: #c82333;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: #003B5C;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.user-name:hover {
  color: #00B2A9;
}
</style> 