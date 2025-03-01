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
          <div class="days">{{ remainingDays }} gün</div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { expenseAPI } from '@/services/api'

const store = useStore()
const router = useRouter()
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())

// Auth state'ini izle
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

// Kesim tarihini yükle
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      await store.dispatch('settings/fetchCutoffDate')
    } catch (error) {
      console.error('Kesim tarihi yüklenemedi:', error)
    }
  }
})

// Veri yükleme fonksiyonu
const loadData = async () => {
  if (!isAuthenticated.value) return

  try {
    await Promise.all([
      store.dispatch('income/fetchIncome', {
        year: selectedYear.value,
        month: selectedMonth.value 
      }),
      store.dispatch('debts/fetchDebts', {
        year: selectedYear.value,
        month: selectedMonth.value 
      }),
      store.dispatch('bills/fetchBills', {
        year: selectedYear.value,
        month: selectedMonth.value 
      }),
      store.dispatch('savings/fetchSavings', {
        year: selectedYear.value,
        month: selectedMonth.value 
      })
    ])
  } catch (error) {
    console.error('Veriler yüklenirken hata oluştu:', error)
  }
}

// Auth state değiştiğinde verileri yükle
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    loadData()
  }
})

// Ay veya yıl değiştiğinde verileri yükle
watch([selectedMonth, selectedYear], () => {
  if (isAuthenticated.value) {
    loadData()
  }
})

onMounted(() => {
  if (isAuthenticated.value) {
    loadData()
  }
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
  
  // Tarihleri doğru sırayla göster (küçükten büyüğe)
  const startDate = new Date(periodDates.start)
  const endDate = new Date(periodDates.end)
  
  const startDay = startDate.getDate()
  const endDay = endDate.getDate()
  const startMonth = startDate.getMonth()
  const endMonth = endDate.getMonth()
  
  // Eğer başlangıç ve bitiş ayları farklıysa, ay isimlerini de ekle
  if (startMonth !== endMonth) {
    return `${startDay} ${months[startMonth]} - ${endDay} ${months[endMonth]} arası`
  }
  
  // Aynı ay içindeyse sadece günleri göster
  return `${startDay} - ${endDay} ${months[endMonth]} arası`
})

const remainingDays = computed(() => {
  // Bugünün başlangıcını al (saat 00:00:00)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Seçili ay ve yıl
  const selectedMonthValue = selectedMonth.value
  const selectedYearValue = selectedYear.value
  
  // Seçilen ayın dönem tarihlerini al
  const periodDates = store.getters['settings/getMonthRange'](selectedYearValue, selectedMonthValue)
  if (!periodDates || !periodDates.start || !periodDates.end) return 0
  
  const startDate = new Date(periodDates.start)
  const endDate = new Date(periodDates.end)
  
  // Başlangıç tarihini günün başına ayarla
  startDate.setHours(0, 0, 0, 0)
  
  // Bugünün yıl ve ay bilgilerini al
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  
  // Seçilen ay bugünden önceki bir ay ise
  if (selectedYearValue < currentYear || 
      (selectedYearValue === currentYear && selectedMonthValue < currentMonth)) {
    return 0 // Dönem sona ermiş
  }
  
  // Seçilen ay bugünün ayı ise
  if (selectedYearValue === currentYear && selectedMonthValue === currentMonth) {
    // Eğer bugün bitiş tarihinden sonra ise dönem bitmiş demektir
    if (today > endDate) {
      return 0
    }
    
    // Bitiş tarihine kalan günleri hesapla
    const diffTime = Math.abs(endDate - today)
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Eğer bugün bitiş tarihiyle aynı günse, 1 gün kalmış demektir
    if (daysLeft === 0) {
      return 1
    }
    
    return daysLeft
  }
  
  // Seçilen ay gelecekteki bir ay ise
  // Bugünden seçilen ayın başlangıcına kadar olan gün sayısını hesapla
  const diffTime = Math.abs(startDate - today)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const remainingDayInfo = computed(() => {
  if (!isAuthenticated.value) return ''
  
  // Bugünün başlangıcını al (saat 00:00:00)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Bugünün yıl ve ay bilgilerini al
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  
  // Seçili ay ve yıl
  const selectedMonthValue = selectedMonth.value
  const selectedYearValue = selectedYear.value
  
  // Seçilen ayın dönem tarihlerini al
  const periodDates = store.getters['settings/getMonthRange'](selectedYearValue, selectedMonthValue)
  if (!periodDates || !periodDates.start || !periodDates.end) return ''
  
  const startDate = new Date(periodDates.start)
  const endDate = new Date(periodDates.end)
  
  // Başlangıç tarihini günün başına ayarla
  startDate.setHours(0, 0, 0, 0)
  
  // Seçilen ay bugünden önceki bir ay ise
  if (selectedYearValue < currentYear || 
      (selectedYearValue === currentYear && selectedMonthValue < currentMonth)) {
    return 'Dönem sona erdi'
  }
  
  // Seçilen ay bugünün ayı ise
  if (selectedYearValue === currentYear && selectedMonthValue === currentMonth) {
    // Eğer bugün bitiş tarihinden sonra ise
    if (today > endDate) {
      return 'Dönem sona erdi'
    }
    
    // Dönem içindeyse
    return 'Dönem bitimine kalan süre'
  }
  
  // Seçilen ay gelecekteki bir ay ise
  return 'Dönem başlangıcına kalan süre'
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
  // Faturalar
  const bills = store.getters['bills/totalBills'] || 0
  
  // Borçlar
  const debts = store.getters['debts/totalDebts'] || 0
  
  // Birikim
  const savings = store.state.savings.monthlySavings || 0
  
  // Sadece sabit harcamaların toplamı
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