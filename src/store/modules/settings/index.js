import { expenseAPI } from '@/services/api'

const DEFAULT_CUTOFF_DATE = 25

export default {
  namespaced: true,
  
  state: {
    cutoffDate: DEFAULT_CUTOFF_DATE // Varsayılan olarak her ayın 28'i
  },

  mutations: {
    SET_CUTOFF_DATE(state, date) {
      state.cutoffDate = date
    }
  },

  actions: {
    // Kesim tarihini Firebase'den al
    async fetchCutoffDate({ commit }) {
      try {
        const cutoffDate = await expenseAPI.getCutoffDate()
        commit('SET_CUTOFF_DATE', cutoffDate)
        return cutoffDate
      } catch (error) {
        // Hata durumunda varsayılan değeri kullan
        commit('SET_CUTOFF_DATE', DEFAULT_CUTOFF_DATE)
        return DEFAULT_CUTOFF_DATE
      }
    },

    async saveCutoffDate({ commit }, date) {
      try {
        await expenseAPI.saveCutoffDate(date)
        commit('SET_CUTOFF_DATE', date)
        return true
      } catch (error) {
        throw error
      }
    },

    async updateCutoffDate({ commit }, newDate) {
      try {
        await expenseAPI.updateCutoffDate(newDate)
        commit('SET_CUTOFF_DATE', newDate)
        return true
      } catch (error) {
        throw error
      }
    }
  },

  getters: {
    // Kesim tarihini al
    cutoffDate: state => state.cutoffDate,
    
    // Kesim tarihine göre ay aralığını hesapla
    getMonthRange: (state) => (year, month) => {
      const cutoffDate = state.cutoffDate
      
      // Ay ve yıl değerlerini sayıya çevir
      const numericYear = Number(year)
      const numericMonth = Number(month)
      
      // Kesim günü ayın son gününden büyükse, ayın son gününü kullan
      const daysInMonth = new Date(numericYear, numericMonth + 1, 0).getDate()
      const actualCutoffDay = Math.min(cutoffDate, daysInMonth)
      
      // Dönem başlangıç tarihi (önceki ayın kesim günü + 1)
      let startDate = new Date(numericYear, numericMonth, 1)
      if (actualCutoffDay < daysInMonth) {
        // Eğer kesim günü ayın son gününden küçükse, dönem başlangıcı önceki ayın kesim gününden sonraki gün
        startDate = new Date(numericYear, numericMonth - 1, actualCutoffDay + 1)
      } else {
        // Eğer kesim günü ayın son günüyse, dönem başlangıcı ayın ilk günü
        startDate = new Date(numericYear, numericMonth, 1)
      }
      
      // Dönem bitiş tarihi (bu ayın kesim günü)
      const endDate = new Date(numericYear, numericMonth, actualCutoffDay)
      endDate.setHours(23, 59, 59, 999) // Günün sonuna ayarla
      
      return {
        start: startDate,
        end: endDate,
        periodStartDate: startDate.toISOString(),
        cutoffDate: endDate.toISOString(),
        cutoffDay: actualCutoffDay
      }
    }
  }
}