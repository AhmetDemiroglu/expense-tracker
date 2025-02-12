import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CalendarView from '../views/CalendarView.vue'
import CalendarGrid from '../components/calendar/CalendarGrid.vue'
import ProfileView from '@/views/ProfileView.vue'
import { getAuth } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
})

const requireAuth = async (to, from, next) => {
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) {
    next({ name: 'login' })
    return
  }

  // Email doğrulama kontrolü
  if (!user.emailVerified && to.meta.requiresVerification) {
    next({ name: 'home' })
    return
  }

  next()
}

router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router 