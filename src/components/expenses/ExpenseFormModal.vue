<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ formatDate }} - Yeni Harcama</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="expense-form">
        <div class="form-group">
          <label for="amount">Tutar (TL)</label>
          <div class="amount-input">
            <input
              type="number"
              id="amount"
              v-model="form.amount"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
            <span class="currency">₺</span>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Harcama Nedeni</label>
          <input
            type="text"
            id="description"
            v-model="form.description"
            required
            placeholder="Örn: Market alışverişi"
          />
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
            İptal
          </button>
          <button type="submit" class="save-btn" :disabled="!isValid">
            <i class="fas fa-check"></i>
            Kaydet
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ExpenseFormModal',
  props: {
    date: {
      type: Date,
      required: true
    }
  },
  setup(props, { emit }) {
    const form = ref({
      amount: '',
      description: ''
    })

    const formatDate = computed(() => {
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(props.date)
    })

    const isValid = computed(() => {
      return form.value.amount > 0 && form.value.description.trim().length > 0
    })

    const handleSubmit = () => {
      if (!isValid.value) return

      emit('save', {
        amount: parseFloat(form.value.amount),
        description: form.value.description.trim()
      })
    }

    return {
      form,
      formatDate,
      isValid,
      handleSubmit
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
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 59, 92, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  color: #003B5C;
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #003B5C;
}

.expense-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #003B5C;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.amount-input {
  position: relative;
  display: flex;
  align-items: center;
}

.amount-input input {
  padding-right: 2rem;
}

.currency {
  position: absolute;
  right: 1rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(0, 59, 92, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #009B9F;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: none;
  border: 1px solid rgba(0, 59, 92, 0.2);
  color: #666;
}

.cancel-btn:hover {
  background: #f8f9fa;
}

.save-btn {
  background-color: #003B5C;
  border: none;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #004b73;
  transform: translateY(-2px);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
  }
}
</style> 