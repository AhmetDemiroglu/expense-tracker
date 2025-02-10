<template>
  <div class="profile-container">
    <h1>Profil Bilgileri</h1>
    
    <form @submit.prevent="handleSubmit" class="profile-form">
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
          disabled
        />
      </div>

      <div class="form-group">
        <label for="password">Yeni Şifre</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          placeholder="Değiştirmek istemiyorsanız boş bırakın"
        />
      </div>

      <div class="form-actions">
        <button type="button" class="delete-btn" @click="showDeleteConfirm = true">
          <i class="fas fa-trash"></i>
          Hesabı Sil
        </button>
        <button type="submit" class="update-btn">
          <i class="fas fa-save"></i>
          Güncelle
        </button>
      </div>
    </form>

    <!-- Güncelleme Onay Modalı -->
    <ConfirmModalEdit
      v-if="showUpdateConfirm"
      title="Profil Güncellenecek"
      message="Profil bilgilerinizi güncellemek istediğinizden emin misiniz?"
      @confirm="confirmUpdate"
      @cancel="showUpdateConfirm = false"
    />

    <!-- Silme Onay Modalı -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="Hesap Silinecek"
      message="Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import ConfirmModalEdit from '@/components/shared/ConfirmModalEdit.vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'ProfileView',
  components: {
    ConfirmModal,
    ConfirmModalEdit
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const toast = useToast()
    
    const form = ref({
      displayName: '',
      email: '',
      password: ''
    })
    
    const showUpdateConfirm = ref(false)
    const showDeleteConfirm = ref(false)

    onMounted(() => {
      const user = store.state.auth.user
      
      if (!user) {
        toast.error('Kullanıcı bilgileri bulunamadı')
        router.push('/')
        return
      }

      form.value.displayName = user.displayName || ''
      form.value.email = user.email || ''
    })

    const handleSubmit = () => {
      if (!store.state.auth.user) {
        toast.error('Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.')
        router.push('/')
        return
      }
      showUpdateConfirm.value = true
    }

    const confirmUpdate = async () => {
      try {
        await store.dispatch('auth/updateProfile', {
          displayName: form.value.displayName,
          password: form.value.password || null
        })
        showUpdateConfirm.value = false
        toast.success('Profil başarıyla güncellendi')
      } catch (error) {
        toast.error(error.message)
      }
    }

    const confirmDelete = async () => {
      try {
        await store.dispatch('auth/deleteAccount')
        router.push('/')
      } catch (error) {
        console.error('Hesap silinemedi:', error)
      }
    }

    return {
      form,
      showUpdateConfirm,
      showDeleteConfirm,
      handleSubmit,
      confirmUpdate,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
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
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.delete-btn, .update-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

.update-btn {
  background-color: #00B2A9;
  color: white;
}

.update-btn:hover {
  background-color: #009b94;
}
</style> 