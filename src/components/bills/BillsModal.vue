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
          <span class="amount">{{ formatCurrency(totalBills) }}</span>
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
  name: 'BillsModal',
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

    const totalBills = computed(() => {
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
          await store.dispatch('bills/updateBill', {
            year: store.state.selectedYear,
            month: store.state.selectedMonth,
            type,
            amount: Number(amount)
          })
        }
        emit('close')
      } catch (error) {
        console.error('Faturalar güncellenemedi:', error)
      }
    }

    // Mevcut fatura bilgilerini yükle
    onMounted(async () => {
      try {
        const bills = await store.dispatch('bills/fetchMonthlyBills', {
          year: store.state.selectedYear,
          month: store.state.selectedMonth
        })
        form.value = { ...bills }
      } catch (error) {
        console.error('Faturalar yüklenemedi:', error)
      }
    })

    return {
      form,
      totalBills,
      formatCurrency,
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* Sadece özel stiller kalacak, diğerleri modal.css'ten gelecek */
.bills-form {
  max-height: 70vh;
  overflow-y: auto;
}

/* Diğer tüm stiller silinecek çünkü modal.css'te var */
</style> 