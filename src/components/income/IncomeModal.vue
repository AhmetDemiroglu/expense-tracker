<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Gelir Ekle</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="income-form">
        <div class="form-group">
          <label for="salary">Maaş (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="salary"
              v-model="form.salary"
              step="0.01"
              min="0"
              placeholder="0.00"
              autocomplete="off"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="rent">Kira (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="rent"
              v-model="form.rent"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="other">Diğer (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="other"
              v-model="form.other"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-summary">
          <span class="label">Toplam Gelir:</span>
          <span class="amount">{{ formatCurrency(totalIncome) }}</span>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
            İptal
          </button>
          <button type="submit" class="save-btn">
            <i class="fas fa-check"></i>
            Kaydet
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import '@/assets/styles/modal.css'
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { expenseAPI } from '@/services/api'

export default {
  name: 'IncomeModal',
  setup(props, { emit }) {
    const store = useStore()
    const form = ref({
      salary: 0,
      rent: 0,
      other: 0
    })

    const totalIncome = computed(() => {
      return Object.values(form.value).reduce((sum, val) => sum + Number(val), 0)
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount)
    }

    const handleSubmit = async () => {
      try {
        for (const [type, amount] of Object.entries(form.value)) {
          await store.dispatch('income/updateIncome', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth,
            type,
            amount: Number(amount)
          })
        }
        emit('close')
      } catch (error) {
        console.error('Gelir güncellenemedi:', error)
      }
    }

    return {
      form,
      totalIncome,
      formatCurrency,
      handleSubmit
    }
  }
}
</script>

<style scoped>
</style> 