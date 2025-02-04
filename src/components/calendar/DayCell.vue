<template>
  <div 
    class="day-cell"
  >
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
    
    <div class="day-content">
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
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
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
      default: null
    }
  },
  setup(props) {
    const store = useStore()
    
    const dailyLimit = computed(() => {
      const monthData = props.monthData // monthData'yı prop olarak alalım
      if (!monthData?.cutoffDate || !monthData?.periodStartDate) return 0

      const startDate = new Date(monthData.periodStartDate)
      const endDate = new Date(monthData.cutoffDate)
      
      // Tarihler arası gün farkını hesapla
      const diffTime = Math.abs(endDate - startDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 ile son günü de dahil et
      
      // Kalan bütçeyi gün sayısına böl
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
      formatCurrency
    }
  }
}
</script>

<style scoped>
.day-cell {
  background: white;
  border-radius: 8px;
  padding: 0.75rem;
  min-height: 120px;
  border: 1px solid rgba(0, 59, 92, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
}

.different-month {
  opacity: 0.5;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
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

.day-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.expense-summary {
  text-align: right;
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
</style> 