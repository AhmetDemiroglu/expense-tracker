<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Faturalar</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="bills-form">
        <div class="form-group">
          <label for="phone">Telefon (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="phone"
              v-model="form.phone"
              step="0.01"
              min="0"
              placeholder="0.00"
              autocomplete="off"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="internet">İnternet (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="internet"
              v-model="form.internet"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="water">Su (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="water"
              v-model="form.water"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="maintenance">Aidat (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="maintenance"
              v-model="form.maintenance"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="naturalGas">Doğalgaz (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="naturalGas"
              v-model="form.naturalGas"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="electricity">Elektrik (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="electricity"
              v-model="form.electricity"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="pool">Havuz (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="pool"
              v-model="form.pool"
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
          <span class="label">Toplam Fatura:</span>
          <span class="amount negative">{{ formatCurrency(totalBills) }}</span>
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
        title="Faturaları Güncelle"
        message="Fatura bilgilerini güncellemek istediğinizden emin misiniz?"
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

export default {
  name: 'BillsModal',
  components: {
    ConfirmModalEdit
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore()
    const form = ref({
      phone: 0,
      internet: 0,
      water: 0,
      maintenance: 0,
      naturalGas: 0,
      electricity: 0,
      pool: 0,
      other: 0
    })
    const initialForm = ref({}) // Başlangıç değerlerini saklamak için
    const showConfirmUpdate = ref(false)

    const totalBills = computed(() => {
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
          await store.dispatch('bills/updateBill', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth,
            type,
            amount: Number(amount)
          })
        }
        showConfirmUpdate.value = false
        emit('close')
      } catch (error) {
        console.error('Faturalar güncellenemedi:', error)
      }
    }

    const clearForm = () => {
      form.value = {
        phone: 0,
        internet: 0,
        water: 0,
        maintenance: 0,
        naturalGas: 0,
        electricity: 0,
        pool: 0,
        other: 0
      }
    }

    // Mevcut fatura bilgilerini yükle
    onMounted(async () => {
      try {
        const bills = await expenseAPI.getMonthlyBills(
          store.state.selectedYear,
          store.state.selectedMonth
        )
        
        // Eğer veriler varsa formu güncelle
        if (bills) {
          const formData = {
            phone: Number(bills.phone) || 0,
            internet: Number(bills.internet) || 0,
            water: Number(bills.water) || 0,
            maintenance: Number(bills.maintenance) || 0,
            naturalGas: Number(bills.naturalGas) || 0,
            electricity: Number(bills.electricity) || 0,
            pool: Number(bills.pool) || 0,
            other: Number(bills.other) || 0
          }
          form.value = { ...formData }
          initialForm.value = { ...formData } // Başlangıç değerlerini sakla
        }
      } catch (error) {
        console.error('Fatura bilgileri yüklenemedi:', error)
      }
    })

    return {
      form,
      totalBills,
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
.bills-form {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 1rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1rem 0;
  border-top: 1px solid rgba(0, 59, 92, 0.1);
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