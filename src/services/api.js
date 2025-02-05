import { db } from './firebase'
import { 
  ref,
  set,
  push,
  get,
  update,
  remove,
  query,
  orderByChild,
  startAt,
  endAt
} from 'firebase/database'

export const expenseAPI = {
  // Ay bilgilerini getir
  async getMonthSummary(year, month) {
    const monthRef = ref(db, `months/${year}/${month}`)
    const snapshot = await get(monthRef)
    return snapshot.exists() ? snapshot.val() : {
      totalExpense: 0,
      limit: 5000,
      cutoffDate: null, // Hesap kesim tarihi
      periodStartDate: null, // Dönem başlangıç tarihi
      lastUpdated: Date.now()
    }
  },

  // Ay limitini güncelle
  async updateMonthLimit(year, month, limit) {
    const monthRef = ref(db, `months/${year}/${month}`)
    return await update(monthRef, { limit })
  },

  // Harcamaları getir
  async getExpenses(year, month) {
    // Seçili ayın ilk ve son gününü bul
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Takvimde görünen ilk günü bul (önceki aydan görünenler için)
    const firstDayOfWeek = firstDay.getDay() || 7
    const firstVisibleDate = new Date(year, month, 1 - (firstDayOfWeek - 1))
    
    // Takvimde görünen son günü bul (sonraki aydan görünenler için)
    const lastDayOfWeek = lastDay.getDay() || 7
    const remainingDays = 7 - lastDayOfWeek
    const lastVisibleDate = new Date(year, month + 1, remainingDays)
    
    // Görünen tüm ayların harcamalarını getir
    const expenses = []
    const months = new Set()
    
    // Görünen tarih aralığındaki tüm ayları belirle
    let currentDate = new Date(firstVisibleDate)
    while (currentDate <= lastVisibleDate) {
      months.add(`${currentDate.getFullYear()}/${currentDate.getMonth()}`)
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Her ayın harcamalarını getir
    for (const monthKey of months) {
      const [expenseYear, expenseMonth] = monthKey.split('/')
      const expensesRef = ref(db, `expenses/${expenseYear}/${expenseMonth}`)
      const snapshot = await get(expensesRef)
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const expenseData = childSnapshot.val()
          expenses.push({
            id: childSnapshot.key,
            ...expenseData
          })
        })
      }
    }

    return expenses
  },

  // Yeni harcama ekle
  async addExpense(year, month, expense) {
    const expenseDate = new Date(expense.date)
    
    // Harcamayı kendi ayına kaydet
    const expenseMonth = expenseDate.getMonth()
    const expenseYear = expenseDate.getFullYear()
    const expensesRef = ref(db, `expenses/${expenseYear}/${expenseMonth}`)
    
    const newExpenseRef = push(expensesRef)
    
    await set(newExpenseRef, {
      amount: expense.amount,
      description: expense.description,
      date: expense.date.getTime(),
      expenseDate: {
        day: expenseDate.getDate(),
        month: expenseMonth,
        year: expenseYear
      }
    })

    // Dönem toplamını güncelle
    const monthRef = ref(db, `months/${year}/${month}`)
    const monthSnapshot = await get(monthRef)
    const currentTotal = monthSnapshot.exists() ? monthSnapshot.val().totalExpense || 0 : 0

    await update(monthRef, {
      totalExpense: currentTotal + expense.amount,
      lastUpdated: Date.now()
    })

    return {
      id: newExpenseRef.key,
      ...expense,
      date: expense.date.getTime(),
      expenseDate: {
        day: expenseDate.getDate(),
        month: expenseMonth,
        year: expenseYear
      }
    }
  },

  // Harcama güncelle
  async updateExpense(year, month, id, expense) {
    const expenseRef = ref(db, `expenses/${year}/${month}/${id}`)
    return await update(expenseRef, expense)
  },

  // Harcama sil
  async deleteExpense(year, month, expenseId) {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !expenseId) {
      throw new Error('Geçersiz silme parametreleri')
    }
  
    try {
      const path = `expenses/${year}/${month}/${expenseId}`
    
      const expenseRef = ref(db, path)
      await remove(expenseRef)
      
      return true
    } catch (error) {
      console.error('Firebase silme hatası:', error)
      throw error
    }
  },

  // Gelir metodları
  async getMonthlyIncome(year, month) {
    try {
      // Eski yapıya göre düzeltildi: income/year/month
      const incomeRef = ref(db, `income/${year}/${month}`)
      const snapshot = await get(incomeRef)
      return snapshot.exists() ? snapshot.val() : {
        salary: 0,
        rent: 0,
        other: 0
      }
    } catch (error) {
      console.error('Gelir bilgileri getirilemedi:', error)
      throw error
    }
  },

  async updateMonthlyIncome(year, month, type, amount) {
    try {
      // Eski yapıya göre düzeltildi: income/year/month
      const incomeRef = ref(db, `income/${year}/${month}`)
      await update(incomeRef, { [type]: Number(amount) })
      return true
    } catch (error) {
      console.error('Gelir güncellenemedi:', error)
      throw error
    }
  },

  // Fatura metodları
  async getMonthlyBills(year, month) {
    const billsRef = ref(db, `bills/${year}/${month}`)
    const snapshot = await get(billsRef)
    return snapshot.exists() ? snapshot.val() : {
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

  async updateMonthlyBill(year, month, type, amount) {
    const billsRef = ref(db, `bills/${year}/${month}`)
    return await update(billsRef, { [type]: amount })
  },

  // Borç metodları
  async getMonthlyDebts(year, month) {
    const debtsRef = ref(db, `debts/${year}/${month}`)
    const snapshot = await get(debtsRef)
    return snapshot.exists() ? snapshot.val() : {
      creditCard: 0,
      loan: 0,
      other: 0
    }
  },

  async updateMonthlyDebt(year, month, type, amount) {
    const debtsRef = ref(db, `debts/${year}/${month}`)
    return await update(debtsRef, { [type]: amount })
  },

  // Birikim metodları
  async getMonthlySavings(year, month) {
    const savingsRef = ref(db, `savings/${year}/${month}`)
    const snapshot = await get(savingsRef)
    return snapshot.exists() ? snapshot.val() : 0
  },

  async updateMonthlySavings(year, month, amount) {
    const savingsRef = ref(db, `savings/${year}/${month}`)
    return await set(savingsRef, amount)
  },

  // Ay kesim tarihlerini güncelle
  async updateMonthDates(year, month, { cutoffDate, periodStartDate }) {
    const monthRef = ref(db, `months/${year}/${month}`)
    return await update(monthRef, {
      cutoffDate,
      periodStartDate,
      lastUpdated: Date.now()
    })
  },

  // Kesim tarihi işlemleri
  async saveCutoffDate(date) {
    try {
      const settingsRef = ref(db, 'settings/cutoffDate')
      await set(settingsRef, {
        date: date,
        updatedAt: new Date().getTime()
      })
      return true
    } catch (error) {
      console.error('Kesim tarihi kaydedilemedi:', error)
      throw error
    }
  },

  async getCutoffDate() {
    try {
      const settingsRef = ref(db, 'settings/cutoffDate')
      const snapshot = await get(settingsRef)
      return snapshot.exists() ? snapshot.val().date : 1 // Default 1
    } catch (error) {
      console.error('Kesim tarihi getirilemedi:', error)
      throw error
    }
  },

  async updateCutoffDate(newDate) {
    try {
      const settingsRef = ref(db, 'settings/cutoffDate')
      await update(settingsRef, {
        date: newDate,
        updatedAt: new Date().getTime()
      })
      return true
    } catch (error) {
      console.error('Kesim tarihi güncellenemedi:', error)
      throw error
    }
  },

  async saveMonthSettings(year, month, settings) {
    try {
      const monthRef = ref(db, `months/${year}/${month}`)
      await update(monthRef, {
        ...settings,
        lastUpdated: Date.now()
      })
      return true
    } catch (error) {
      console.error('Ay ayarları kaydedilemedi:', error)
      throw error
    }
  },

  async getMonthSettings(year, month) {
    try {
      const monthRef = ref(db, `months/${year}/${month}`)
      const snapshot = await get(monthRef)
      return snapshot.exists() ? snapshot.val() : {
        cutoffDate: null,
        periodStartDate: null,
        lastUpdated: null
      }
    } catch (error) {
      console.error('Ay ayarları getirilemedi:', error)
      throw error
    }
  },

  async getMonthlyExpenses(year, month) {
    try {
      const expensesRef = ref(db, `expenses/${year}/${month}`)
      const snapshot = await get(expensesRef)
      
      if (snapshot.exists()) {
        const expenses = []
        snapshot.forEach((childSnapshot) => {
          const expense = childSnapshot.val()
          // Sadece ilgili aya ait harcamaları al
          const expenseDate = new Date(expense.date)
          if (expenseDate.getMonth() === Number(month) && 
              expenseDate.getFullYear() === Number(year)) {
            expenses.push({
              id: childSnapshot.key,
              ...expense
            })
          }
        })
        return expenses
      }
      return []
    } catch (error) {
      console.error('Harcamalar getirilemedi:', error)
      throw error
    }
  }
} 