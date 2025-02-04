import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  state: {
    monthlyIncome: {
      salary: 0,
      rent: 0,
      other: 0
    }
  },
  mutations: {
    SET_MONTHLY_INCOME(state, income) {
      state.monthlyIncome = income
    },
    UPDATE_INCOME_ITEM(state, { type, amount }) {
      state.monthlyIncome[type] = amount
    }
  },
  actions: {
    async fetchMonthlyIncome({ commit }, { year, month }) {
      const income = await expenseAPI.getMonthlyIncome(year, month)
      commit('SET_MONTHLY_INCOME', income)
    },
    async updateIncome({ commit }, { year, month, type, amount }) {
      await expenseAPI.updateMonthlyIncome(year, month, type, amount)
      commit('UPDATE_INCOME_ITEM', { type, amount })
    }
  },
  getters: {
    totalIncome: state => {
      return Object.values(state.monthlyIncome).reduce((sum, val) => sum + val, 0)
    }
  }
} 