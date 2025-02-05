import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  state: {
    monthlySavings: 0
  },
  mutations: {
    SET_SAVINGS(state, amount) {
      state.monthlySavings = Number(amount)
    }
  },
  actions: {
    async fetchSavings({ commit }, { year, month }) {
      try {
        const savings = await expenseAPI.getMonthlySavings(year, month)
        commit('SET_SAVINGS', savings)
        return savings
      } catch (error) {
        console.error('Birikim bilgileri getirilemedi:', error)
        throw error
      }
    },
    async updateSavings({ commit }, { year, month, amount }) {
      await expenseAPI.updateMonthlySavings(year, month, amount)
      commit('SET_SAVINGS', amount)
    }
  }
} 