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
    },
    UPDATE_DEBT(state, { type, amount }) {
      state.debts[type] = Number(amount)
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
    },
    async updateDebt({ commit }, { year, month, type, amount }) {
      try {
        await expenseAPI.updateMonthlyDebt(year, month, type, amount)
        commit('UPDATE_DEBT', { type, amount })
        return true
      } catch (error) {
        console.error('Borç güncellenemedi:', error)
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