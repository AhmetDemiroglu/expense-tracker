<template>
  <div class="sidebar-container" :class="{ 'is-mobile-open': isMobileOpen }">
    <div class="sidebar-overlay" @click="$emit('close')" v-if="isMobileOpen"></div>
    <aside class="sidebar">
      <!-- Ana navigasyon -->
      <nav class="sidebar-nav">
        <ul>
          <li><router-link to="/">Özet</router-link></li>
          <li>
            <router-link to="/calendar" class="calendar-link">
              <span>Takvim</span>
              <i class="fas fa-eye"></i>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Mobile için auth butonları - Alta taşındı -->
      <div class="mobile-auth mobile-only">
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
    </aside>

    <!-- Auth Modal'ı ekleyelim -->
    <AuthModal 
      v-if="showAuthModal"
      :mode="authMode"
      @close="closeAuthModal"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import AuthModal from '@/components/auth/AuthModal.vue'

export default {
  name: 'Sidebar',
  components: {
    AuthModal
  },
  props: {
    isMobileOpen: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const store = useStore()
    const showAuthModal = ref(false)
    const authMode = ref('login')
    
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const user = computed(() => store.state.auth.user)

    const openLoginModal = () => {
      emit('show-auth-modal', { mode: 'login' })
    }

    const openRegisterModal = () => {
      emit('show-auth-modal', { mode: 'register' })
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
      openLoginModal,
      openRegisterModal,
      closeAuthModal,
      handleLogout
    }
  }
}
</script>

<style scoped>
/* Container stili */
.sidebar-container {
  width: 280px;
  height: 100%;
  flex-shrink: 0;
  background-color: rgba(0, 178, 169, 0.05); /* Hafif arkaplan rengi */
}

/* Sidebar ana stili */
.sidebar {
  background-color: transparent;
  padding: 2rem 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Elemanları üst ve alta dağıt */
}

/* Navigasyon stili */
.sidebar-nav {
  flex: 1;
  margin-top: 3rem;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 1rem;
}

.sidebar-nav a {
  text-decoration: none;
  color: #003B5C;
  display: block;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 59, 92, 0.05);
}

.sidebar-nav a:hover {
  background-color: #00B2A9;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 178, 169, 0.2);
}

.sidebar-nav a.router-link-active {
  background-color: #00B2A9;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 178, 169, 0.3);
}

/* Mobile stili */
@media (max-width: 768px) {
  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    pointer-events: none;
    z-index: 1000;
    background-color: transparent;
  }

  .sidebar {
    position: absolute;
    left: -280px;
    top: 0;
    bottom: 0;
    width: 280px;
    height: 100vh;
    transition: transform 0.3s ease;
    z-index: 1001;
    padding-top: 1rem;
    background-color: white;
  }

  .sidebar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .is-mobile-open {
    pointer-events: auto;
  }

  .is-mobile-open .sidebar {
    transform: translateX(280px);
  }

  .is-mobile-open .sidebar-overlay {
    opacity: 1;
  }

  .mobile-auth {
    display: block !important;
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid rgba(0,59,92,0.1);
    border-bottom: none;
  }

  .auth-btn:hover {
    transform: translateY(-1px);
  }

  .login-btn:hover {
    background-color: #003B5C;
    color: white;
  }

  .register-btn:hover {
    background-color: #009b94;
  }

  .logout-btn:hover {
    background-color: #c82333;
  }

  .user-menu {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-greeting {
    margin-bottom: 1rem;
  }

  .welcome-text {
    color: #666;
    margin-bottom: 0.25rem;
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
}

/* Auth butonları için temel stiller */
.mobile-auth {
  display: none; /* Varsayılan olarak gizli */
}

.auth-warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.auth-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.login-btn {
  background-color: transparent;
  color: #003B5C;
  border: 1px solid #003B5C;
}

.register-btn {
  background-color: #00B2A9;
  color: white;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
}

.user-menu {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-greeting {
  margin-bottom: 1rem;
}

.welcome-text {
  color: #666;
  margin-bottom: 0.25rem;
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

/* Scrollbar stilleri */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(0, 59, 92, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 59, 92, 0.1);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 59, 92, 0.2);
}

.calendar-link {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
}

.calendar-link i {
  font-size: 0.9rem;
  opacity: 0.7;
}

.calendar-link:hover i {
  opacity: 1;
  color: white;
}
</style> 