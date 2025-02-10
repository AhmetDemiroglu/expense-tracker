import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import store from './store/index.js'
import './assets/styles/modal.css'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

// Toast bildirimleri için
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(Toast)

// Prodüksiyon ortamında konsol mesajlarını kapat
if (process.env.NODE_ENV === 'production') {
  // Tüm konsol mesajlarını engelle
  window.console = {
    log: () => {},
    error: () => {},
    warn: () => {},
    info: () => {},
    debug: () => {}
  }
}

// Firebase auth persistence ayarı
const auth = getAuth()
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Auth persistence error:', error)
  })

app.mount('#app') 