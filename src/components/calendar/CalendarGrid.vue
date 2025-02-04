<template>
  <div class="calendar-container">
    <div class="grid-header-container">
      <h1>{{ monthName }} {{ year }}</h1>
      <router-link to="/" class="back-btn">
        <i class="fas fa-arrow-left"></i>
        Özete Dön
      </router-link>
    </div>
    
    <div class="month-actions">
      <div class="action-section">
        <div class="action-buttons">
          <button class="action-btn income-btn" @click="openIncomeModal">
            <i class="fas fa-money-bill-wave"></i>
            <span>Gelir Ekle</span>
          </button>
          
          <button class="action-btn debts-btn" @click="openDebtsModal">
            <i class="fas fa-credit-card"></i>
            <span>Borçlar</span>
          </button>
          
          <button class="action-btn bills-btn" @click="openBillsModal">
            <i class="fas fa-file-invoice"></i>
            <span>Faturalar</span>
          </button>
          
          <button class="action-btn savings-btn" @click="openSavingsModal">
            <i class="fas fa-piggy-bank"></i>
            <span>Birikim</span>
          </button>
        </div>

        <div class="period-settings">
          <div class="date-setting">
            <span class="setting-label">Dönem Başlangıcı:</span>
            <div class="date-input" v-if="!isEditingPeriod" @click="startEditingPeriod">
              {{ formatPeriodDate(monthData.periodStartDate) }}
              <i class="fas fa-pencil-alt"></i>
            </div>
            <input
              v-else
              type="date"
              v-model="periodStartInput"
              @blur="savePeriodDate"
              @keyup.enter="savePeriodDate"
            />
          </div>

          <div class="date-setting">
            <span class="setting-label">Hesap Kesim:</span>
            <div class="date-input" v-if="!isEditingCutoff" @click="startEditingCutoff">
              {{ formatPeriodDate(monthData.cutoffDate) }}
              <i class="fas fa-pencil-alt"></i>
            </div>
            <input
              v-else
              type="date"
              v-model="cutoffDateInput"
              @blur="saveCutoffDate"
              @keyup.enter="saveCutoffDate"
            />
          </div>
        </div>
      </div>

      <div class="month-summary">
        <div class="summary-item">
          <span class="label">Toplam Gelir:</span>
          <span class="amount positive">{{ formatCurrency(totalIncome) }}</span>
        </div>
        
        <div class="summary-item">
          <span class="label">Toplam Gider:</span>
          <span class="amount negative">{{ formatCurrency(totalEstimatedExpenses) }}</span>
        </div>
        
        <div class="summary-item">
          <span class="label">Kalan Bütçe:</span>
          <span class="amount" :class="{ negative: remainingBudget < 0 }">
            {{ formatCurrency(remainingBudget) }}
          </span>
        </div>
        
        <div class="summary-item">
          <span class="label">Günlük Limit:</span>
          <span class="amount">{{ formatCurrency(dailySpendingLimit) }}</span>
        </div>
        
        <div class="summary-divider"></div>
        
        <div class="summary-item">
          <span class="label">Dönem İçi Harcamalar:</span>
          <span class="amount negative">{{ formatCurrency(totalPeriodExpenses) }}</span>
        </div>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="grid-header">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>
      
      <div class="grid-body-wrapper">
        <div class="grid-body">
          <div
            v-for="day in monthDays"
            :key="day.date"
            class="day-cell"
            :class="{
              'today': isToday(day.date),
              'cutoff-date': isCutoffDate(day.date),
              'period-start': isPeriodStart(day.date),
              'period-active': isInPeriod(day.date),
              'period-inactive': !isInPeriod(day.date)
            }"
          >
            <div class="day-header">
              <span class="day-number">{{ day.date.getDate() }}</span>
              <div class="day-indicators">
                <span v-if="isCutoffDate(day.date)" class="indicator cutoff">
                  Hesap Kesim
                </span>
                <span v-if="isPeriodStart(day.date)" class="indicator period-start">
                  Dönem Başlangıcı
                </span>
              </div>
            </div>
            <DayCell 
              :day="day"
              :monthData="monthData"
              :isInPeriod="isInPeriod(day.date)"
              @add-expense="openAddExpenseModal"
              @show-details="openDetailsModal"
            />
          </div>
        </div>
      </div>

      <!-- Harcama Detayları Modalı -->
      <ExpenseListModal
        v-if="showExpenseList"
        :date="selectedDate"
        :expenses="selectedDayExpenses"
        @close="closeDetailsModal"
        @add-expense="openAddExpenseModal"
      />

      <!-- Yeni Harcama Modalı -->
      <ExpenseFormModal
        v-if="showExpenseForm"
        :date="selectedDate"
        @close="closeAddExpenseModal"
        @save="saveExpense"
      />
    </div>

    <!-- Modallar -->
    <Teleport to="body">
      <div v-if="showIncomeModal || showDebtsModal || showBillsModal || showSavingsModal" class="modal-container">
        <IncomeModal v-if="showIncomeModal" @close="closeIncomeModal" />
        <DebtsModal v-if="showDebtsModal" @close="closeDebtsModal" />
        <BillsModal v-if="showBillsModal" @close="closeBillsModal" />
        <SavingsModal v-if="showSavingsModal" @close="closeSavingsModal" />
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import DayCell from './DayCell.vue'
import ExpenseListModal from '../expenses/ExpenseListModal.vue'
import ExpenseFormModal from '../expenses/ExpenseFormModal.vue'
import IncomeModal from '../income/IncomeModal.vue'
import DebtsModal from '../debts/DebtsModal.vue'
import BillsModal from '../bills/BillsModal.vue'
import SavingsModal from '../savings/SavingsModal.vue'
import { expenseAPI } from '../../services/api'

export default {
  name: 'CalendarGrid',
  components: {
    DayCell,
    ExpenseListModal,
    ExpenseFormModal,
    IncomeModal,
    DebtsModal,
    BillsModal,
    SavingsModal
  },
  props: {
    year: {
      type: [Number, String],
      required: true
    },
    month: {
      type: [Number, String],
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    const showExpenseList = ref(false)
    const showExpenseForm = ref(false)
    const selectedDate = ref(null)
    const monthData = ref({
      cutoffDate: null,
      periodStartDate: null
    })
    const isEditingCutoff = ref(false)
    const isEditingPeriod = ref(false)
    const cutoffDateInput = ref('')
    const periodStartInput = ref('')

    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]

    const monthName = computed(() => months[Number(props.month)])

    // Seçili günün harcamalarını getir
    const selectedDayExpenses = computed(() => {
      if (!selectedDate.value) return []
      return store.state.expenses.expenses.filter(expense => 
        new Date(expense.date).toDateString() === selectedDate.value.toDateString()
      )
    })

    // Ay içindeki günleri hesapla
    const monthDays = computed(() => {
      const days = []
      const date = new Date(Number(props.year), Number(props.month), 1)
      const lastDay = new Date(Number(props.year), Number(props.month) + 1, 0)
      
      // Ayın ilk gününün haftanın hangi günü olduğunu bul (Pazartesi = 1, Pazar = 7)
      let firstDayOfWeek = date.getDay() || 7
      
      // Önceki ayın son günlerini ekle
      if (firstDayOfWeek > 1) {
        const prevMonthLastDay = new Date(Number(props.year), Number(props.month), 0)
        for (let i = firstDayOfWeek - 1; i > 0; i--) {
          days.push({
            date: new Date(Number(props.year), Number(props.month) - 1, prevMonthLastDay.getDate() - i + 1),
            isCurrentMonth: false
          })
        }
      }
      
      // Bu ayın günlerini ekle
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
          date: new Date(Number(props.year), Number(props.month), i),
          isCurrentMonth: true
        })
      }

      // Sonraki ayın günlerini ekle
      const lastDayOfWeek = lastDay.getDay() || 7
      if (lastDayOfWeek < 7) {
        for (let i = 1; i <= 7 - lastDayOfWeek; i++) {
          days.push({
            date: new Date(Number(props.year), Number(props.month) + 1, i),
            isCurrentMonth: false
          })
        }
      }
      
      return days
    })

    const openDetailsModal = (date) => {
      selectedDate.value = date
      showExpenseList.value = true
    }

    const closeDetailsModal = () => {
      showExpenseList.value = false
      selectedDate.value = null
    }

    const openAddExpenseModal = (date) => {
      selectedDate.value = date
      showExpenseForm.value = true
    }

    const closeAddExpenseModal = () => {
      showExpenseForm.value = false
    }

    const saveExpense = async (expense) => {
      try {
        await store.dispatch('expenses/addExpense', {
          year: props.year,
          month: props.month,
          expense: {
            ...expense,
            date: selectedDate.value
          }
        })
        closeAddExpenseModal()
      } catch (error) {
        console.error('Harcama eklenemedi:', error)
      }
    }

    // Seçili ayın harcamalarını yükle
    onMounted(async () => {
      await Promise.all([
        store.dispatch('income/fetchMonthlyIncome', {
          year: props.year,
          month: props.month
        }),
        store.dispatch('debts/fetchMonthlyDebts', {
          year: props.year,
          month: props.month
        }),
        store.dispatch('bills/fetchMonthlyBills', {
          year: props.year,
          month: props.month
        }),
        store.dispatch('savings/fetchMonthlySavings', {
          year: props.year,
          month: props.month
        }),
        store.dispatch('expenses/fetchExpenses', {
          year: props.year,
          month: props.month
        })
      ])
      store.commit('SET_SELECTED_YEAR', Number(props.year))
      store.commit('SET_SELECTED_MONTH', Number(props.month))
      await fetchMonthData()
    })

    // Modal state'leri
    const showIncomeModal = ref(false)
    const showDebtsModal = ref(false)
    const showBillsModal = ref(false)
    const showSavingsModal = ref(false)

    // Hesaplamalar
    const totalIncome = computed(() => store.getters['income/totalIncome'] || 0)
    const totalDebts = computed(() => store.getters['debts/totalDebts'] || 0)
    const totalBills = computed(() => store.getters['bills/totalBills'] || 0)
    const monthlySavings = computed(() => store.state.savings.monthlySavings || 0)

    const totalEstimatedExpenses = computed(() => {
      return totalDebts.value + totalBills.value + monthlySavings.value
    })

    const remainingBudget = computed(() => {
      return totalIncome.value - totalEstimatedExpenses.value
    })

    const dailySpendingLimit = computed(() => {
      if (!monthData.value.cutoffDate || !monthData.value.periodStartDate) return 0
      
      const startDate = new Date(monthData.value.periodStartDate)
      const endDate = new Date(monthData.value.cutoffDate)
      
      const diffTime = Math.abs(endDate - startDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      
      const remainingBudget = store.getters['income/totalIncome'] - 
        (store.getters['bills/totalBills'] + 
         store.getters['debts/totalDebts'] +
         store.state.savings.monthlySavings)
      
      return remainingBudget / diffDays
    })

    // Hesap kesim tarihi kontrolü
    const isCutoffDate = (date) => {
      if (!monthData.value.cutoffDate) return false
      const cutoffDate = new Date(monthData.value.cutoffDate)
      return date.getDate() === cutoffDate.getDate() &&
             date.getMonth() === cutoffDate.getMonth() &&
             date.getFullYear() === cutoffDate.getFullYear()
    }

    // Dönem başlangıç tarihi kontrolü
    const isPeriodStart = (date) => {
      if (!monthData.value.periodStartDate) return false
      const startDate = new Date(monthData.value.periodStartDate)
      return date.getDate() === startDate.getDate() &&
             date.getMonth() === startDate.getMonth() &&
             date.getFullYear() === startDate.getFullYear()
    }

    // Bugünün tarihi kontrolü
    const isToday = (date) => {
      const today = new Date()
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear()
    }

    // Dönem içi günleri kontrol et
    const isInPeriod = (date) => {
      if (!monthData.value.cutoffDate || !monthData.value.periodStartDate) return true
      
      const checkDate = new Date(date)
      const startDate = new Date(monthData.value.periodStartDate)
      const endDate = new Date(monthData.value.cutoffDate)
      
      // Tarihleri karşılaştırmak için yıl-ay-gün formatına çevirelim
      const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      
      const checkTime = normalizeDate(checkDate)
      const startTime = normalizeDate(startDate)
      const endTime = normalizeDate(endDate)

      // Eğer dönem başlangıcı kesim tarihinden sonraysa (ay geçişi var)
      if (startTime > endTime) {
        // Önceki ayın dönem başlangıcını hesapla
        const prevMonthStart = new Date(startDate)
        prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
        const prevStartTime = normalizeDate(prevMonthStart)

        // Sonraki ayın kesim tarihini hesapla
        const nextMonthEnd = new Date(endDate)
        nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1)
        const nextEndTime = normalizeDate(nextMonthEnd)

        // Tarih ya önceki dönemde ya da sonraki dönemde olmalı
        return (checkTime >= prevStartTime && checkTime <= endTime) || 
               (checkTime >= startTime && checkTime <= nextEndTime)
      }
      
      // Normal durum - başlangıç ve bitiş aynı ayda
      return checkTime >= startTime && checkTime <= endTime
    }

    // Modal açma/kapama metodları
    const openIncomeModal = () => { 
      console.log('Opening income modal')
      showIncomeModal.value = true 
    }
    const closeIncomeModal = () => { showIncomeModal.value = false }
    const openDebtsModal = () => { 
      console.log('Opening debts modal')
      showDebtsModal.value = true 
    }
    const closeDebtsModal = () => { showDebtsModal.value = false }
    const openBillsModal = () => { 
      console.log('Opening bills modal')
      showBillsModal.value = true 
    }
    const closeBillsModal = () => { showBillsModal.value = false }
    const openSavingsModal = () => { 
      console.log('Opening savings modal')
      showSavingsModal.value = true 
    }
    const closeSavingsModal = () => { showSavingsModal.value = false }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount)
    }

    // Tarihleri kaydet
    const saveDates = async () => {
      try {
        await expenseAPI.updateMonthDates(props.year, props.month, {
          cutoffDate: monthData.value.cutoffDate,
          periodStartDate: monthData.value.periodStartDate
        })
      } catch (error) {
        console.error('Tarihler kaydedilemedi:', error)
      }
    }

    // Ay verilerini getir
    const fetchMonthData = async () => {
      try {
        const data = await expenseAPI.getMonthSummary(props.year, props.month)
        monthData.value = data
      } catch (error) {
        console.error('Ay verileri alınamadı:', error)
      }
    }

    // Modal açma/kapama metodları
    const startEditingCutoff = () => {
      isEditingCutoff.value = true
      if (monthData.value.cutoffDate) {
        const date = new Date(monthData.value.cutoffDate)
        cutoffDateInput.value = date.toISOString().split('T')[0]
      }
    }
    const saveCutoffDate = () => {
      monthData.value.cutoffDate = new Date(cutoffDateInput.value).getTime()
      isEditingCutoff.value = false
      saveDates()
    }
    const startEditingPeriod = () => {
      isEditingPeriod.value = true
      if (monthData.value.periodStartDate) {
        const date = new Date(monthData.value.periodStartDate)
        periodStartInput.value = date.toISOString().split('T')[0]
      }
    }
    const savePeriodDate = () => {
      monthData.value.periodStartDate = new Date(periodStartInput.value).getTime()
      isEditingPeriod.value = false
      saveDates()
    }

    // Tarih formatlama fonksiyonu
    const formatPeriodDate = (date) => {
      if (!date) return 'Seçilmedi'
      const formattedDate = new Date(date)
      return `${formattedDate.getDate()} ${months[formattedDate.getMonth()]}`
    }

    // Dönem içi toplam harcamalar
    const totalPeriodExpenses = computed(() => {
      return store.state.expenses.expenses
        .filter(expense => {
          const expenseDate = new Date(Number(expense.date))
          return isInPeriod(expenseDate)
        })
        .reduce((total, expense) => total + expense.amount, 0)
    })

    onMounted(() => {
      // Touch ve drag olayları için
      const gridWrapper = document.querySelector('.grid-body-wrapper')
      if (gridWrapper) {
        let isDown = false
        let startX
        let scrollLeft

        gridWrapper.addEventListener('mousedown', (e) => {
          isDown = true
          startX = e.pageX - gridWrapper.offsetLeft
          scrollLeft = gridWrapper.scrollLeft
        })

        gridWrapper.addEventListener('mouseleave', () => {
          isDown = false
        })

        gridWrapper.addEventListener('mouseup', () => {
          isDown = false
        })

        gridWrapper.addEventListener('mousemove', (e) => {
          if (!isDown) return
          e.preventDefault()
          const x = e.pageX - gridWrapper.offsetLeft
          const walk = (x - startX) * 2
          gridWrapper.scrollLeft = scrollLeft - walk
        })
      }
    })

    return {
      weekDays,
      monthDays,
      showExpenseList,
      showExpenseForm,
      selectedDate,
      selectedDayExpenses,
      openDetailsModal,
      closeDetailsModal,
      openAddExpenseModal,
      closeAddExpenseModal,
      saveExpense,
      monthName,
      showIncomeModal,
      showDebtsModal,
      showBillsModal,
      showSavingsModal,
      openIncomeModal,
      closeIncomeModal,
      openDebtsModal,
      closeDebtsModal,
      openBillsModal,
      closeBillsModal,
      openSavingsModal,
      closeSavingsModal,
      totalIncome,
      totalEstimatedExpenses,
      remainingBudget,
      dailySpendingLimit,
      formatCurrency,
      isCutoffDate,
      isPeriodStart,
      isToday,
      monthData,
      isEditingCutoff,
      isEditingPeriod,
      cutoffDateInput,
      periodStartInput,
      saveDates,
      isInPeriod,
      startEditingCutoff,
      saveCutoffDate,
      startEditingPeriod,
      savePeriodDate,
      formatPeriodDate,
      totalPeriodExpenses
    }
  }
}
</script>

<style scoped>
.calendar-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.grid-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.grid-header-container h1 {
  color: #003B5C;
  margin: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #009B9F;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: rgba(0, 155, 159, 0.1);
  transform: translateX(-4px);
}

.calendar-grid {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 59, 92, 0.1);
  margin-top: 2rem;
  position: relative;
  width: 100%;
}

.grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.weekday {
  text-align: center;
  font-weight: 500;
  color: #003B5C;
}

.grid-body-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -1.5rem;
  padding: 0 1.5rem;
}

.grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.month-actions {
  margin-bottom: 2rem;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 59, 92, 0.1);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.income-btn {
  background-color: #00B2A9;
  color: white;
}

.debts-btn {
  background-color: #dc3545;
  color: white;
}

.bills-btn {
  background-color: #003B5C;
  color: white;
}

.savings-btn {
  background-color: #ffc107;
  color: #000;
}

.month-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto 1fr;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 59, 92, 0.05);
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  text-align: center;
}

.summary-item .label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.summary-item .amount {
  font-size: 1.25rem;
  font-weight: 600;
}

.amount.positive {
  color: #00B2A9;
}

.amount.negative {
  color: #dc3545;
}

.summary-divider {
  width: 1px;
  background: rgba(0, 59, 92, 0.2);
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 1rem;
  }

  .grid-header-container {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .action-buttons {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .action-btn {
    flex: 1 1 calc(50% - 0.5rem);
    min-width: 120px;
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .month-summary {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .summary-divider {
    width: 100%;
    height: 1px;
    margin: 0.5rem 0;
  }
}

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
}

.day-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.day-indicators {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.7rem;
}

.indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cutoff {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.period-start {
  background-color: rgba(0, 178, 169, 0.1);
  color: #00B2A9;
}

.day-cell.cutoff-date {
  background-color: rgba(220, 53, 69, 0.1);
  border: 2px solid rgba(220, 53, 69, 0.3);
  box-shadow: 0 2px 12px rgba(220, 53, 69, 0.15);
}

.day-cell.period-start {
  background-color: rgba(0, 178, 169, 0.1);
  border: 2px solid rgba(0, 178, 169, 0.3);
  box-shadow: 0 2px 12px rgba(0, 178, 169, 0.15);
}

.day-cell.period-active {
  background-color: rgba(0, 178, 169, 0.05);
  border: 1px solid rgba(0, 178, 169, 0.2);
  box-shadow: 0 2px 8px rgba(0, 178, 169, 0.1);
  opacity: 1;
}

.day-cell.period-inactive {
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  opacity: 0.5;
  pointer-events: none;
}

.day-cell.period-inactive * {
  pointer-events: none;
}

.day-cell.period-inactive .day-number,
.day-cell.period-inactive .expense-summary,
.day-cell.period-inactive .day-actions {
  opacity: 0.5;
}

.day-cell.period-active .day-number {
  color: #003B5C;
  font-weight: 600;
}

.day-cell.period-active .expense-summary {
  opacity: 1;
}

.day-cell.period-inactive .day-number,
.day-cell.period-inactive .expense-summary {
  opacity: 0.5;
}

/* Responsive tasarım için */
@media (max-width: 768px) {
  .day-indicators {
    font-size: 0.6rem;
  }

  .indicator {
    padding: 0.15rem 0.3rem;
  }

  .period-settings {
    flex-direction: column;
    gap: 1rem;
  }

  .date-setting {
    width: 100%;
    justify-content: space-between;
  }

  .action-section {
    overflow-x: hidden;
  }

  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
  }

  .action-btn {
    flex: 1 1 calc(50% - 0.75rem); /* 2 sütunlu düzen */
    min-width: 140px;
  }

  /* Takvim scroll göstergesi */
  .calendar-grid::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 24px;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.9));
    pointer-events: none;
  }
}

/* Scroll bar stilleri */
.calendar-grid::-webkit-scrollbar {
  height: 6px;
}

.calendar-grid::-webkit-scrollbar-track {
  background: rgba(0, 59, 92, 0.05);
  border-radius: 3px;
}

.calendar-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 59, 92, 0.1);
  border-radius: 3px;
}

.calendar-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 59, 92, 0.2);
}

.day-cell {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  min-height: 100px;
  border: 1px solid rgba(0, 59, 92, 0.1);
  transition: all 0.2s ease;
  position: relative;
}

.day-cell.today {
  background-color: rgba(147, 51, 234, 0.1) !important;
  border: 2px solid rgba(147, 51, 234, 0.3) !important;
  box-shadow: 0 2px 12px rgba(147, 51, 234, 0.1);
}

.day-cell.today .day-number {
  color: rgb(147, 51, 234);
  font-weight: 600;
}

.day-number {
  font-weight: 500;
  color: #003B5C;
}

.period-settings {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 59, 92, 0.05);
  border-radius: 8px;
}

.date-setting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setting-label {
  color: #666;
  font-size: 0.9rem;
}

.date-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-input:hover {
  background: rgba(0, 59, 92, 0.1);
}

/* DayCell için yeni stil */
.day-cell.inactive {
  opacity: 0.5;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.05);
}
</style> 