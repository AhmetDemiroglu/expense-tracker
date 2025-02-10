<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div class="form-group">
      <label for="displayName">Ad Soyad</label>
      <input 
        type="text" 
        id="displayName"
        v-model="form.displayName"
        required
      />
    </div>

    <div class="form-group">
      <label for="email">E-posta</label>
      <input 
        type="email" 
        id="email"
        v-model="form.email"
        required
        autocomplete="email"
      />
    </div>

    <div class="form-group">
      <label for="password">Şifre</label>
      <input 
        type="password" 
        id="password"
        v-model="form.password"
        required
        autocomplete="new-password"
      />
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">
        Kayıt Ol
      </button>
    </div>
  </form>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export default {
  name: 'RegisterForm',
  emits: ['success'],
  setup(props, { emit }) {
    const store = useStore()
    const toast = useToast()
    const form = ref({
      displayName: '',
      email: '',
      password: ''
    })
    const loading = ref(false)
    const error = ref(null)

    const handleSubmit = async () => {
      loading.value = true
      error.value = null

      try {
        await store.dispatch('auth/register', form.value)
        toast.success('Kayıt başarılı! Lütfen giriş yapınız.')
        await new Promise(resolve => setTimeout(resolve, 500))
        emit('success', 'login')
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #003B5C;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 59, 92, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #00B2A9;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  padding: 0.5rem;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 8px;
}

.submit-btn {
  background: #00B2A9;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #009b94;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 