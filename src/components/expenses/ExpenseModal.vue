<template>
  <div class="modal" v-if="show">
    <div class="modal-content">
      <h3>{{ title }}</h3>
      <expense-form
        :initial-data="expenseData"
        @submit="handleSubmit"
      />
      <button @click="close">İptal</button>
    </div>
  </div>
</template>

<script>
import ExpenseForm from './ExpenseForm.vue'

export default {
  name: 'ExpenseModal',
  components: {
    ExpenseForm
  },
  props: {
    show: Boolean,
    title: String,
    expenseData: Object
  },
  methods: {
    handleSubmit(expense) {
      this.$emit('submit', expense)
      this.close()
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
}
</style> 