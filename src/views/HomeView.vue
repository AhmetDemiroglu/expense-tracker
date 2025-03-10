<template>
  <div class="home">
    <template v-if="isAuthenticated">
      <div class="header-section">
        <div class="month-selector">
          <select v-model="selectedMonth" class="select-month">
            <option v-for="(name, index) in months" :key="index" :value="index">
              {{ name }}
            </option>
          </select>
          <select v-model="selectedYear" class="select-year">
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <div class="summary-cards">
        <div class="card total-expense">
          <h3>{{ months[selectedMonth] }} Dönemi</h3>
          <div class="amount negative">{{ formatCurrency(totalExpenses) }}</div>
          <div class="period-info">
            {{ formatPeriodDates }}
          </div>
        </div>

        <div class="card remaining-limit">
          <h3>{{ months[selectedMonth] }} Dönemi Limiti</h3>
          <div :class="remainingLimitClass">{{ formatCurrency(remainingLimit) }}</div>
          <div class="limit-info">
            Dönem Geliri: {{ formatCurrency(totalIncome) }}
          </div>
        </div>

        <div class="card remaining-days">
          <h3>Dönem Bitimine Kalan</h3>
          <div class="days">{{ daysUntilCutoff }} gün</div>
          <div class="period-info">
            {{ remainingDayInfo }}
          </div>
        </div>
      </div>

      <button @click="showDetails" class="detail-button">
        Detayları Görüntüle
        <i class="fas fa-chevron-right"></i>
      </button>
    </template>
    <div v-else class="auth-required">
      <i class="fas fa-lock"></i>
      <h2>Giriş Yapmanız Gerekiyor</h2>
      <p>Bu içeriği görüntülemek için lütfen giriş yapın veya kayıt olun.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount, onActivated } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { expenseAPI } from '@/services/api'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '@/services/firebase'
import { ref as dbRef, get, set } from 'firebase/database'

const store = useStore()
const router = useRouter()
const route = useRoute()
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())
const forceUpdate = ref(0) // Hesaplamaları zorla güncellemek için kullanılacak
const authInitialized = ref(false)

// Auth state'ini izle
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

// Kesim tarihini yükle ve sayfa verilerini başlat
onMounted(async () => {
  try {
    // Auth durumunun başlatılmasını bekle
    await waitForAuthInitialized()
    
    if (isAuthenticated.value) {
      await loadSelectedMonthData()
      await loadData()
      
      // Veri yükleme tamamlandıktan sonra forceUpdate'i artır
      nextTick(() => {
        forceUpdate.value++
      })
    }
  } catch (error) {
    // Hata durumunda sessizce devam et
  }
})

// Ay ve yıl değişikliklerini izle
watch([selectedMonth, selectedYear], async (newValues, oldValues) => {
  // Eğer kullanıcı oturum açmışsa verileri yeniden yükle
  if (isAuthenticated.value) {
    // Önce seçili ayın verilerini Firebase'den al
    await loadSelectedMonthData()
    
    // Sonra diğer verileri yükle
    await loadData()
    
    // Veri yükleme tamamlandıktan sonra forceUpdate'i artır
    nextTick(() => {
      forceUpdate.value++
    })
  }
}, { immediate: false })

// Component temizleme
onBeforeUnmount(() => {
  // Auth listener'ı temizle
  // if (unsubscribeAuth.value) {
  //   unsubscribeAuth.value()
  //   unsubscribeAuth.value = null
  // }
})

// Auth durumunun başlatılmasını bekle
const waitForAuthInitialized = async () => {
  if (!store.getters['auth/isAuthInitialized']) {
    // Auth durumu başlatılana kadar bekle
    await new Promise(resolve => {
      const unwatch = store.watch(
        () => store.getters['auth/isAuthInitialized'],
        (newValue) => {
          if (newValue) {
            unwatch()
            resolve()
          }
        }
      )
    })
  }
  
  return true
}

// Seçili ayın verilerini yükle
const loadSelectedMonthData = async () => {
  try {
    // Özel ay bilgilerini başlangıçta null'a ayarla
    currentMonthCutoffDate.value = null
    
    if (!isAuthenticated.value) {
      return
    }
    
    // Kesim tarihini Firebase'den al
    await store.dispatch('settings/fetchCutoffDate')
    
    // Kullanıcı ID'sini al
    const userId = await expenseAPI.getCurrentUserId()
    if (!userId) {
      return
    }
    
    // Ay verilerini doğrudan Firebase'den al
    const monthRef = dbRef(db, `users/${userId}/months/${selectedYear.value}/${selectedMonth.value}`)
    const snapshot = await get(monthRef)
    
    if (snapshot.exists()) {
      const monthData = snapshot.val()
      
      // Eğer bu ayın kesim tarihi varsa, onu kullan
      if (monthData.cutoffDate) {
        currentMonthCutoffDate.value = new Date(monthData.cutoffDate)
      }
    } else {
      // Bu ay için kayıtlı veri bulunamadı
    }
    
    // Diğer verileri yükle
    await Promise.all([
      store.dispatch('expenses/fetchExpenses', {
        year: selectedYear.value,
        month: selectedMonth.value
      }),
      store.dispatch('income/fetchIncome', {
        year: selectedYear.value,
        month: selectedMonth.value
      }),
      store.dispatch('bills/fetchBills', {
        year: selectedYear.value,
        month: selectedMonth.value
      }),
      store.dispatch('debts/fetchDebts', {
        year: selectedYear.value,
        month: selectedMonth.value
      }),
      store.dispatch('savings/fetchSavings', {
        year: selectedYear.value,
        month: selectedMonth.value
      })
    ])
  } catch (error) {
    // Hata durumunda sessizce devam et
  }
}

// Veri yükleme fonksiyonu
const loadData = async () => {
  try {
    await Promise.all([
      store.dispatch('expenses/fetchExpenses', { 
        year: selectedYear.value.toString(), 
        month: selectedMonth.value.toString() 
      }),
      store.dispatch('income/fetchIncome', { 
        year: selectedYear.value.toString(), 
        month: selectedMonth.value.toString() 
      }),
      store.dispatch('bills/fetchBills', { 
        year: selectedYear.value.toString(), 
        month: selectedMonth.value.toString() 
      }),
      store.dispatch('savings/fetchSavings', { 
        year: selectedYear.value.toString(), 
        month: selectedMonth.value.toString() 
      })
    ])
  } catch (error) {
    // Hata durumunda sessizce devam et
  }
}

// Sayfa aktif olduğunda (başka sayfadan geri dönüldüğünde) verileri güncelle
const updatePageData = async () => {
  try {
    // Auth durumunun başlatılmasını bekle
    await waitForAuthInitialized()
    
    if (isAuthenticated.value) {
      // Önce seçili ayın verilerini Firebase'den al
      await loadSelectedMonthData()
      
      // Sonra diğer verileri yükle
      await loadData()
      
      // Veri yükleme tamamlandıktan sonra forceUpdate'i artır
      nextTick(() => {
        forceUpdate.value++
      })
    }
  } catch (error) {
    // Hata durumunda sessizce devam et
  }
}

// Sayfa aktif olduğunda (keep-alive kullanılıyorsa)
onActivated(() => {
  nextTick(() => {
    updatePageData()
  })
})

const selectedPeriod = computed(() => {
  const periodMonth = selectedMonth.value === 11 ? 0 : selectedMonth.value + 1
  const periodYear = selectedMonth.value === 11 ? selectedYear.value + 1 : selectedYear.value
  
  return {
    month: periodMonth,
    year: periodYear,
  }
})

const monthSummary = ref({
  totalExpense: 0,
  limit: 5000,
  lastUpdated: Date.now()
})

const months = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
})

// Dönem tarihlerini formatla
const formatPeriodDates = computed(() => {
  if (!isAuthenticated.value) return ''
  
  const periodDates = store.getters['settings/getMonthRange'](selectedYear.value, selectedMonth.value)
  if (!periodDates || !periodDates.start || !periodDates.end) return ''
  
  const startDate = new Date(periodDates.start)
  const endDate = new Date(periodDates.end)
  
  const startDay = startDate.getDate()
  const endDay = currentMonthCutoffDate.value ? currentMonthCutoffDate.value.getDate() : endDate.getDate()
  const startMonth = startDate.getMonth()
  const endMonth = endDate.getMonth()
  
  if (startMonth !== endMonth) {
    return `${startDay} ${months[startMonth]} - ${endDay} ${months[endMonth]} arası`
  }
  
  return `${startDay} - ${endDay} ${months[endMonth]} arası`
})

// Kesim tarihini yükle
const currentMonthCutoffDate = ref(null)
const cutoffDate = computed(() => {
  if (currentMonthCutoffDate.value) {
    return currentMonthCutoffDate.value.getDate()
  }
  
  return store.getters['settings/cutoffDate']
})

// Dönem bitimine kalan gün sayısı
const daysUntilCutoff = computed(() => {
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  const cutoffDay = cutoffDate.value
  
  const selectedMonthNum = Number(selectedMonth.value)
  const selectedYearNum = Number(selectedYear.value)
  
  if (selectedYearNum < currentYear || 
      (selectedYearNum === currentYear && selectedMonthNum < currentMonth)) {
    return 0 
  }
  
  if (selectedYearNum > currentYear || 
      (selectedYearNum === currentYear && selectedMonthNum > currentMonth)) {
    const monthDiff = (selectedYearNum - currentYear) * 12 + (selectedMonthNum - currentMonth)
    
    if (monthDiff === 1) {
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      return (lastDayOfMonth - currentDay) + cutoffDay + 1
    } else {
      const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const daysLeftInCurrentMonth = lastDayOfCurrentMonth - currentDay
      
      let totalDays = daysLeftInCurrentMonth
      
      for (let i = 1; i < monthDiff; i++) {
        const tempMonth = (currentMonth + i) % 12
        const tempYear = currentYear + Math.floor((currentMonth + i) / 12)
        const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate()
        totalDays += daysInMonth
      }
      
      totalDays += cutoffDay
      
      return totalDays + 1 
    }
  }
  
  if (currentDay < cutoffDay) {
    return (cutoffDay - currentDay) + 1 
  } 
  else {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear
    
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    return (lastDayOfMonth - currentDay) + cutoffDay + 1
  }
})

const remainingDayInfo = computed(() => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
  
  const cutoffDay = cutoffDate.value
  
  const selectedMonthName = months[selectedMonth.value]
  
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  const selectedMonthNum = Number(selectedMonth.value)
  const selectedYearNum = Number(selectedYear.value)
  
  if (selectedYearNum < currentYear || 
      (selectedYearNum === currentYear && selectedMonthNum < currentMonth)) {
    return 'Bu dönem tamamlandı'
  }
  
  return `${cutoffDay} ${selectedMonthName} hesap kesim tarihi`
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount)
}

const showDetails = () => {
  store.commit('SET_SELECTED_YEAR', selectedYear.value)
  store.commit('SET_SELECTED_MONTH', selectedMonth.value)
  
  router.push({
    name: 'month-detail',
    params: {
      year: selectedYear.value.toString(),
      month: selectedMonth.value.toString()
    }
  })
}

const totalExpenses = computed(() => {
  const bills = store.getters['bills/totalBills'] || 0
  
  const debts = store.getters['debts/totalDebts'] || 0
  
  const savings = store.state.savings.monthlySavings || 0
  
  return bills + debts + savings
})

const totalIncome = computed(() => store.getters['income/totalIncome'] || 0)

const totalBills = computed(() => store.getters['bills/totalBills'] || 0)
const totalDebts = computed(() => store.getters['debts/totalDebts'] || 0)
const savingsGoal = computed(() => store.getters['savings/currentSavings'] || 0)

const remainingLimit = computed(() => {
  return totalIncome.value - totalExpenses.value
})

const remainingLimitClass = computed(() => {
  return {
    'amount': true,
    'positive': remainingLimit.value > 0,
    'negative': remainingLimit.value < 0
  }
})
</script>

<style scoped>
.home {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.month-selector {
  display: flex;
  gap: 1rem;
}

.select-month,
.select-year {
  padding: 0.75rem;
  border: 1px solid rgba(0, 59, 92, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  color: #003B5C;
  cursor: pointer;
}

.cutoff-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.cutoff-label {
  color: #666;
}

.cutoff-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cutoff-value:hover {
  background-color: rgba(0, 59, 92, 0.05);
}

.edit-icon {
  font-size: 0.8rem;
  color: #666;
}

.cutoff-select {
  padding: 0.25rem;
  border: 1px solid rgba(0, 59, 92, 0.2);
  border-radius: 4px;
  width: 60px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 59, 92, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.card h3 {
  color: #003B5C;
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.amount {
  font-size: 2rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.amount.positive {
  color: #00B2A9;
}

.amount.negative {
  color: #dc3545;
}

.limit-info {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.days {
  font-size: 2rem;
  font-weight: 600;
  color: #00B2A9;
}

.detail-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  padding: 1rem 2rem;
  background-color: #003B5C;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-button:hover {
  background-color: #004b73;
  transform: translateY(-2px);
}

.period-info {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
}

.auth-required {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.auth-required i {
  font-size: 3rem;
  color: #ffc107;
  margin-bottom: 1rem;
}

.auth-required h2 {
  color: #003B5C;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>