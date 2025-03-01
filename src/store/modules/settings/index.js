import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  
  state: {
    cutoffDate: 28 // Varsayılan olarak her ayın 28'i
  },

  mutations: {
    SET_CUTOFF_DATE(state, date) {
      state.cutoffDate = date
    }
  },

  actions: {
    async fetchCutoffDate({ commit }) {
      try {
        const date = await expenseAPI.getCutoffDate()
        commit('SET_CUTOFF_DATE', date)
        return date
      } catch (error) {
        console.error('Kesim tarihi yüklenemedi:', error)
        throw error
      }
    },

    async saveCutoffDate({ commit }, date) {
      try {
        await expenseAPI.saveCutoffDate(date)
        commit('SET_CUTOFF_DATE', date)
        return true
      } catch (error) {
        console.error('Kesim tarihi kaydedilemedi:', error)
        throw error
      }
    },

    async updateCutoffDate({ commit }, newDate) {
      try {
        await expenseAPI.updateCutoffDate(newDate)
        commit('SET_CUTOFF_DATE', newDate)
        return true
      } catch (error) {
        console.error('Kesim tarihi güncellenemedi:', error)
        throw error
      }
    }
  },

  getters: {
    // Seçilen ay için başlangıç ve bitiş tarihlerini hesapla
    getMonthRange: (state) => (year, month) => {
      const cutoffDate = state.cutoffDate
      
      // Başlangıç: Seçilen ayın 1. günü
      const startDate = new Date(year, month, 1)
      startDate.setHours(0, 0, 0, 0)
      
      // Bitiş: Seçilen ayın kesim tarihi veya ayın son günü
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
      const endDay = Math.min(cutoffDate, lastDayOfMonth)
      
      const endDate = new Date(year, month, endDay)
      endDate.setHours(23, 59, 59, 999)
      
      return {
        start: startDate,
        end: endDate
      }
    }
  }
}