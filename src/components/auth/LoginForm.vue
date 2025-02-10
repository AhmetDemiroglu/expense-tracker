<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div class="form-group">
      <label for="email">E-posta</label>
      <input
        type="email"
        id="email"
        v-model="email"
        required
        autocomplete="email"
      />
    </div>

    <div class="form-group">
      <label for="password">Şifre</label>
      <input
        type="password"
        id="password"
        v-model="password"
        required
        autocomplete="current-password"
      />
    </div>

    <div v-if="error" class="error-message" role="alert">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
      </button>
    </div>
  </form>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'LoginForm',
  emits: ['success'],
  setup(props, { emit }) {
    const store = useStore()
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref(null)

    const handleSubmit = async () => {
      loading.value = true
      error.value = null

      try {
        await store.dispatch('auth/login', { email: email.value, password: password.value })
        emit('success')
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
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
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message i {
  font-size: 1.1rem;
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