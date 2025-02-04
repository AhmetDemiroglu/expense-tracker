import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  state: {
    monthlyDebts: {
      creditCard: 0,
      loan: 0,
      other: 0
    }
  },
  mutations: {
    SET_MONTHLY_DEBTS(state, debts) {
      state.monthlyDebts = debts
    },
    UPDATE_DEBT_ITEM(state, { type, amount }) {
      state.monthlyDebts[type] = amount
    }
  },
  actions: {
    async fetchMonthlyDebts({ commit }, { year, month }) {
      const debts = await expenseAPI.getMonthlyDebts(year, month)
      commit('SET_MONTHLY_DEBTS', debts)
    },
    async updateDebt({ commit }, { year, month, type, amount }) {
      await expenseAPI.updateMonthlyDebt(year, month, type, amount)
      commit('UPDATE_DEBT_ITEM', { type, amount })
    }
  },
  getters: {
    totalDebts: state => {
      return Object.values(state.monthlyDebts).reduce((sum, val) => sum + val, 0)
    }
  }
} 