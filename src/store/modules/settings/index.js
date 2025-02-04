import { expenseAPI } from '@/services/api'

export default {
  namespaced: true,
  
  state: {
    cutoffDate: 1
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
      
      // Başlangıç: Önceki ayın kesim tarihinin ertesi günü
      let startDate = new Date(year, month - 1, cutoffDate + 1)
      
      // Önceki ayın son gününü kontrol et
      const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
      
      // Eğer kesim tarihi önceki ayın son gününden büyükse
      if (cutoffDate > prevMonthLastDay) {
        // Başlangıç tarihi bir sonraki ayın 1'i olacak
        startDate = new Date(year, month, 1)
      }
      
      // Bitiş: Seçilen ayın kesim tarihi
      let endDate = new Date(year, month, cutoffDate)
      
      // Eğer kesim tarihi seçili ayın son gününden büyükse
      const currentMonthLastDay = new Date(year, month + 1, 0).getDate()
      if (cutoffDate > currentMonthLastDay) {
        // Bitiş tarihi ayın son günü olacak
        endDate = new Date(year, month, currentMonthLastDay)
      }
      
      return {
        start: startDate,
        end: endDate
      }
    }
  }
} 