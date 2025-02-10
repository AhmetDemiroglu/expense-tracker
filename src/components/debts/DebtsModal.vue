<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Borçlar</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
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
          title="Borçları Güncelle"
          message="Borç bilgilerini güncellemek istediğinizden emin misiniz?"
          @confirm="confirmUpdate"
          @cancel="showConfirmUpdate = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import '@/assets/styles/modal.css'
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { expenseAPI } from '@/services/api'
import ConfirmModalEdit from '../shared/ConfirmModalEdit.vue'

export default {
  name: 'DebtsModal',
  components: {
    ConfirmModalEdit
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore()
    const form = ref({
      creditCard: 0,
      loan: 0,
      other: 0
    })
    const initialForm = ref({}) // Başlangıç değerlerini saklamak için
    const showConfirmUpdate = ref(false)

    const totalDebt = computed(() => {
      return Object.values(form.value).reduce((sum, val) => sum + Number(val), 0)
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount)
    }

    const isFormChanged = () => {
      return JSON.stringify(form.value) !== JSON.stringify(initialForm.value)
    }

    const handleSubmit = async () => {
      if (isFormChanged()) {
        showConfirmUpdate.value = true
      } else {
        emit('close')
      }
    }

    const confirmUpdate = async () => {
      try {
        for (const [type, amount] of Object.entries(form.value)) {
          await store.dispatch('debts/updateDebt', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth,
            type,
            amount: Number(amount)
          })
        }
        showConfirmUpdate.value = false
        emit('close')
      } catch (error) {
        console.error('Borçlar güncellenemedi:', error)
      }
    }

    const clearForm = () => {
      form.value = {
        creditCard: 0,
        loan: 0,
        other: 0
      }
    }

    // Mevcut borçları yükle
    onMounted(async () => {
      try {
        const debts = await expenseAPI.getMonthlyDebts(
          store.state.selectedYear,
          store.state.selectedMonth
        )
        
        // Eğer veriler varsa formu güncelle
        if (debts) {
          const formData = {
            creditCard: Number(debts.creditCard) || 0,
            loan: Number(debts.loan) || 0,
            other: Number(debts.other) || 0
          }
          form.value = { ...formData }
          initialForm.value = { ...formData } // Başlangıç değerlerini sakla
        }
      } catch (error) {
        console.error('Borç bilgileri yüklenemedi:', error)
      }
    })

    return {
      form,
      totalDebt,
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
  max-width: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1001;
  overflow: visible;
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

.amount.negative {
  color: #dc3545;
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