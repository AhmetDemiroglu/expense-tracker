<template>
  <div class="month-selector">
    <button @click="previousMonth">&lt;</button>
    <span>{{ currentMonthYear }}</span>
    <button @click="nextMonth">&gt;</button>
  </div>
</template>

<script>
export default {
  name: 'MonthSelector',
  computed: {
    currentMonthYear() {
      // Ay ve yıl gösterimi burada olacak
      return 'Ocak 2024'
    }
  },
  methods: {
    previousMonth() {
      this.$emit('month-change', 'previous')
    },
    nextMonth() {
      this.$emit('month-change', 'next')
    }
  }
}
</script>

<style scoped>
.month-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
</style> 