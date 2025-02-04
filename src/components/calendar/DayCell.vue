<template>
  <div 
    class="day-cell"
  >
    <!-- Hesap kesim ve dönem başlangıç göstergeleri -->
    <div class="day-indicators" v-if="isCutoffDate || isPeriodStart">
      <span v-if="isCutoffDate" class="indicator cutoff">
        Hesap Kesim
      </span>
      <span v-if="isPeriodStart" class="indicator period-start">
        Dönem Başlangıcı
      </span>
    </div>

    <div class="day-content">
      <div class="day-header">
        <span class="day-number">{{ day.date.getDate() }}</span>
        <div class="day-actions">
          <button 
            class="view-btn" 
            @click="$emit('show-details', day.date)"
            title="Harcamaları Görüntüle"
            :disabled="!isInPeriod"
          >
            <i class="fas fa-eye"></i>
          </button>
          <button 
            class="add-btn" 
            @click="$emit('add-expense', day.date)"
            title="Harcama Ekle"
            :disabled="!isInPeriod"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
      
      <div class="expense-summary">
        <div class="total-expense">{{ formatCurrency(dayTotal) }}</div>
        <div 
          class="remaining-limit"
          :class="{ 
            'positive': remainingLimit > 0,
            'negative': remainingLimit < 0 
          }"
        >
          {{ isInPeriod ? formatCurrency(remainingLimit) : formatCurrency(0) }}
        </div>
      </div>

      <!-- Gün tamamlandı ve bütçe kontrolü -->
      <div v-if="isDayCompleted && isInPeriod" class="day-status">
        <template v-if="hasExpenses">
          <!-- Bütçe aşımı uyarısı -->
          <div v-if="isOverBudget" class="budget-warning">
            <i class="fas fa-exclamation-circle"></i>
            Bütçe limitini aştınız
          </div>
          <!-- Harcama var ve limit aşılmamış -->
          <div v-else class="status-success">
            <div class="success-box under-budget">
              <i class="fas fa-star"></i>
              <span class="status-message">Bütçenizi korudunuz</span>
            </div>
          </div>
        </template>
        <!-- Harcama yok bilgisi -->
        <div v-else-if="showNoExpenseInfo" class="no-expense-info">
          <i class="fas fa-grin-stars"></i>
          Bugün hiç harcama yapmadınız
        </div>
        <!-- Bütçe güvenli bilgisi -->
        <div v-else-if="showBudgetSafe" class="budget-safe">
          <i class="fas fa-shield-alt"></i>
          Bütçenizi korudunuz
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'DayCell',
  props: {
    day: {
      type: Object,
      required: true
    },
    isInPeriod: {
      type: Boolean,
      default: true
    },
    monthData: {
      type: Object,
      default: () => ({})
    },
    isCutoffDate: {
      type: Boolean,
      default: false
    },
    isPeriodStart: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const store = useStore()
    
    const dailyLimit = computed(() => {
      const monthData = props.monthData
      if (!monthData?.cutoffDate || !monthData?.periodStartDate) return 0

      const startDate = new Date(monthData.periodStartDate)
      const endDate = new Date(monthData.cutoffDate)
      
      const diffTime = Math.abs(endDate - startDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      
      const remainingBudget = store.getters['income/totalIncome'] - 
                            (store.getters['bills/totalBills'] + 
                             store.getters['debts/totalDebts'] +
                             store.state.savings.monthlySavings)
      
      return remainingBudget / diffDays
    })

    const dayExpenses = computed(() => {
      return store.state.expenses.expenses.filter(expense => {
        const cellDate = props.day.date
        
        // Harcamanın gerçek tarihine göre filtrele
        return expense.expenseDate.day === cellDate.getDate() &&
               expense.expenseDate.month === cellDate.getMonth() &&
               expense.expenseDate.year === cellDate.getFullYear()
      })
    })

    const dayTotal = computed(() => {
      return dayExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
    })

    const remainingLimit = computed(() => {
      return dailyLimit.value - dayTotal.value
    })

    const hasExpenses = computed(() => dayExpenses.value.length > 0)

    const isDayCompleted = computed(() => {
      const now = new Date()
      const dayEnd = new Date(props.day.date)
      dayEnd.setHours(23, 59, 59, 999)
      return now > dayEnd
    })

    const isDayUnderBudget = computed(() => {
      return dayTotal.value <= dailyLimit.value
    })

    const isOverBudget = computed(() => {
      return remainingLimit.value < 0
    })

    const showNoExpenseInfo = computed(() => {
      return !hasExpenses.value
    })

    const showBudgetSafe = computed(() => {
      return isDayCompleted.value && isInPeriod.value && isDayUnderBudget.value
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount)
    }

    return {
      dayTotal,
      remainingLimit,
      hasExpenses,
      formatCurrency,
      isDayCompleted,
      isDayUnderBudget,
      dayExpenses,
      isOverBudget,
      showNoExpenseInfo,
      showBudgetSafe
    }
  }
}
</script>

<style scoped>
.day-cell {
  background: white;
  border-radius: 8px;
  padding: 0.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.different-month {
  opacity: 0.5;
}

.day-indicators {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  right: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.7rem;
  z-index: 1;
}

.day-content {
  display: flex;
  flex-direction: column;
  padding-top: 1.75rem; /* Göstergeler için üstte boşluk azaltıldı */
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.day-number {
  font-weight: 500;
  color: #003B5C;
}

.day-actions {
  display: flex;
  gap: 0.5rem;
}

.view-btn,
.add-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s ease;
}

.view-btn {
  color: #009B9F;
  opacity: 0.7;
}

.view-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.add-btn {
  color: #00B2A9;
}

.add-btn:hover {
  transform: scale(1.1);
}

.view-btn:disabled,
.add-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
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
  margin-top: 0.25rem;
}

.remaining-limit.positive {
  color: #00B2A9;
}

.remaining-limit.negative {
  color: #dc3545;
}

.day-status {
  margin-top: 0.25rem;
  text-align: center;
  font-size: 0.8rem;
}

.status-warning,
.status-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.warning-box,
.success-box {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.warning-box {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.success-box.under-budget {
  background-color: rgba(255, 152, 0, 0.15);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.4);
}

.success-box.no-expense {
  background-color: rgba(147, 51, 234, 0.1);
  color: rgb(147, 51, 234);
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.status-message {
  font-size: 0.7rem;
  font-weight: 600;
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

.budget-warning,
.no-expense-info,
.budget-safe {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.budget-warning {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.no-expense-info {
  background-color: rgba(40, 167, 69, 0.15);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.4);
}

.budget-safe {
  background-color: rgba(255, 152, 0, 0.15);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.4);
}
</style> 