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
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  deleteUser
} from 'firebase/auth'

export const expenseAPI = {
  // Kullanıcı ID'sini al
  getCurrentUserId() {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return null // Hata fırlatmak yerine null dön
    return user.uid
  },

  // Ay bilgilerini getir
  async getMonthSummary(year, month) {
    const userId = this.getCurrentUserId()
    const monthRef = ref(db, `users/${userId}/months/${year}/${month}`)
    const snapshot = await get(monthRef)
    return snapshot.exists() ? snapshot.val() : {
      totalExpense: 0,
      limit: 5000,
      cutoffDate: null,
      periodStartDate: null,
      lastUpdated: Date.now()
    }
  },

  // Ay limitini güncelle
  async updateMonthLimit(year, month, limit) {
    const userId = this.getCurrentUserId()
    const monthRef = ref(db, `users/${userId}/months/${year}/${month}`)
    return await update(monthRef, { limit })
  },

  // Harcamaları getir
  async getExpenses(year, month) {
    const userId = this.getCurrentUserId()
    const expensesRef = ref(db, `users/${userId}/expenses/${year}/${month}`)
    const snapshot = await get(expensesRef)
    
    if (snapshot.exists()) {
      const expenses = []
      snapshot.forEach((childSnapshot) => {
        expenses.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        })
      })
      return expenses
    }
    return []
  },

  // Yeni harcama ekle
  async addExpense(year, month, expense) {
    try {
      const userId = this.getCurrentUserId()
      const expensesRef = ref(db, `users/${userId}/expenses/${year}/${month}`)
      const newExpenseRef = push(expensesRef)
      
      // Tarihi doğru formatta hazırla
      const expenseDate = new Date(expense.date)
      const formattedExpense = {
        ...expense,
        date: expenseDate.toISOString(), // ISO string formatında kaydet
        expenseDate: {
          day: expenseDate.getDate(),
          month: expenseDate.getMonth(),
          year: expenseDate.getFullYear()
        },
        createdAt: Date.now()
      }

      // Harcamayı ekle
      await set(newExpenseRef, formattedExpense)

      // Ay özetini güncelle
      const monthRef = ref(db, `users/${userId}/months/${year}/${month}`)
      const monthSnapshot = await get(monthRef)
      const currentTotal = monthSnapshot.exists() ? monthSnapshot.val().totalExpense || 0 : 0
      
      await update(monthRef, {
        totalExpense: currentTotal + Number(expense.amount),
        lastUpdated: Date.now()
      })

      return formattedExpense
    } catch (error) {
      console.error('Harcama eklenemedi:', error)
      throw error
    }
  },

  // Harcama güncelle
  async updateExpense(year, month, expenseId, expense) {
    const userId = this.getCurrentUserId()
    const expenseRef = ref(db, `users/${userId}/expenses/${year}/${month}/${expenseId}`)
    
    // Eski tutarı al
    const oldSnapshot = await get(expenseRef)
    const oldAmount = oldSnapshot.exists() ? oldSnapshot.val().amount : 0
    
    // Harcamayı güncelle
    await update(expenseRef, {
      ...expense,
      updatedAt: Date.now()
    })

    // Ay özetini güncelle
    const monthRef = ref(db, `users/${userId}/months/${year}/${month}`)
    const monthSnapshot = await get(monthRef)
    const currentTotal = monthSnapshot.exists() ? monthSnapshot.val().totalExpense || 0 : 0
    
    await update(monthRef, {
      totalExpense: currentTotal - oldAmount + Number(expense.amount),
      lastUpdated: Date.now()
    })
  },

  // Harcama sil
  async deleteExpense(year, month, expenseId) {
    const userId = this.getCurrentUserId()
    const expenseRef = ref(db, `users/${userId}/expenses/${year}/${month}/${expenseId}`)
    
    // Silinecek harcamanın tutarını al
    const snapshot = await get(expenseRef)
    const amount = snapshot.exists() ? snapshot.val().amount : 0
    
    // Harcamayı sil
    await remove(expenseRef)

    // Ay özetini güncelle
    const monthRef = ref(db, `users/${userId}/months/${year}/${month}`)
    const monthSnapshot = await get(monthRef)
    const currentTotal = monthSnapshot.exists() ? monthSnapshot.val().totalExpense || 0 : 0
    
    await update(monthRef, {
      totalExpense: currentTotal - amount,
      lastUpdated: Date.now()
    })
  },

  // Gelir metodları
  async getMonthlyIncome(year, month) {
    const userId = this.getCurrentUserId()
    if (!userId) return null // Kullanıcı yoksa null dön
    
    try {
      const incomeRef = ref(db, `users/${userId}/income/${year}/${month}`)
      const snapshot = await get(incomeRef)
      return snapshot.val()
    } catch (error) {
      console.error('Gelir bilgileri getirilemedi:', error)
      throw error
    }
  },

  async updateMonthlyIncome(year, month, type, amount) {
    try {
      const userId = this.getCurrentUserId()
      const incomeRef = ref(db, `users/${userId}/income/${year}/${month}`)
      await update(incomeRef, { [type]: Number(amount) })
      return true
    } catch (error) {
      console.error('Gelir güncellenemedi:', error)
      throw error
    }
  },

  // Fatura metodları
  async getMonthlyBills(year, month) {
    const userId = this.getCurrentUserId()
    const billsRef = ref(db, `users/${userId}/bills/${year}/${month}`)
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
    const userId = this.getCurrentUserId()
    const billsRef = ref(db, `users/${userId}/bills/${year}/${month}`)
    return await update(billsRef, { [type]: amount })
  },

  // Borç metodları
  async getMonthlyDebts(year, month) {
    const userId = this.getCurrentUserId()
    const debtsRef = ref(db, `users/${userId}/debts/${year}/${month}`)
    const snapshot = await get(debtsRef)
    return snapshot.exists() ? snapshot.val() : {
      creditCard: 0,
      loan: 0,
      other: 0
    }
  },

  async updateMonthlyDebt(year, month, type, amount) {
    const userId = this.getCurrentUserId()
    const debtsRef = ref(db, `users/${userId}/debts/${year}/${month}`)
    return await update(debtsRef, { [type]: amount })
  },

  // Birikim metodları
  async getMonthlySavings(year, month) {
    const userId = this.getCurrentUserId()
    const savingsRef = ref(db, `users/${userId}/savings/${year}/${month}`)
    const snapshot = await get(savingsRef)
    return snapshot.exists() ? snapshot.val() : 0
  },

  async updateMonthlySavings(year, month, amount) {
    const userId = this.getCurrentUserId()
    const savingsRef = ref(db, `users/${userId}/savings/${year}/${month}`)
    return await set(savingsRef, amount)
  },

  // Ay kesim tarihlerini güncelle
  async updateMonthDates(year, month, { cutoffDate, periodStartDate }) {
    const userId = this.getCurrentUserId()
    const monthRef = ref(db, `users/${userId}/months/${year}/${month}`)
    return await update(monthRef, {
      cutoffDate,
      periodStartDate,
      lastUpdated: Date.now()
    })
  },

  // Kesim tarihi işlemleri
  async saveCutoffDate(date) {
    try {
      const userId = this.getCurrentUserId()
      const settingsRef = ref(db, `users/${userId}/settings/cutoffDate`)
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
      const userId = this.getCurrentUserId()
      const settingsRef = ref(db, `users/${userId}/settings/cutoffDate`)
      const snapshot = await get(settingsRef)
      return snapshot.exists() ? snapshot.val().date : 1 // Default 1
    } catch (error) {
      console.error('Kesim tarihi getirilemedi:', error)
      throw error
    }
  },

  async updateCutoffDate(newDate) {
    try {
      const userId = this.getCurrentUserId()
      const settingsRef = ref(db, `users/${userId}/settings/cutoffDate`)
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
      const userId = this.getCurrentUserId()
      const monthRef = ref(db, `users/${userId}/months/${year}/${month}`)
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
      const userId = this.getCurrentUserId()
      const monthRef = ref(db, `users/${userId}/months/${year}/${month}`)
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
      const userId = this.getCurrentUserId()
      const expensesRef = ref(db, `users/${userId}/expenses/${year}/${month}`)
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
  },

  // Auth metodları
  async register({ email, password, displayName }) {
    try {
      const auth = getAuth()
      
      // Firebase Auth'da kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Kullanıcı profilini güncelle
      await updateProfile(userCredential.user, { displayName })
      
      // Realtime Database'de kullanıcı verilerini oluştur
      const userRef = ref(db, `users/${userCredential.user.uid}`)
      await set(userRef, {
        email,
        displayName,
        createdAt: Date.now(),
        settings: {
          currency: 'TRY',
          language: 'tr',
          defaultLimit: 5000
        }
      })

      // Kullanıcıya özel veri yapısını oluştur
      const userDataRef = ref(db, `users/${userCredential.user.uid}/data`)
      await set(userDataRef, {
        expenses: {},
        months: {},
        bills: {},
        debts: {},
        savings: {}
      })

      return userCredential.user
    } catch (error) {
      console.error('Kayıt hatası:', error)
      throw error
    }
  },

  async login({ email, password }) {
    try {
      const auth = getAuth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Kullanıcı verilerini getir
      const userRef = ref(db, `users/${userCredential.user.uid}`)
      const snapshot = await get(userRef)
      
      if (!snapshot.exists()) {
        // Eğer kullanıcı verileri yoksa oluştur
        await set(userRef, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          lastLogin: Date.now()
        })
      } else {
        // Son giriş tarihini güncelle
        await update(userRef, {
          lastLogin: Date.now()
        })
      }

      return userCredential.user
    } catch (error) {
      console.error('Giriş hatası:', error)
      throw error
    }
  },

  async logout() {
    try {
      const auth = getAuth()
      await signOut(auth)
    } catch (error) {
      console.error('Çıkış hatası:', error)
      throw error
    }
  },

  // Kullanıcı ayarlarını getir
  async getUserSettings() {
    const userId = this.getCurrentUserId()
    const settingsRef = ref(db, `users/${userId}/settings`)
    const snapshot = await get(settingsRef)
    return snapshot.exists() ? snapshot.val() : {
      currency: 'TRY',
      language: 'tr',
      defaultLimit: 5000
    }
  },

  // Kullanıcı ayarlarını güncelle
  async updateUserSettings(settings) {
    const userId = this.getCurrentUserId()
    const settingsRef = ref(db, `users/${userId}/settings`)
    return await update(settingsRef, settings)
  },

  // Kullanıcıyı ve tüm verilerini sil
  async deleteAccount() {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      
      if (!user) throw new Error('Kullanıcı girişi gerekli')

      // Önce Realtime Database'den kullanıcı verilerini sil
      const userRef = ref(db, `users/${user.uid}`)
      await remove(userRef)

      // Sonra Authentication'dan kullanıcıyı sil
      await deleteUser(user)

      return true
    } catch (error) {
      console.error('Hesap silinemedi:', error)
      throw error
    }
  }
} 