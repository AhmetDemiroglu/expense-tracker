import { auth } from '@/services/firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

export default {
  namespaced: true,
  state: {
    user: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async login({ commit }, { email, password }) {
      commit('SET_LOADING', true)
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        commit('SET_USER', userCredential.user)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    }
    // Diğer auth aksiyonları...
  }
} 