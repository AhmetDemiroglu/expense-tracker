<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Birikim Hedefi</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="savings-form">
        <div class="form-group">
          <label for="savings">Bu Ay İçin Birikim Hedefi (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="savings"
              v-model="amount"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              autocomplete="off"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="savings-info">
          <div class="info-item">
            <i class="fas fa-piggy-bank"></i>
            <p>Bu ay için belirlediğiniz birikim hedefi, aylık harcama limitinizden düşülecektir.</p>
          </div>
          <div class="info-item">
            <i class="fas fa-chart-line"></i>
            <p>Birikiminiz, günlük harcama limitinizin hesaplanmasında dikkate alınır.</p>
          </div>
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
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { expenseAPI } from '@/services/api'

export default {
  name: 'SavingsModal',
  setup(props, { emit }) {
    const store = useStore()
    const amount = ref(0)

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(value)
    }

    const handleSubmit = async () => {
      try {
        await store.dispatch('savings/updateSavings', {
          year: store.state.selectedYear,
          month: store.state.selectedMonth,
          amount: Number(amount.value)
        })
        emit('close')
      } catch (error) {
        console.error('Birikim hedefi güncellenemedi:', error)
      }
    }

    // Mevcut birikim hedefini yükle
    onMounted(async () => {
      try {
        const savings = await store.dispatch('savings/fetchMonthlySavings', {
          year: store.state.selectedYear,
          month: store.state.selectedMonth
        })
        amount.value = savings
      } catch (error) {
        console.error('Birikim hedefi yüklenemedi:', error)
      }
    })

    return {
      amount,
      formatCurrency,
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* Sadece özel stiller kalacak, diğerleri modal.css'ten gelecek */
.savings-info {
  margin: 2rem 0;
  padding: 1rem;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  color: #ffc107;
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

.info-item p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Diğer tüm stiller silinecek çünkü modal.css'te var */
</style> 