import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  state: {
    monthlySavings: 0
  },
  mutations: {
    SET_MONTHLY_SAVINGS(state, amount) {
      state.monthlySavings = amount
    }
  },
  actions: {
    async fetchMonthlySavings({ commit }, { year, month }) {
      const savings = await expenseAPI.getMonthlySavings(year, month)
      commit('SET_MONTHLY_SAVINGS', savings)
    },
    async updateSavings({ commit }, { year, month, amount }) {
      await expenseAPI.updateMonthlySavings(year, month, amount)
      commit('SET_MONTHLY_SAVINGS', amount)
    }
  }
} 