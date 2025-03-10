import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CalendarView from '../views/CalendarView.vue'
import CalendarGrid from '../components/calendar/CalendarGrid.vue'
import ProfileView from '@/views/ProfileView.vue'
import store from '../store'
import { getAuth } from 'firebase/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: CalendarView,
    meta: { 
      requiresAuth: true,
      requiresVerification: true
    }
  },
  {
    path: '/month/:year/:month',
    name: 'month-detail',
    component: CalendarGrid,
    props: true
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Auth durumunun başlatılmasını bekleyen global guard
router.beforeEach(async (to, from, next) => {
  // Auth durumunun başlatılmasını bekle
  if (!store.getters['auth/isAuthInitialized']) {
    // Auth durumu başlatılana kadar bekle
    await new Promise(resolve => {
      const unwatch = store.watch(
        () => store.getters['auth/isAuthInitialized'],
        (newValue) => {
          if (newValue) {
            unwatch()
            resolve()
          }
        }
      )
    })
  }
  
  // Auth gerektiren sayfalar için kontrol
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      next({ name: 'login' })
    } else {
      // Email doğrulama kontrolü
      if (!user.emailVerified && to.meta.requiresVerification) {
        next({ name: 'home' })
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router