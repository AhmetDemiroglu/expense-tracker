import { expenseAPI } from '@/services/api'
import { getAuth } from 'firebase/auth'
import { ref, remove } from 'firebase/database'
import { db } from '@/services/firebase'

export default {
  namespaced: true,
  state: {
    expenses: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_EXPENSES(state, expenses) {
      state.expenses = expenses
    },
    ADD_EXPENSE(state, expense) {
      state.expenses.push(expense)
    },
    UPDATE_EXPENSE(state, { id, expense }) {
      const index = state.expenses.findIndex(e => e.id === id)
      if (index !== -1) {
        state.expenses[index] = { ...expense, id }
      }
    },
    DELETE_EXPENSE(state, expenseId) {
      state.expenses = state.expenses.filter(expense => expense.id !== expenseId)
    },
    CLEAR_EXPENSES(state) {
      state.expenses = []
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchExpenses({ commit }, { year, month }) {
      try {
        commit('SET_LOADING', true)
        const expenses = await expenseAPI.getExpenses(year, month)
        commit('SET_EXPENSES', expenses)
      } catch (error) {
        console.error('Harcamalar getirilemedi:', error)
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async addExpense({ commit, dispatch }, { year, month, expense }) {
      try {
        commit('SET_LOADING', true)
        await expenseAPI.addExpense(year, month, expense)
        // Listeyi yenile
        await dispatch('fetchExpenses', { year, month })
      } catch (error) {
        console.error('Harcama eklenemedi:', error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateExpense({ commit }, { id, expense }) {
      try {
        await expenseAPI.updateExpense(id, expense)
        commit('UPDATE_EXPENSE', { id, expense })
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    async deleteExpense({ commit, rootState }, { year, month, expenseId }) {
      try {
        if (!year || !month || !expenseId) {
          throw new Error('Geçersiz silme parametreleri')
        }

        const auth = getAuth()
        const user = auth.currentUser
        if (!user) throw new Error('Kullanıcı girişi yapılmamış')

        // Firebase'den silme
        const expenseRef = ref(db, `users/${user.uid}/expenses/${year}/${month}/${expenseId}`)
        await remove(expenseRef)

        // Store'dan silme
        commit('DELETE_EXPENSE', expenseId)
      } catch (error) {
        console.error('Harcama silinirken hata oluştu:', error)
        throw error
      }
    }
  },
  getters: {
    totalExpenses: state => {
      return state.expenses.reduce((total, expense) => total + Number(expense.amount), 0)
    }
  }
} 