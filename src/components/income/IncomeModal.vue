<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Gelir Ekle</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
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
            <span class="amount positive">{{ formatCurrency(totalIncome) }}</span>
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
      </div>

      <!-- Güncelleme Onay Modalı -->
      <ConfirmModalEdit
        v-if="showConfirmUpdate"
        title="Gelirleri Güncelle"
        message="Gelir bilgilerini güncellemek istediğinizden emin misiniz?"
        @confirm="confirmUpdate"
        @cancel="showConfirmUpdate = false"
      />
    </div>
  </div>
</template>

<script>
import '@/assets/styles/modal.css'
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { expenseAPI } from '@/services/api'
import ConfirmModalEdit from '../shared/ConfirmModalEdit.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'IncomeModal',
  components: {
    ConfirmModalEdit
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore()
    const toast = useToast()
    const form = ref({
      salary: 0,
      rent: 0,
      other: 0
    })
    const initialForm = ref({})
    const showConfirmUpdate = ref(false)

    // Seçili yıl ve ay bilgisini store'dan al
    const selectedYear = computed(() => store.state.selectedYear)
    const selectedMonth = computed(() => store.state.selectedMonth)

    const totalIncome = computed(() => {
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
          await store.dispatch('income/updateIncome', {
            type,
            amount: Number(amount),
            year: selectedYear.value,
            month: selectedMonth.value 
          })
        }
        showConfirmUpdate.value = false
        emit('close')
        toast.success('Gelir başarıyla güncellendi')
      } catch (error) {
        console.error('Gelir güncellenemedi:', error)
        toast.error('Gelir güncellenemedi: ' + error.message)
      }
    }

    const clearForm = () => {
      form.value = {
        salary: 0,
        rent: 0,
        other: 0
      }
    }

    // Mevcut gelir bilgilerini yükle
    onMounted(async () => {
      try {
        const income = await expenseAPI.getMonthlyIncome(
          selectedYear.value,
          selectedMonth.value
        )
        
        if (income) {
          const formData = {
            salary: Number(income.salary) || 0,
            rent: Number(income.rent) || 0,
            other: Number(income.other) || 0
          }
          form.value = { ...formData }
          initialForm.value = { ...formData }
        }
      } catch (error) {
        console.error('Gelir bilgileri yüklenemedi:', error)
      }
    })

    return {
      form,
      totalIncome,
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
/* Sadece form içi özel stiller */
.income-form {
  padding: 0 1rem;
}

.form-summary {
  margin: 2rem 0;
  padding: 1.25rem;
  background: rgba(0, 59, 92, 0.05);
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
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

.amount.positive {
  color: #00B2A9;
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