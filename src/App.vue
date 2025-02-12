<template>
  <div id="app">
    <!-- Email doğrulama uyarısı -->
    <div v-if="showEmailWarning" class="email-verification-warning">
      <div class="warning-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>Email adresinizi doğrulamadan tüm özellikleri kullanamazsınız</span>
        <button @click="resendVerificationEmail" class="resend-btn">
          <i class="fas fa-paper-plane"></i>
          Tekrar Gönder
        </button>
      </div>
    </div>

    <Header 
      @toggle-sidebar="toggleSidebar"
      @show-auth-modal="showAuthModal" 
    />
    <div class="main-container">
      <Sidebar 
        :is-mobile-open="isSidebarOpen" 
        @close="closeSidebar"
        @show-auth-modal="showAuthModal"
      />
      <main class="content" :class="{ 'sidebar-open': isSidebarOpen }">
        <router-view></router-view>
      </main>
    </div>

    <!-- Auth Modal'ı buraya taşıdık -->
    <AuthModal 
      v-if="authModalVisible"
      :mode="authModalMode"
      @close="closeAuthModal"
    />
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { useStore } from 'vuex'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Header from './components/layout/Header.vue'
import Sidebar from './components/layout/Sidebar.vue'
import AuthModal from '@/components/auth/AuthModal.vue'

export default {
  name: 'App',
  components: {
    Header,
    Sidebar,
    AuthModal
  },
  setup() {
    const store = useStore()
    const authInitialized = ref(false)
    const isSidebarOpen = ref(false)
    const authModalVisible = ref(false)
    const authModalMode = ref('login')
    
    onMounted(() => {
      const auth = getAuth()
      
      onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            await store.dispatch('auth/handleAuthStateChange', user)
          } else {
            store.commit('auth/CLEAR_USER')
            store.commit('expenses/CLEAR_EXPENSES')
            store.commit('income/CLEAR_INCOME')
            store.commit('bills/CLEAR_BILLS')
            store.commit('debts/CLEAR_DEBTS')
            store.commit('savings/CLEAR_SAVINGS')
          }
        } catch (error) {
          console.error('Auth state handling error:', error)
        } finally {
          authInitialized.value = true
        }
      })
    })

    const showAuthModal = ({ mode }) => {
      authModalMode.value = mode
      authModalVisible.value = true
      // Mobile'da sidebar'ı kapat
      if (window.innerWidth <= 768) {
        isSidebarOpen.value = false
      }
    }

    const closeAuthModal = () => {
      authModalVisible.value = false
    }

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value
    }

    const closeSidebar = () => {
      isSidebarOpen.value = false
    }

    const showEmailWarning = computed(() => {
      return store.getters['auth/isAuthenticated'] && 
             !store.getters['auth/isEmailVerified']
    })

    const resendVerificationEmail = async () => {
      const result = await store.dispatch('auth/resendVerificationEmail')
      if (result.success) {
        // Başarılı mesajı göster
      }
    }

    return {
      isSidebarOpen,
      authInitialized,
      authModalVisible,
      authModalMode,
      toggleSidebar,
      closeSidebar,
      showAuthModal,
      closeAuthModal,
      showEmailWarning,
      resendVerificationEmail
    }
  }
}
</script>

<style>
#app {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 72px);
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  padding-top: 3rem;
}

@media (max-width: 768px) {
  .main-container {
    overflow: hidden;
    position: relative;
  }
  
  .content {
    padding: 1rem;
    transition: transform 0.3s ease;
  }

  .content.sidebar-open {
    transform: translateX(280px);
  }
}

/* Modal için yeni stil */
.modal-overlay {
  z-index: 2000 !important; /* Sidebar'ın üstünde görünmesi için */
}

.email-verification-warning {
  background-color: rgba(255, 193, 7, 0.1);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 193, 7, 0.2);
}

.warning-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #856404;
}

.resend-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: #ffc107;
  border: none;
  border-radius: 8px;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.resend-btn:hover {
  background: #e0a800;
}

@media (max-width: 768px) {
  .warning-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .resend-btn {
    margin: 0;
    width: 100%;
    justify-content: center;
  }
}
</style> 