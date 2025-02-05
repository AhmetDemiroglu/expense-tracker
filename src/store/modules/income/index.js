import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  state: {
    income: {
      salary: 0,
      rent: 0,
      other: 0
    }
  },
  mutations: {
    SET_INCOME(state, income) {
      state.income = income
    },
    UPDATE_INCOME(state, { type, amount }) {
      state.income[type] = Number(amount)
    }
  },
  actions: {
    async fetchIncome({ commit }, { year, month }) {
      try {
        const income = await expenseAPI.getMonthlyIncome(year, month)
        commit('SET_INCOME', income)
        return income
      } catch (error) {
        console.error('Gelir bilgileri getirilemedi:', error)
        throw error
      }
    },
    async updateIncome({ commit }, { year, month, type, amount }) {
      try {
        await expenseAPI.updateMonthlyIncome(year, month, type, amount)
        commit('UPDATE_INCOME', { type, amount })
        return true
      } catch (error) {
        console.error('Gelir güncellenemedi:', error)
        throw error
      }
    }
  },
  getters: {
    totalIncome: (state) => {
      return Object.values(state.income).reduce((sum, val) => sum + Number(val), 0)
    }
  }
} 