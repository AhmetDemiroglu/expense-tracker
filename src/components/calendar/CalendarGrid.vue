<template>
  <div class="calendar-container">
    <div class="grid-header-container">
      <div class="month-title">
        <div class="month-navigation">
          <button class="nav-btn" @click="navigateMonth(-1)" title="Önceki Ay">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="month-text">
            <i class="far fa-calendar-alt"></i>
            <h1>{{ monthName }} {{ year }}</h1>
          </div>
          <button class="nav-btn" @click="navigateMonth(1)" title="Sonraki Ay">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <router-link to="/" class="back-btn">
        <i class="fas fa-arrow-left"></i>
        Özete Dön
      </router-link>
    </div>
    
    <div class="month-actions">
      <div class="action-buttons-container">
        <div class="action-buttons">
          <button class="action-btn income-btn" @click="openIncomeModal">
            <i class="fas fa-money-bill"></i>
            Gelir Ekle
          </button>
          
          <button class="action-btn debts-btn" @click="openDebtsModal">
            <i class="fas fa-credit-card"></i>
            Borçlar
          </button>
          
          <button class="action-btn bills-btn" @click="openBillsModal">
            <i class="fas fa-file-invoice"></i>
            Faturalar
          </button>
          
          <button class="action-btn savings-btn" @click="openSavingsModal">
            <i class="fas fa-piggy-bank"></i>
            Birikim
          </button>
        </div>
        <div class="export-buttons">
          <button class="export-btn" @click="exportToPDF" title="PDF olarak indir">
            <i class="fas fa-file-pdf"></i>
            PDF
          </button>
          <button class="export-btn" @click="printCalendar" title="Takvimi yazdır">
            <i class="fas fa-print"></i>
            Yazdır
          </button>
        </div>
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
            class="grid-cell"
            :class="{
              'today': isToday(day.date),
              'cutoff-date': isCutoffDate(day.date),
              'period-start': isPeriodStart(day.date),
              'period-active': isInPeriod(day.date),
              'period-inactive': !isInPeriod(day.date)
            }"
          >
            <DayCell 
              :day="day"
              :monthData="monthData"
              :isInPeriod="isInPeriod(day.date)"
              :isCutoffDate="isCutoffDate(day.date)"
              :isPeriodStart="isPeriodStart(day.date)"
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
        @delete-expense="confirmDelete"
      />

      <!-- Yeni Harcama Modalı -->
      <ExpenseFormModal
        v-if="showExpenseForm"
        :date="selectedDate"
        @close="closeAddExpenseModal"
        @save="saveExpense"
      />

      <!-- Silme Onay Modalı -->
      <ConfirmModal
        v-if="showConfirmDelete"
        title="Harcama Silinecek"
        message="Bu harcamayı silmek istediğinizden emin misiniz?"
        @confirm="handleDelete"
        @cancel="showConfirmDelete = false"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import DayCell from './DayCell.vue'
import ExpenseListModal from '../expenses/ExpenseListModal.vue'
import ExpenseFormModal from '../expenses/ExpenseFormModal.vue'
import IncomeModal from '../income/IncomeModal.vue'
import DebtsModal from '../debts/DebtsModal.vue'
import BillsModal from '../bills/BillsModal.vue'
import SavingsModal from '../savings/SavingsModal.vue'
import ConfirmModal from '../shared/ConfirmModal.vue'
import { expenseAPI } from '../../services/api'
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min'

export default {
  name: 'CalendarGrid',
  components: {
    DayCell,
    ExpenseListModal,
    ExpenseFormModal,
    IncomeModal,
    DebtsModal,
    BillsModal,
    SavingsModal,
    ConfirmModal
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
    const router = useRouter()
    const route = useRoute()
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    const showExpenseList = ref(false)
    const showExpenseForm = ref(false)
    const showConfirmDelete = ref(false)
    const selectedDate = ref(null)
    const selectedExpenseId = ref(null)
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
    const loadAllData = async () => {
      await fetchMonthData()
      await store.dispatch('expenses/fetchExpenses', {
        year: props.year,
        month: props.month
      })
      await store.dispatch('income/fetchIncome', {
        year: props.year,
        month: props.month
      })
      await store.dispatch('bills/fetchBills', {
        year: props.year,
        month: props.month
      })
      await store.dispatch('debts/fetchDebts', {
        year: props.year,
        month: props.month
      })
      await store.dispatch('savings/fetchSavings', {
        year: props.year,
        month: props.month
      })
    }

    // Route parametrelerini izle
    watch(
      () => [props.year, props.month],
      () => {
        loadAllData()
      }
    )

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
      showIncomeModal.value = true 
    }
    const closeIncomeModal = () => { showIncomeModal.value = false }
    const openDebtsModal = () => { 
      showDebtsModal.value = true 
    }
    const closeDebtsModal = () => { showDebtsModal.value = false }
    const openBillsModal = () => { 
      showBillsModal.value = true 
    }
    const closeBillsModal = () => { showBillsModal.value = false }
    const openSavingsModal = () => { 
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

    // Silme işlemleri için yeni metodlar
    const confirmDelete = (expenseId) => {
      selectedExpenseId.value = expenseId
      showConfirmDelete.value = true
    }

    const handleDelete = async () => {
      try {
        if (!selectedExpenseId.value) {
          console.error('Silinecek harcama ID\'si bulunamadı')
          return
        }

        const expense = store.state.expenses.expenses.find(e => e.id === selectedExpenseId.value)
        if (!expense) {
          console.error('Silinecek harcama bulunamadı')
          return
        }

        const expenseDate = new Date(Number(expense.date))
        
        await store.dispatch('expenses/deleteExpense', {
          year: expenseDate.getFullYear(),
          month: expenseDate.getMonth(),
          expenseId: selectedExpenseId.value
        })

        showConfirmDelete.value = false
        selectedExpenseId.value = null
        
        // Harcama listesini güncelle
        if (selectedDate.value) {
          const updatedExpenses = store.state.expenses.expenses.filter(e => 
            new Date(e.date).toDateString() === selectedDate.value.toDateString()
          )
          
          if (updatedExpenses.length === 0) {
            closeDetailsModal()
          }
        }
      } catch (error) {
        console.error('Harcama silinirken hata oluştu:', error)
      }
    }

    const exportToPDF = () => {
      const element = document.querySelector('.calendar-grid')
      
      // PDF için özel stil ekleyelim
      const originalStyle = element.style.cssText
      element.style.fontSize = '7px'
      element.style.padding = '0.3rem'
      
      // Grid hücrelerinin yüksekliğini azaltalım
      const cells = element.querySelectorAll('.grid-cell')
      const originalCellStyles = []
      cells.forEach(cell => {
        originalCellStyles.push(cell.style.cssText)
        cell.style.minHeight = '60px'
        cell.style.padding = '0.2rem'
      })

      const opt = {
        margin: 0.2,
        filename: `takvim-${props.year}-${props.month}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          width: 1200, // Yatay format için genişliği artırdık
          height: 800 // Yatay format için yüksekliği artırdık
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'landscape', // Yatay format
          compress: true
        }
      }
      
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          // Orijinal stilleri geri yükleyelim
          element.style.cssText = originalStyle
          cells.forEach((cell, index) => {
            cell.style.cssText = originalCellStyles[index]
          })
        })
    }

    const printCalendar = () => {
      const printContent = document.querySelector('.calendar-grid')
      const WinPrint = window.open('', '', 'width=900,height=650')
      
      WinPrint.document.write(`
        <html>
          <head>
            <title>Takvim</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
              
              body {
                font-family: 'Inter', sans-serif;
                margin: 0;
                padding: 20px;
              }

              .calendar-grid {
                background: white;
                border-radius: 16px;
                padding: 1.5rem;
                width: 100%;
              }

              .grid-header {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 0.5rem;
                margin-bottom: 1rem;
              }

              .grid-body {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 0.5rem;
              }

              .grid-cell {
                min-height: 120px;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 0.5rem;
              }

              .day-number {
                font-weight: 500;
                color: #003B5C;
              }

              .expense-summary {
                text-align: right;
                margin-top: auto;
              }

              .total-expense {
                font-weight: 500;
                color: #003B5C;
              }

              .remaining-limit {
                font-size: 0.9rem;
              }

              .remaining-limit.positive {
                color: #00B2A9;
              }

              .remaining-limit.negative {
                color: #dc3545;
              }

              .day-actions {
                display: none;
              }

              .budget-warning,
              .no-expense-info,
              .budget-safe {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                border-radius: 4px;
                margin-top: 0.5rem;
                font-size: 0.8rem;
              }

              .budget-warning {
                background-color: rgba(220, 53, 69, 0.1);
                color: #dc3545;
              }

              .no-expense-info {
                background-color: rgba(40, 167, 69, 0.15);
                color: #28a745;
              }

              .budget-safe {
                background-color: rgba(255, 152, 0, 0.15);
                color: #ff9800;
              }

              @media print {
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `)
      
      WinPrint.document.close()
      WinPrint.focus()

      // Fontların ve stillerin yüklenmesi için biraz daha bekleyelim
      setTimeout(() => {
        WinPrint.print()
        WinPrint.close()
      }, 1500)
    }

    const navigateMonth = (direction) => {
      let newMonth = parseInt(props.month) + direction
      let newYear = parseInt(props.year)

      if (newMonth > 11) {
        newMonth = 0
        newYear++
      } else if (newMonth < 0) {
        newMonth = 11
        newYear--
      }

      router.push(`/month/${newYear}/${newMonth}`)
    }

    onMounted(() => {
      loadAllData()
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
      totalPeriodExpenses,
      showConfirmDelete,
      selectedExpenseId,
      confirmDelete,
      handleDelete,
      exportToPDF,
      printCalendar,
      navigateMonth
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

.month-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.month-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #003B5C;
}

.month-text i {
  color: #009B9F;
  font-size: 1.8rem;
  margin-right: 0.5rem;
}

.nav-btn {
  background: none;
  border: none;
  color: #009B9F;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background-color: rgba(0, 155, 159, 0.1);
  transform: scale(1.1);
}

.nav-btn i {
  font-size: 1.2rem;
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
  overflow: hidden;
}

.grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.weekday {
  text-align: center;
  font-weight: 500;
  color: #003B5C;
}

.grid-body-wrapper {
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
}

.grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  width: 100%;
  grid-auto-rows: 1fr;
}

.month-actions {
  margin-bottom: 2rem;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 59, 92, 0.1);
  display: flex;
  flex-direction: column;
}

.action-buttons-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.export-buttons {
  display: flex;
  gap: 1rem;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.export-btn:hover {
  background-color: #e9ecef;
  color: #495057;
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

.period-settings {
  display: flex;
  gap: 2rem;
  justify-content: flex-start;
  align-items: center;
  margin-top: 1.5rem;
}

.date-setting {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting-label {
  color: #666;
  font-size: 0.9rem;
  white-space: nowrap;
}

.date-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-input:hover {
  background: #e9ecef;
}

.date-input i {
  color: #6c757d;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 0.5rem;
  }

  .action-buttons-container {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons,
  .export-buttons {
    flex-wrap: wrap;
    width: 100%;
    gap: 0.5rem;
  }

  .action-btn,
  .export-btn {
    flex: 1 1 calc(50% - 0.5rem);
    min-width: 120px;
    padding: 0.5rem;
    font-size: 0.9rem;
    justify-content: center;
  }

  .export-buttons {
    justify-content: stretch;
  }

  .export-btn {
    margin: 0;
  }

  .grid-header,
  .grid-body {
    gap: 0.25rem;
  }

  .grid-header-container {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
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

  .period-settings {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .date-setting {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .date-input {
    width: 100%;
    justify-content: space-between;
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

.grid-cell {
  position: relative;
  min-height: 120px;
}

.grid-cell.today {
  position: relative;
  border: 2px solid rgba(255, 182, 193, 0.9) !important;
  box-shadow: 0 2px 12px rgba(255, 182, 193, 0.2);
  padding: 1rem;
  min-height: 140px;
}

.grid-cell.today::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgb(255, 237, 250, 0.5);
  pointer-events: none;
  z-index: 1;
}

.grid-cell.today > * {
  position: relative;
  z-index: 1;
  background: rgb(255, 237, 250, 0.5);
}

.grid-cell.cutoff-date {
  background-color: rgba(220, 53, 69, 0.1);
  border: 2px solid rgba(220, 53, 69, 0.3);
  box-shadow: 0 2px 12px rgba(220, 53, 69, 0.15);
}

.grid-cell.period-start {
  background-color: rgba(0, 178, 169, 0.1);
  border: 2px solid rgba(0, 178, 169, 0.3);
  box-shadow: 0 2px 12px rgba(0, 178, 169, 0.15);
}

.grid-cell.period-active {
  background-color: rgba(0, 178, 169, 0.05);
  border: 1px solid rgba(0, 178, 169, 0.2);
  box-shadow: 0 2px 8px rgba(0, 178, 169, 0.1);
  opacity: 1;
}

.grid-cell.period-inactive {
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  opacity: 0.5;
  pointer-events: none;
}

.grid-cell.period-inactive * {
  pointer-events: none;
}

.grid-cell.period-inactive .day-number,
.grid-cell.period-inactive .expense-summary,
.grid-cell.period-inactive .day-actions {
  opacity: 0.5;
}

.grid-cell.period-active .day-number {
  color: #003B5C;
  font-weight: 600;
}

.grid-cell.period-active .expense-summary {
  opacity: 1;
}

.grid-cell.period-inactive .day-number,
.grid-cell.period-inactive .expense-summary {
  opacity: 0.5;
}

/* Uyarı mesajları için yeni stiller */
.budget-warning {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.no-expense-info {
  background-color: rgba(91, 145, 59, 0.1);
  color: #5B913B;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.budget-safe {
  background-color: rgba(239, 176, 54, 0.1);
  color: #EFB036;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.income-btn {
  background-color: #00B2A9;
  color: white;
}

.income-btn:hover {
  background-color: #009b94;
}

.debts-btn {
  background-color: #dc3545;
  color: white;
}

.debts-btn:hover {
  background-color: #c82333;
}

.bills-btn {
  background-color: #003B5C;
  color: white;
}

.bills-btn:hover {
  background-color: #002b43;
}

.savings-btn {
  background-color: #ffc107;
  color: #000;
}

.savings-btn:hover {
  background-color: #e0a800;
}

/* PDF için özel stiller */
@media print {
  .calendar-grid {
    font-size: 8px !important;
    padding: 0.5rem !important;
  }

  .grid-cell {
    min-height: 80px !important;
    padding: 0.25rem !important;
  }

  .weekday {
    font-size: 8px !important;
  }

  .day-number {
    font-size: 10px !important;
  }

  .expense-summary {
    font-size: 8px !important;
  }

  .budget-warning,
  .no-expense-info,
  .budget-safe {
    font-size: 7px !important;
    padding: 0.25rem !important;
  }
}
</style> 