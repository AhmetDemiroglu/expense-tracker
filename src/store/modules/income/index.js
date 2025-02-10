import { expenseAPI } from '@/services/api'
import { ref, get, set } from 'firebase/database'
import { db } from '@/services/firebase'

export default {
  namespaced: true,
  state: () => ({
    income: {
      salary: 0,
      rent: 0,
      other: 0
    }
  }),
  mutations: {
    SET_INCOME(state, income) {
      state.income = { ...income }
    },
    UPDATE_INCOME(state, { type, amount }) {
      if (!state.income) {
        state.income = {
          salary: 0,
          rent: 0,
          other: 0
        }
      }
      state.income[type] = Number(amount)
    },
    CLEAR_INCOME(state) {
      state.income = {
        salary: 0,
        rent: 0,
        other: 0
      }
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
    async updateIncome({ commit, rootState }, { type, amount }) {
      try {
        const user = rootState.auth.user
        if (!user) throw new Error('Kullanıcı girişi yapılmamış')

        const year = new Date().getFullYear()
        const month = new Date().getMonth() + 1

        // Kullanıcının uid'si altına kaydet
        const incomeRef = ref(db, `users/${user.uid}/income/${year}/${month}`)
        
        // Önce mevcut veriyi al
        const snapshot = await get(incomeRef)
        const currentIncome = snapshot.exists() ? snapshot.val() : {
          salary: 0,
          rent: 0,
          other: 0
        }

        // Güncelle
        const updates = {
          ...currentIncome,
          [type]: Number(amount)
        }

        await set(incomeRef, updates)
        commit('UPDATE_INCOME', { type, amount: Number(amount) })
      } catch (error) {
        console.error('Gelir güncellenemedi:', error)
        throw error
      }
    }
  },
  getters: {
    totalIncome: (state) => {
      if (!state.income) return 0
      return Object.values(state.income).reduce((total, value) => {
        return total + (Number(value) || 0)
      }, 0)
    }
  }
} 