<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <LoginForm v-if="currentMode === 'login'" @success="handleSuccess" />
      <RegisterForm v-else @success="handleSuccess" />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

export default {
  name: 'AuthModal',
  components: {
    LoginForm,
    RegisterForm
  },
  props: {
    mode: {
      type: String,
      required: true,
      validator: value => ['login', 'register'].includes(value)
    }
  },
  emits: ['close', 'change-mode'],
  setup(props, { emit }) {
    const currentMode = ref(props.mode)

    const title = computed(() => 
      currentMode.value === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
    )

    const handleSuccess = (nextMode) => {
      if (nextMode === 'login') {
        currentMode.value = 'login'
      } else {
        emit('close')
      }
    }

    return {
      currentMode,
      title,
      handleSuccess
    }
  },
  watch: {
    mode(newMode) {
      this.currentMode = newMode
    }
  }
}
</script>

<style scoped>
@import '@/assets/styles/modal.css';
</style> 