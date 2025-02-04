<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ formatDate(date) }} Harcamaları</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="expenses.length === 0" class="no-expenses">
          Bu tarihte harcama bulunmuyor.
        </div>

        <div v-else class="expense-list">
          <div v-for="expense in expenses" :key="expense.id" class="expense-item">
            <div class="expense-details">
              <span class="expense-description">{{ expense.description }}</span>
              <span class="expense-amount">{{ formatCurrency(expense.amount) }}</span>
            </div>
            <div class="expense-actions">
              <button class="delete-btn" @click="$emit('delete-expense', expense.id)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="expense-summary">
          <span class="label">Toplam:</span>
          <span class="amount">{{ formatCurrency(totalAmount) }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="add-btn" @click="$emit('add-expense')">
          <i class="fas fa-plus"></i>
          Yeni Harcama Ekle
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ExpenseListModal',
  props: {
    date: {
      type: Date,
      required: true
    },
    expenses: {
      type: Array,
      required: true
    }
  },
  emits: ['close', 'add-expense', 'delete-expense'],
  setup(props) {
    const store = useStore()

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date)
    }

    const totalAmount = computed(() => {
      return props.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount)
    }

    return {
      formatDate,
      totalAmount,
      formatCurrency,
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 59, 92, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  color: #003B5C;
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #003B5C;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.no-expenses {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.expense-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  margin-right: 1rem;
}

.expense-description {
  color: #003B5C;
  font-weight: 500;
}

.expense-amount {
  color: #009B9F;
  font-weight: 600;
}

.expense-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  padding: 0.25rem;
  border: none;
  background: none;
  color: #dc3545;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.1);
  color: #bd2130;
}

.expense-summary {
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 59, 92, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #003B5C;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 59, 92, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #003B5C;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background-color: #004b73;
  transform: translateY(-2px);
}
</style> 