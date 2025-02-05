import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  state: {
    bills: {
      phone: 0,
      internet: 0,
      water: 0,
      maintenance: 0,
      naturalGas: 0,
      electricity: 0,
      pool: 0,
      other: 0
    }
  },
  mutations: {
    SET_BILLS(state, bills) {
      state.bills = bills
    },
    UPDATE_BILL(state, { type, amount }) {
      state.bills[type] = Number(amount)
    }
  },
  actions: {
    async fetchBills({ commit }, { year, month }) {
      try {
        const bills = await expenseAPI.getMonthlyBills(year, month)
        commit('SET_BILLS', bills)
        return bills
      } catch (error) {
        console.error('Fatura bilgileri getirilemedi:', error)
        throw error
      }
    },
    async updateBill({ commit }, { year, month, type, amount }) {
      try {
        await expenseAPI.updateMonthlyBill(year, month, type, amount)
        commit('UPDATE_BILL', { type, amount })
        return true
      } catch (error) {
        console.error('Fatura güncellenemedi:', error)
        throw error
      }
    }
  },
  getters: {
    totalBills: (state) => {
      return Object.values(state.bills).reduce((sum, val) => sum + Number(val), 0)
    }
  }
} 