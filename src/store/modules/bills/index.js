import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  state: {
    monthlyBills: {
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
    SET_MONTHLY_BILLS(state, bills) {
      state.monthlyBills = bills
    },
    UPDATE_BILL_ITEM(state, { type, amount }) {
      state.monthlyBills[type] = amount
    }
  },
  actions: {
    async fetchMonthlyBills({ commit }, { year, month }) {
      const bills = await expenseAPI.getMonthlyBills(year, month)
      commit('SET_MONTHLY_BILLS', bills)
    },
    async updateBill({ commit }, { year, month, type, amount }) {
      await expenseAPI.updateMonthlyBill(year, month, type, amount)
      commit('UPDATE_BILL_ITEM', { type, amount })
    }
  },
  getters: {
    totalBills: state => {
      return Object.values(state.monthlyBills).reduce((sum, val) => sum + val, 0)
    }
  }
} 