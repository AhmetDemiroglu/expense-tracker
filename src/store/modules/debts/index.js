import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  state: {
    debts: {
      creditCard: 0,
      loan: 0,
      other: 0
    }
  },
  mutations: {
    SET_DEBTS(state, debts) {
      state.debts = debts
    }
  },
  actions: {
    async fetchDebts({ commit }, { year, month }) {
      try {
        const debts = await expenseAPI.getMonthlyDebts(year, month)
        commit('SET_DEBTS', debts)
        return debts
      } catch (error) {
        console.error('Borç bilgileri getirilemedi:', error)
        throw error
      }
    }
  },
  getters: {
    totalDebts: (state) => {
      return Object.values(state.debts).reduce((sum, val) => sum + Number(val), 0)
    }
  }
} 