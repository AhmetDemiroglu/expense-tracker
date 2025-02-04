<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Borçlar</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="debts-form">
        <div class="form-group">
          <label for="creditCard">Kredi Kartı (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="creditCard"
              v-model="form.creditCard"
              step="0.01"
              min="0"
              placeholder="0.00"
              autocomplete="off"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="loan">Kredi (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="loan"
              v-model="form.loan"
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
          <span class="label">Toplam Borç:</span>
          <span class="amount negative">{{ formatCurrency(totalDebt) }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { expenseAPI } from '@/services/api'

export default {
  name: 'DebtsModal',
  setup(props, { emit }) {
    const store = useStore()
    const form = ref({
      creditCard: 0,
      loan: 0,
      other: 0
    })

    const totalDebt = computed(() => {
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
          await store.dispatch('debts/updateDebt', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth,
            type,
            amount: Number(amount)
          })
        }
        emit('close')
      } catch (error) {
        console.error('Borçlar güncellenemedi:', error)
      }
    }

    // Mevcut borçları yükle
    onMounted(async () => {
      try {
        const debts = await store.dispatch('debts/fetchMonthlyDebts', {
          year: store.state.selectedYear,
          month: store.state.selectedMonth
        })
        form.value = { ...debts }
      } catch (error) {
        console.error('Borçlar yüklenemedi:', error)
      }
    })

    return {
      form,
      totalDebt,
      formatCurrency,
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* Sadece özel stiller kalacak, diğerleri modal.css'ten gelecek */
.form-summary .amount.negative {
  color: #dc3545;
}

/* Diğer tüm stiller silinecek çünkü modal.css'te var */
</style> 