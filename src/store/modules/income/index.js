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
      state.income = income || {
        salary: 0,
        rent: 0,
        other: 0
      }
    },
    UPDATE_INCOME(state, { type, amount }) {
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
    async fetchIncome({ commit, rootState }, { year, month }) {
      try {
        const user = rootState.auth.user
        if (!user) {
          console.warn('Kullanıcı girişi yapılmamış')
          return
        }

        const incomeRef = ref(db, `users/${user.uid}/income/${year}/${month}`)
        const snapshot = await get(incomeRef)
        
        const income = snapshot.exists() ? snapshot.val() : {
          salary: 0,
          rent: 0,
          other: 0
        }

        commit('SET_INCOME', income)
        return income
      } catch (error) {
        console.error('Gelir bilgileri getirilemedi:', error)
        commit('SET_INCOME', { salary: 0, rent: 0, other: 0 })
      }
    },
    async updateIncome({ commit, rootState }, { type, amount, year, month }) {
      try {
        const user = rootState.auth.user
        if (!user) throw new Error('Kullanıcı girişi yapılmamış')

        const incomeRef = ref(db, `users/${user.uid}/income/${year}/${month}`)
        
        const snapshot = await get(incomeRef)
        const currentIncome = snapshot.exists() ? snapshot.val() : {
          salary: 0,
          rent: 0,
          other: 0
        }

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
      return Object.values(state.income).reduce((total, value) => {
        return total + (Number(value) || 0)
      }, 0)
    }
  }
} 