<template>
  <form @submit.prevent="handleSubmit" class="expense-form">
    <div class="form-group">
      <label>Tutar</label>
      <input type="number" v-model="amount" required>
    </div>
    <div class="form-group">
      <label>Açıklama</label>
      <input type="text" v-model="description" required>
    </div>
    <div class="form-group">
      <label>Kategori</label>
      <select v-model="category" required>
        <option value="yemek">Yemek</option>
        <option value="ulasim">Ulaşım</option>
        <option value="market">Market</option>
        <!-- Diğer kategoriler -->
      </select>
    </div>
    <button type="submit">Kaydet</button>
  </form>
</template>

<script>
export default {
  name: 'ExpenseForm',
  data() {
    return {
      amount: 0,
      description: '',
      category: ''
    }
  },
  methods: {
    handleSubmit() {
      const expense = {
        amount: this.amount,
        description: this.description,
        category: this.category,
        date: new Date()
      }
      this.$emit('submit', expense)
    }
  }
}
</script>

<style scoped>
.expense-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style> 