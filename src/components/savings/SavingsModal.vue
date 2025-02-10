<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Birikim Hedefi</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
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
            <button type="button" class="clear-btn" @click="clearForm">
              <i class="fas fa-trash"></i>
              Temizle
            </button>
            <div class="action-buttons">
              <button type="button" class="cancel-btn" @click="$emit('close')">
                <i class="fas fa-times"></i>
                İptal
              </button>
              <button type="submit" class="save-btn">
                <i class="fas fa-check"></i>
                Kaydet
              </button>
            </div>
          </div>
        </form>

        <!-- Güncelleme Onay Modalı -->
        <ConfirmModalEdit
          v-if="showConfirmUpdate"
          title="Birikim Hedefini Güncelle"
          message="Birikim hedefini güncellemek istediğinizden emin misiniz?"
          @confirm="confirmUpdate"
          @cancel="showConfirmUpdate = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import '@/assets/styles/modal.css'
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { expenseAPI } from '@/services/api'
import ConfirmModalEdit from '../shared/ConfirmModalEdit.vue'

export default {
  name: 'SavingsModal',
  components: {
    ConfirmModalEdit
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore()
    const amount = ref(0)
    const initialAmount = ref(0) // Başlangıç değerini saklamak için
    const showConfirmUpdate = ref(false)

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(value)
    }

    const isAmountChanged = () => {
      return Number(amount.value) !== Number(initialAmount.value)
    }

    const handleSubmit = async () => {
      if (isAmountChanged()) {
        showConfirmUpdate.value = true
      } else {
        emit('close')
      }
    }

    const confirmUpdate = async () => {
      try {
        await store.dispatch('savings/updateSavings', {
          year: store.state.selectedYear,
          month: store.state.selectedMonth,
          amount: Number(amount.value)
        })
        showConfirmUpdate.value = false
        emit('close')
      } catch (error) {
        console.error('Birikim hedefi güncellenemedi:', error)
      }
    }

    const clearForm = () => {
      amount.value = 0
    }

    // Mevcut birikim hedefini yükle
    onMounted(async () => {
      try {
        const savings = await expenseAPI.getMonthlySavings(
          store.state.selectedYear,
          store.state.selectedMonth
        )
        
        // Eğer veri varsa formu güncelle
        if (savings !== null && savings !== undefined) {
          amount.value = Number(savings) || 0
          initialAmount.value = Number(savings) || 0 // Başlangıç değerini sakla
        }
      } catch (error) {
        console.error('Birikim bilgileri yüklenemedi:', error)
      }
    })

    return {
      amount,
      formatCurrency,
      handleSubmit,
      clearForm,
      showConfirmUpdate,
      confirmUpdate
    }
  }
}
</script>

<style scoped>
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

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.clear-btn:hover {
  background-color: #dc3545;
  color: white;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    width: 100%;
  }

  .clear-btn,
  .cancel-btn,
  .save-btn {
    flex: 1;
  }
}
</style> 