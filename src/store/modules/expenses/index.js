import { expenseAPI } from '@/services/api'

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
    DELETE_EXPENSE(state, id) {
      state.expenses = state.expenses.filter(e => e.id !== id)
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
    async deleteExpense({ commit }, { year, month, expenseId }) {
      try {
        if (!year || !Number.isInteger(month) || !expenseId) {
          throw new Error('Geçersiz silme parametreleri')
        }
        
        await expenseAPI.deleteExpense(year, month, expenseId)
        commit('DELETE_EXPENSE', expenseId)
        return true
      } catch (error) {
        commit('SET_ERROR', error.message)
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