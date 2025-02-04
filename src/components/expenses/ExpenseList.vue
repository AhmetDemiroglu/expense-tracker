<template>
  <div class="expense-list">
    <div v-for="expense in expenses" :key="expense.id" class="expense-item">
      <div class="expense-details">
        <span class="amount">{{ expense.amount }} TL</span>
        <span class="description">{{ expense.description }}</span>
      </div>
      <div class="expense-actions">
        <button @click="editExpense(expense)">Düzenle</button>
        <button @click="deleteExpense(expense.id)">Sil</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpenseList',
  props: {
    expenses: {
      type: Array,
      required: true
    }
  },
  methods: {
    editExpense(expense) {
      this.$emit('edit', expense)
    },
    deleteExpense(id) {
      this.$emit('delete', id)
    }
  }
}
</script>

<style scoped>
.expense-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style> 