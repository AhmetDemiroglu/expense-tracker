<template>
  <div class="calendar-container">
    <div class="grid-header-container">
      <div class="month-title">
        <div class="month-navigation">
          <button 
            class="nav-btn" 
            @click="navigateMonth(-1)" 
            :disabled="isLoading"
            title="Önceki Ay"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="month-text">
            <i class="far fa-calendar-alt"></i>
            <h1>{{ monthName }} {{ year }}</h1>
          </div>
          <button 
            class="nav-btn" 
            @click="navigateMonth(1)" 
            :disabled="isLoading"
            title="Sonraki Ay"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <router-link to="/" class="back-btn">
        <i class="fas fa-arrow-left"></i>
        Özete Dön
      </router-link>
    </div>
    
    <!-- Yükleme göstergesi -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
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
            {{ monthData.periodStartDate ? formatPeriodDate(monthData.periodStartDate) : 'Seçilmedi' }}
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
            {{ monthData.cutoffDate ? formatPeriodDate(monthData.cutoffDate) : 'Seçilmedi' }}
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
        <div class="summary-row">
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
          
          <div v-if="dailyLimitChangeInfo.change !== 0" class="summary-item limit-change">
            <span class="label">Limit Değişimi:</span>
            <span class="amount" :class="{ 'positive': dailyLimitChangeInfo.direction === 'up', 'negative': dailyLimitChangeInfo.direction === 'down' }">
              {{ dailyLimitChangeInfo.direction === 'up' ? '+' : '' }}{{ formatCurrency(dailyLimitChangeInfo.change) }}
              <i :class="dailyLimitChangeInfo.direction === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            </span>
          </div>
        
          <div class="summary-item">
            <span class="label">Dönem İçi Harcamalar:</span>
            <span class="amount negative">{{ formatCurrency(totalPeriodExpenses) }}</span>
          </div>
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
            :class="{
              'calendar-day': true,
              'not-current-month': !day.isCurrentMonth,
              'today': isToday(day.date),
              'cutoff-date': isCutoffDate(day.date),
              'period-start': isPeriodStart(day.date),
              'period-active': day.isInPeriod,
              'period-inactive': !day.isInPeriod,
              'selected': isSelected(day.date)
            }"
            @click="selectDate(day.date)"
          >
            <div class="day-header">
              <span class="day-number">{{ day.date.getDate() }}</span>
              <div class="day-actions">
                <button class="view-btn" @click.stop="openDetailsModal(day.date)">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="add-btn" @click.stop="openAddExpenseModal(day.date)">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <DayCell 
              :day="day"
              :month-data="monthData"
              :is-in-period="day.isInPeriod"
              :is-cutoff-date="isCutoffDate(day.date)"
              :is-period-start="isPeriodStart(day.date)"
              :daily-limit="dailySpendingLimit"
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
        @add-expense="openAddExpenseModal(selectedDate)"
        @delete-expense="confirmDelete"
      />

      <!-- Yeni Harcama Modalı -->
      <ExpenseFormModal
        v-if="showExpenseForm"
        :date="selectedDate"
        @close="closeAddExpenseModal"
        @save="handleAddExpense"
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
      <IncomeModal v-if="showIncomeModal" @close="closeIncomeModal" />
      <DebtsModal v-if="showDebtsModal" @close="closeDebtsModal" />
      <BillsModal v-if="showBillsModal" @close="closeBillsModal" />
      <SavingsModal v-if="showSavingsModal" @close="closeSavingsModal" />
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
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
import { ref as dbRef, get, set } from 'firebase/database'
import { db } from '@/services/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

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
      type: String,
      required: true
    },
    month: {
      type: String,
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
    const isLoading = ref(true)
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const monthData = ref({
      periodStartDate: null,
      cutoffDate: null,
      lastUpdated: null
    })
    const isEditingCutoff = ref(false)
    const isEditingPeriod = ref(false)
    const cutoffDateInput = ref('')
    const periodStartInput = ref('')

    // Auth durumunun başlatılmasını bekle
    const waitForAuth = async () => {
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
      
      return store.getters['auth/isAuthenticated']
    }

    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]

    const currentMonth = computed(() => store.state.selectedMonth)
    const currentYear = computed(() => store.state.selectedYear)

    // Ay adını hesapla
    const monthName = computed(() => months[Number(props.month)])

    // Yıl bilgisi
    const year = computed(() => currentYear.value)

    // Ay içindeki günleri hesapla
    const monthDays = computed(() => {
      const days = []
      
      // Eğer dönem başlangıç ve bitiş tarihleri ayarlanmışsa, döneme göre günleri göster
      if (monthData.value.periodStartDate && monthData.value.cutoffDate) {
        // Dönem başlangıç ve bitiş tarihlerini Date nesnelerine dönüştür
        const periodStart = new Date(monthData.value.periodStartDate)
        const cutoffDate = new Date(monthData.value.cutoffDate)
        
        // Dönem başlangıç tarihinin haftanın hangi günü olduğunu bul (Pazartesi = 1, Pazar = 7)
        let firstDayOfWeek = periodStart.getDay() || 7
        
        // Önceki haftanın günlerini ekle (takvimin ilk satırını doldurmak için)
        if (firstDayOfWeek > 1) {
          const tempDate = new Date(periodStart)
          for (let i = firstDayOfWeek - 1; i > 0; i--) {
            tempDate.setDate(tempDate.getDate() - 1)
            days.push({
              date: new Date(tempDate),
              isCurrentMonth: tempDate.getMonth() === Number(props.month),
              isInPeriod: false // Dönem dışı
            })
          }
          // Günleri doğru sırayla göstermek için tersine çevir
          days.reverse()
        }
        
        // Dönem günlerini ekle (başlangıçtan bitişe kadar)
        const currentDate = new Date(periodStart)
        while (currentDate <= cutoffDate) {
          days.push({
            date: new Date(currentDate),
            isCurrentMonth: currentDate.getMonth() === Number(props.month),
            isInPeriod: true // Dönem içi
          })
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        // Sonraki haftanın günlerini ekle (takvimin son satırını doldurmak için)
        const lastDayOfWeek = cutoffDate.getDay() || 7
        if (lastDayOfWeek < 7) {
          const tempDate = new Date(cutoffDate)
          for (let i = 1; i <= 7 - lastDayOfWeek; i++) {
            tempDate.setDate(tempDate.getDate() + 1)
            days.push({
              date: new Date(tempDate),
              isCurrentMonth: tempDate.getMonth() === Number(props.month),
              isInPeriod: false // Dönem dışı
            })
          }
        }
        
        return days
      }
      
      // Dönem tarihleri ayarlanmamışsa, normal ay görünümünü göster
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
            isCurrentMonth: false,
            isInPeriod: false
          })
        }
      }

      // Bu ayın günlerini ekle
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
          date: new Date(Number(props.year), Number(props.month), i),
          isCurrentMonth: true,
          isInPeriod: false // İlk başta false, sonra kontrol edilecek
        })
      }

      // Sonraki ayın günlerini ekle
      const lastDayOfWeek = lastDay.getDay() || 7
      if (lastDayOfWeek < 7) {
        for (let i = 1; i <= 7 - lastDayOfWeek; i++) {
          days.push({
            date: new Date(Number(props.year), Number(props.month) + 1, i),
            isCurrentMonth: false,
            isInPeriod: false
          })
        }
      }
      
      // Dönem tarihleri varsa, dönem içindeki günleri işaretle
      if (monthData.value.periodStartDate && monthData.value.cutoffDate) {
        const periodStart = new Date(monthData.value.periodStartDate)
        const cutoffDate = new Date(monthData.value.cutoffDate)
        
        // Her gün için dönem içinde olup olmadığını kontrol et
        days.forEach(day => {
          const dayTime = day.date.setHours(0, 0, 0, 0)
          const startTime = new Date(periodStart).setHours(0, 0, 0, 0)
          const endTime = new Date(cutoffDate).setHours(0, 0, 0, 0)
          
          // Dönem başlangıcı kesim tarihinden sonraysa (ay geçişi var)
          if (startTime > endTime) {
            // Önceki ayın dönem başlangıcını hesapla
            const prevMonthStart = new Date(startTime)
            prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
            const prevStartTime = prevMonthStart.getTime()
            
            // Sonraki ayın kesim tarihini hesapla
            const nextMonthEnd = new Date(endTime)
            nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1)
            const nextEndTime = nextMonthEnd.getTime()
            
            // Tarih ya önceki dönemde ya da sonraki dönemde olmalı
            day.isInPeriod = (dayTime >= prevStartTime && dayTime <= endTime) || 
                             (dayTime >= startTime && dayTime <= nextEndTime)
          } else {
            // Normal durum - başlangıç ve bitiş aynı ayda
            day.isInPeriod = dayTime >= startTime && dayTime <= endTime
          }
        })
      }

      return days
    })

    // Seçili günün harcamalarını getir
    const selectedDayExpenses = computed(() => {
      if (!selectedDate.value) return []
      return store.state.expenses.expenses.filter(expense => 
        new Date(expense.date).toDateString() === selectedDate.value.toDateString()
      )
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
      if (date) {
        selectedDate.value = date
      }
      showExpenseForm.value = true
    }

    const closeAddExpenseModal = () => {
      showExpenseForm.value = false
      // selectedDate.value'yu null yapmıyoruz ki detay modalına döndüğünde tarih bilgisi korunsun
    }

    // Harcama ekleme işlemi
    const handleAddExpense = async (expenseData) => {
      try {
        // Harcama tarihini ayarla
        const expenseDate = selectedDate.value
        
        // Harcama verilerini hazırla
        const expense = {
          ...expenseData,
          date: expenseDate.toISOString(),
          createdAt: new Date().toISOString()
        }
        
        // Store'a ekle
        await store.dispatch('expenses/addExpense', {
          year: expenseDate.getFullYear().toString(),
          month: expenseDate.getMonth().toString(),
          expense
        })
        
        // Formu kapat
        closeAddExpenseModal()
        
        // Detay modalını aç - Burada tarih bilgisini açıkça gönderiyoruz
        openDetailsModal(expenseDate)
      } catch (error) {
        console.error('Harcama eklenirken hata:', error)
      }
    }

    // Ay verilerini getir
    const fetchMonthData = async () => {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) return

        // Ay verilerini kullanıcının kendi path'inden al
        const monthRef = dbRef(db, `users/${user.uid}/months/${store.state.selectedYear}/${store.state.selectedMonth}`)
        const snapshot = await get(monthRef)
        
        if (snapshot.exists()) {
          monthData.value = snapshot.val()
        } else {
          monthData.value = {
            periodStartDate: null,
            cutoffDate: null,
            lastUpdated: null
          }
        }

        // Input değerlerini güncelle
        if (monthData.value.cutoffDate) {
          cutoffDateInput.value = new Date(monthData.value.cutoffDate).toISOString().split('T')[0]
        }
        if (monthData.value.periodStartDate) {
          periodStartInput.value = new Date(monthData.value.periodStartDate).toISOString().split('T')[0]
        }
      } catch (error) {
        console.error('Ay verileri getirilemedi:', error)
      }
    }

    // Ay verilerini kaydet
    const saveMonthData = async (data) => {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) return

        const monthRef = dbRef(db, `users/${user.uid}/months/${store.state.selectedYear}/${store.state.selectedMonth}`)
        await set(monthRef, {
          ...data,
          lastUpdated: Date.now()
        })
      } catch (error) {
        console.error('Ay verileri kaydedilemedi:', error)
      }
    }

    // Kesim tarihi güncelleme
    const updateCutoffDate = async () => {
      if (!cutoffDateInput.value) return

      try {
        // Tarih değerini alıp gün olarak çıkar
        const date = new Date(cutoffDateInput.value)
        const day = date.getDate()
        
        console.log('CalendarGrid: Kesim tarihi güncelleniyor:', day)
        
        // Store üzerinden kesim tarihini güncelle (global ayar)
        await store.dispatch('settings/saveCutoffDate', day)
        
        // Ay verilerini de güncelle
        await saveMonthData({
          ...monthData.value,
          cutoffDate: date.getTime()
        })
        
        isEditingCutoff.value = false
        
        // Sayfayı yenile
        window.location.reload()
      } catch (error) {
        console.error('Kesim tarihi güncellenirken hata oluştu:', error)
      }
    }

    // Dönem başlangıç tarihi güncelleme
    const updatePeriodStartDate = async () => {
      if (!periodStartInput.value) return

      const timestamp = new Date(periodStartInput.value).getTime()
      await saveMonthData({
        ...monthData.value,
        periodStartDate: timestamp
      })
      isEditingPeriod.value = false
    }

    // Ay değiştirme işlemi
    const navigateMonth = async (direction) => {
      if (isLoading.value) return
      
      isLoading.value = true
      try {
        const newDate = new Date(Number(props.year), Number(props.month) + direction, 1)
        const newYear = newDate.getFullYear()
        const newMonth = newDate.getMonth()

        // Store'u güncelle
        store.commit('SET_SELECTED_MONTH', newMonth)
        store.commit('SET_SELECTED_YEAR', newYear)

        // URL'i güncelle
        router.push({
          name: 'month-detail',
          params: {
            year: newYear.toString(),
            month: newMonth.toString()
          }
        })

        // Verileri yükle
        await loadAllData()
      } catch (error) {
        console.error('Ay değiştirme hatası:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Tüm verileri yükle
    const loadAllData = async () => {
      if (!await waitForAuth()) {
        isLoading.value = false
        return
      }

      try {
        isLoading.value = true
        await fetchMonthData()
        
        await Promise.all([
          store.dispatch('expenses/fetchExpenses', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth
          }),
          store.dispatch('income/fetchIncome', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth
          }),
          store.dispatch('bills/fetchBills', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth
          }),
          store.dispatch('debts/fetchDebts', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth
          }),
          store.dispatch('savings/fetchSavings', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth
          })
        ])
      } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Bileşen yüklendiğinde ve auth state değiştiğinde verileri getir
    onMounted(async () => {
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await loadAllData()
        }
      })
    })

    // Seçili ay/yıl değiştiğinde verileri yeniden yükle
    watch(
      [
        () => store.state.selectedYear,
        () => store.state.selectedMonth
      ],
      async () => {
        if (await waitForAuth()) {
          await loadAllData()
        }
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

    // Günlük harcama limiti
    const dailySpendingLimit = computed(() => {
      if (!monthData.value.periodStartDate || !monthData.value.cutoffDate) {
        return 0
      }
      
      const startDate = new Date(monthData.value.periodStartDate)
      const endDate = new Date(monthData.value.cutoffDate)
      
      // Toplam gün sayısı
      const diffTime = Math.abs(endDate - startDate)
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      
      // Toplam bütçe
      const totalBudget = store.getters['income/totalIncome'] - 
        (store.getters['bills/totalBills'] + 
         store.getters['debts/totalDebts'] +
         store.state.savings.monthlySavings)
      
      // Bugünün tarihini al
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Bugün dönem içinde mi kontrol et
      const todayTime = today.getTime()
      const startTime = startDate.setHours(0, 0, 0, 0)
      const endTime = endDate.setHours(0, 0, 0, 0)
      
      let isInCurrentPeriod = false
      
      // Dönem başlangıcı kesim tarihinden sonraysa (ay geçişi var)
      if (startTime > endTime) {
        // Önceki ayın dönem başlangıcını hesapla
        const prevMonthStart = new Date(startTime)
        prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
        const prevStartTime = prevMonthStart.getTime()
        
        // Sonraki ayın kesim tarihini hesapla
        const nextMonthEnd = new Date(endTime)
        nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1)
        const nextEndTime = nextMonthEnd.getTime()
        
        // Bugün ya önceki dönemde ya da sonraki dönemde olmalı
        isInCurrentPeriod = (todayTime >= prevStartTime && todayTime <= endTime) || 
                           (todayTime >= startTime && todayTime <= nextEndTime)
      } else {
        // Normal durum - başlangıç ve bitiş aynı ayda
        isInCurrentPeriod = todayTime >= startTime && todayTime <= endTime
      }
      
      // Eğer bugün dönem içinde değilse, statik limit döndür
      if (!isInCurrentPeriod) {
        return totalBudget / totalDays
      }
      
      // Bugüne kadar olan harcamaları topla
      const expensesToDate = store.state.expenses.expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date)
          expenseDate.setHours(0, 0, 0, 0)
          
          // Bugünden önceki ve dönem içindeki harcamaları al
          return expenseDate < today && expenseDate >= new Date(startTime)
        })
        .reduce((total, expense) => total + Number(expense.amount), 0)
      
      // Bugünden dönem sonuna kadar kalan gün sayısı
      const daysLeft = Math.ceil((endTime - todayTime) / (1000 * 60 * 60 * 24)) + 1
      
      // Kalan bütçe
      const remainingBudget = totalBudget - expensesToDate
      
      // Kalan günlük limit
      return remainingBudget / daysLeft
    })

    // Günlük limit değişim bilgisi
    const dailyLimitChangeInfo = computed(() => {
      if (!monthData.value.periodStartDate || !monthData.value.cutoffDate) {
        return { change: 0, direction: 'none' }
      }
      
      // Toplam gün sayısı
      const startDate = new Date(monthData.value.periodStartDate)
      const endDate = new Date(monthData.value.cutoffDate)
      
      // Toplam bütçe
      const totalBudget = store.getters['income/totalIncome'] - 
        (store.getters['bills/totalBills'] + 
         store.getters['debts/totalDebts'] +
         store.state.savings.monthlySavings)
      
      // Statik günlük limit
      const staticDailyLimit = totalBudget / Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      
      // Değişim miktarı ve yönü
      const change = dailySpendingLimit.value - staticDailyLimit
      const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'none'
      
      return {
        change: Math.abs(change),
        direction
      }
    })

    // Dönem içi harcamaları hesapla
    const totalPeriodExpenses = computed(() => {
      if (!monthData.value.periodStartDate || !monthData.value.cutoffDate) return 0

      return store.state.expenses.expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date)
          const checkTime = expenseDate.setHours(0, 0, 0, 0)
          const startTime = new Date(monthData.value.periodStartDate).setHours(0, 0, 0, 0)
          const endTime = new Date(monthData.value.cutoffDate).setHours(0, 0, 0, 0)

          // Dönem başlangıcı kesim tarihinden sonraysa (ay geçişi var)
          if (startTime > endTime) {
            // Önceki ayın dönem başlangıcını hesapla
            const prevMonthStart = new Date(startTime)
            prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
            const prevStartTime = prevMonthStart.getTime()

            // Sonraki ayın kesim tarihini hesapla
            const nextMonthEnd = new Date(endTime)
            nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1)
            const nextEndTime = nextMonthEnd.getTime()

            // Tarih ya önceki dönemde ya da sonraki dönemde olmalı
            return (checkTime >= prevStartTime && checkTime <= endTime) || 
                   (checkTime >= startTime && checkTime <= nextEndTime)
          }

          // Normal durum - başlangıç ve bitiş aynı ayda
          return checkTime >= startTime && checkTime <= endTime
        })
        .reduce((total, expense) => total + Number(expense.amount), 0)
    })

    // Harcama silme işlemi
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

        const expenseDate = new Date(expense.date)
        
        await store.dispatch('expenses/deleteExpense', {
          year: expenseDate.getFullYear().toString(),
          month: expenseDate.getMonth().toString(),
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

    // Silme onayı
    const confirmDelete = (expenseId) => {
      selectedExpenseId.value = expenseId
      showConfirmDelete.value = true
    }

    const exportToPDF = () => {
      const element = document.querySelector('.calendar-grid')
      if (!element) return

      // PDF için özel stil ekle
      const pdfStyle = document.createElement('style')
      pdfStyle.textContent = `
        @media print {
          .calendar-grid {
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
          }
          .grid-header, .grid-body {
            font-size: 8pt !important;
          }
          .day-number {
            font-size: 10pt !important;
          }
          .expense-summary {
            font-size: 8pt !important;
            line-height: 1.2;
          }
          .indicator {
            font-size: 7pt !important;
          }
          .budget-warning,
          .no-expense-info,
          .budget-safe {
            font-size: 7pt !important;
            padding: 2px 4px !important;
          }
        }
      `
      document.head.appendChild(pdfStyle)

      const opt = {
        margin: 10,
        filename: `takvim-${props.year}-${Number(props.month) + 1}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          letterRendering: true,
          useCORS: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { mode: 'avoid-all' } // Sayfa içi elementlerin bölünmesini önle
      }

      html2pdf().set(opt).from(element).save().then(() => {
        document.head.removeChild(pdfStyle)
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
                border: 1px solid #eee;
                border-radius: 8px;
                padding: 0.5rem;
                position: relative;
                background: white;
                transition: all 0.2s ease;
                display: flex;
                flex-direction: column;
                overflow: hidden;
              }

              .weekday {
                text-align: center;
                font-weight: 500;
                color: #003B5C;
              }

              .day-number {
                font-size: 0.9rem;
                margin-bottom: 0.3rem;
              }

              .expense-summary {
                margin-top: auto;
                font-size: 0.85rem;
                line-height: 1.2;
              }

              .day-actions {
                margin-top: 0.3rem;
                gap: 0.3rem;
              }

              .budget-warning,
              .no-expense-info,
              .budget-safe {
                padding: 0.3rem;
                margin-top: 0.3rem;
                font-size: 0.8rem;
                line-height: 1.1;
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

    // Modal açma/kapama metodları
    const startEditingCutoff = () => {
      isEditingCutoff.value = true
      if (monthData.value.cutoffDate) {
        cutoffDateInput.value = new Date(monthData.value.cutoffDate).toISOString().split('T')[0]
      }
    }

    const saveCutoffDate = async () => {
      if (!cutoffDateInput.value) {
        isEditingCutoff.value = false
        return
      }
      
      const timestamp = new Date(cutoffDateInput.value).getTime()
      if (isNaN(timestamp)) {
        console.error('Geçersiz tarih')
        return
      }

      monthData.value.cutoffDate = timestamp
      isEditingCutoff.value = false
      saveDates()
    }

    const startEditingPeriod = () => {
      isEditingPeriod.value = true
      if (monthData.value.periodStartDate) {
        periodStartInput.value = new Date(monthData.value.periodStartDate).toISOString().split('T')[0]
      }
    }

    const savePeriodDate = async () => {
      if (!periodStartInput.value) {
        isEditingPeriod.value = false
        return
      }
      
      const timestamp = new Date(periodStartInput.value).getTime()
      if (isNaN(timestamp)) {
        console.error('Geçersiz tarih')
        return
      }

      monthData.value.periodStartDate = timestamp
      isEditingPeriod.value = false
      saveDates()
    }

    // Tarihleri kaydet
    const saveDates = async () => {
      try {
        // Tarihleri timestamp'e çevir
        const cutoffTimestamp = cutoffDateInput.value ? 
          new Date(cutoffDateInput.value).getTime() : null
        
        const periodStartTimestamp = periodStartInput.value ? 
          new Date(periodStartInput.value).getTime() : null

        // Null check yap
        if ((cutoffDateInput.value && isNaN(cutoffTimestamp)) || 
            (periodStartInput.value && isNaN(periodStartTimestamp))) {
          throw new Error('Geçersiz tarih formatı')
        }

        await expenseAPI.updateMonthDates(props.year, props.month, {
          cutoffDate: cutoffTimestamp,
          periodStartDate: periodStartTimestamp
        })

        // State'i güncelle
        monthData.value = {
          ...monthData.value,
          cutoffDate: cutoffTimestamp,
          periodStartDate: periodStartTimestamp
        }
      } catch (error) {
        console.error('Tarihler kaydedilemedi:', error)
        throw error
      }
    }

    // Gün seçme işlemi
    const selectDate = (date) => {
      selectedDate.value = date
    }

    // Seçili gün kontrolü
    const isSelected = (date) => {
      if (!selectedDate.value || !date) return false
      return date.toDateString() === selectedDate.value.toDateString()
    }

    // Bugün kontrolü
    const isToday = (date) => {
      if (!date) return false
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    // Kesim tarihi kontrolü
    const isCutoffDate = (date) => {
      if (!date || !monthData.value.cutoffDate) return false
      const checkTime = new Date(date).setHours(0, 0, 0, 0)
      const cutoffTime = new Date(monthData.value.cutoffDate).setHours(0, 0, 0, 0)
      return checkTime === cutoffTime
    }

    // Dönem başlangıç tarihi kontrolü
    const isPeriodStart = (date) => {
      if (!date || !monthData.value.periodStartDate) return false
      const checkTime = new Date(date).setHours(0, 0, 0, 0)
      const startTime = new Date(monthData.value.periodStartDate).setHours(0, 0, 0, 0)
      return checkTime === startTime
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

    // Tarih formatlama fonksiyonu
    const formatPeriodDate = (dateString) => {
      if (!dateString) return 'Seçilmedi'
      
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      
      return `${day}.${month}.${year}`
    }

    return {
      weekDays,
      monthDays,
      monthName,
      year,
      showExpenseList,
      showExpenseForm,
      selectedDate,
      selectedDayExpenses,
      openDetailsModal,
      closeDetailsModal,
      openAddExpenseModal,
      closeAddExpenseModal,
      handleAddExpense,
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
      totalPeriodExpenses,
      showConfirmDelete,
      selectedExpenseId,
      confirmDelete,
      handleDelete,
      exportToPDF,
      printCalendar,
      navigateMonth,
      isLoading,
      selectDate,
      isSelected,
      dailyLimitChangeInfo,
      formatPeriodDate,
      startEditingCutoff,
      saveCutoffDate,
      startEditingPeriod,
      savePeriodDate
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
  background-color: rgba(0, 59, 92, 0.05);
}

.back-btn i {
  color: #009B9F;
}

.calendar-grid {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 59, 92, 0.1);
  overflow: hidden;
}

.grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8f9fa;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #003B5C;
}

.grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
}

.calendar-day {
  position: relative;
  min-height: 120px;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  cursor: pointer;
}

.calendar-day:hover {
  box-shadow: 0 2px 12px rgba(0, 59, 92, 0.1);
  border-color: #009B9F;
}

.calendar-day.not-current-month {
  background-color: #f8f9fa;
  color: #adb5bd;
}

.calendar-day.today {
  position: relative;
  border: 2px solid rgba(255, 182, 193, 0.9) !important;
  box-shadow: 0 2px 12px rgba(255, 182, 193, 0.2);
  padding: 1rem;
  min-height: 140px;
}

.calendar-day.today::before {
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

.calendar-day.today > * {
  position: relative;
  z-index: 1;
  background: rgb(255, 237, 250, 0.5);
}

.calendar-day.cutoff-date {
  background-color: rgba(220, 53, 69, 0.1);
  border: 2px solid rgba(220, 53, 69, 0.3);
  box-shadow: 0 2px 12px rgba(220, 53, 69, 0.15);
}

.calendar-day.period-start {
  background-color: rgba(0, 178, 169, 0.1);
  border: 2px solid rgba(0, 178, 169, 0.3);
  box-shadow: 0 2px 12px rgba(0, 178, 169, 0.15);
}

.calendar-day.period-active {
  background-color: rgba(0, 178, 169, 0.05);
  border: 1px solid rgba(0, 178, 169, 0.2);
  box-shadow: 0 2px 8px rgba(0, 178, 169, 0.1);
  opacity: 1;
}

.calendar-day.period-inactive {
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  opacity: 0.5;
  pointer-events: none;
}

.calendar-day.period-inactive * {
  pointer-events: none;
}

.calendar-day.period-inactive .day-number,
.calendar-day.period-inactive .expense-summary,
.calendar-day.period-inactive .day-actions {
  opacity: 0.5;
}

.calendar-day.period-active .day-number {
  color: #003B5C;
  font-weight: 600;
}

.calendar-day.period-active .expense-summary {
  opacity: 1;
}

.calendar-day.period-inactive .day-number,
.calendar-day.period-inactive .expense-summary {
  opacity: 0.5;
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

@media (max-width: 768px) {
  .calendar-container {
    padding: 0.5rem;
    margin-top: 1rem;
  }

  .grid-body-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  .grid-body-wrapper::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  .grid-body {
    min-width: max-content;
    gap: 0.25rem;
  }

  .grid-cell {
    min-width: 120px;
  }

  .month-actions {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons-container {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.9rem;
    justify-content: center;
  }

  .export-buttons {
    display: flex;
    gap: 0.75rem;
    width: 100%;
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 59, 92, 0.1);
  }

  .export-btn {
    flex: 1;
    justify-content: center;
    padding: 0.75rem;
  }

  .period-settings {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 59, 92, 0.05);
    border-radius: 12px;
  }

  .date-setting {
    width: 100%;
  }

  .month-summary {
    display: flex !important;
    flex-direction: column !important;
    padding: 1rem;
    background: rgba(0, 59, 92, 0.05);
    border-radius: 12px;
    gap: 0.75rem;
  }

  .summary-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 59, 92, 0.1);
  }

  .summary-item .label {
    color: #666;
    font-size: 0.9rem;
  }

  .summary-item .amount {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .summary-divider {
    display: none;
  }

  .summary-item:last-child {
    background: rgba(0, 178, 169, 0.05);
    border: 1px solid rgba(0, 178, 169, 0.1);
  }

  .grid-header-container {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .month-title {
    width: 100%;
  }

  .month-navigation {
    justify-content: space-between;
    width: 100%;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
    background: rgba(0, 59, 92, 0.05);
    border-radius: 8px;
  }
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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #003B5C;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* DayCell içeriği için yeni stiller */
:deep(.day-cell) {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
}

:deep(.expense-summary) {
  margin-top: auto;
  font-size: 0.85rem;
  line-height: 1.2;
}

:deep(.day-actions) {
  margin-top: 0.3rem;
  gap: 0.3rem;
}

:deep(.budget-warning),
:deep(.no-expense-info),
:deep(.budget-safe) {
  padding: 0.3rem;
  margin-top: 0.3rem;
  font-size: 0.8rem;
  line-height: 1.1;
}

.day-number {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.day-header {
  background-color: rgba(91, 145, 59, 0.1);
  padding: 0.3rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-number {
  font-size: 0.9rem;
  font-weight: 500;
  color: #003B5C;
}

.day-actions {
  display: flex;
  gap: 0.3rem;
}

.view-btn,
.add-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #003B5C;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.view-btn:hover,
.add-btn:hover {
  opacity: 1;
}

.month-summary {
  background: rgba(0, 59, 92, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  width: 100%;
}

.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
  align-items: center;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.limit-change {
  margin-top: 0 !important;
  font-size: 0.85rem;
  padding-left: 20px;
}

.summary-item.limit-change {
  margin-top: -10px;
  font-size: 0.85rem;
  padding-left: 20px;
}

.limit-change .label {
  font-style: italic;
  opacity: 0.8;
}

.limit-change .amount {
  display: flex;
  align-items: center;
  gap: 5px;
}

.limit-change .amount i {
  font-size: 0.8rem;
}

.limit-change .amount.positive {
  color: #28a745;
}

.limit-change .amount.negative {
  color: #dc3545;
}
</style>