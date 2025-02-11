<template>
  <div id="app">
    <Header @toggle-sidebar="toggleSidebar" />
    <div class="main-container">
      <Sidebar :is-mobile-open="isSidebarOpen" />
      <main class="content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Header from './components/layout/Header.vue'
import Sidebar from './components/layout/Sidebar.vue'

export default {
  name: 'App',
  components: {
    Header,
    Sidebar
  },
  setup() {
    const store = useStore()
    const authInitialized = ref(false)
    
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

    return {
      isSidebarOpen: false,
      authInitialized,
      toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen
      }
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
    padding-top: 1rem;
  }
}
</style> 