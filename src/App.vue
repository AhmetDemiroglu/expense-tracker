<template>
  <div id="app">
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
import { onMounted, ref } from 'vue'
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

    return {
      isSidebarOpen,
      authInitialized,
      authModalVisible,
      authModalMode,
      toggleSidebar,
      closeSidebar,
      showAuthModal,
      closeAuthModal
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
</style> 