import { expenseAPI } from '@/services/api'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, updatePassword } from 'firebase/auth'
import { ref, get, set, serverTimestamp, update } from 'firebase/database'
import { db } from '@/services/firebase'

export default {
  namespaced: true,
  
  state: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user ? { ...user } : null
      state.isAuthenticated = !!user
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_USER(state) {
      state.user = null
      state.isAuthenticated = false
    }
  },

  actions: {
    async register({ commit }, { email, password, displayName }) {
      try {
        const auth = getAuth()
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Kullanıcı profilini güncelle
        await updateProfile(userCredential.user, { displayName })
        
        // Veritabanına kullanıcı kaydı ekle
        const userRef = ref(db, `users/${userCredential.user.uid}`)
        await set(userRef, {
          email,
          displayName,
          createdAt: serverTimestamp(),
          // Başlangıç değerlerini ekle
          income: {
            [new Date().getFullYear()]: {
              [new Date().getMonth() + 1]: {
                salary: 0,
                rent: 0,
                other: 0
              }
            }
          },
          bills: {
            [new Date().getFullYear()]: {
              [new Date().getMonth() + 1]: {
                phone: 0,
                internet: 0,
                electricity: 0,
                water: 0,
                gas: 0
              }
            }
          },
          debts: {
            [new Date().getFullYear()]: {
              [new Date().getMonth() + 1]: {
                creditCard: 0,
                loan: 0,
                other: 0
              }
            }
          },
          savings: {
            [new Date().getFullYear()]: {
              [new Date().getMonth() + 1]: 0
            }
          }
        })

        // Otomatik login yapılmasın diye çıkış yap
        await auth.signOut()
        
        return userCredential.user
      } catch (error) {
        let errorMessage = 'Kayıt yapılırken bir hata oluştu.'
        
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Bu e-posta adresi zaten kullanımda.'
            break
          case 'auth/invalid-email':
            errorMessage = 'Geçersiz e-posta adresi.'
            break
          case 'auth/operation-not-allowed':
            errorMessage = 'E-posta/şifre girişi devre dışı bırakılmış.'
            break
          case 'auth/weak-password':
            errorMessage = 'Şifre çok zayıf. En az 6 karakter kullanın.'
            break
        }

        console.error('Kayıt yapılamadı:', error)
        throw new Error(errorMessage)
      }
    },

    async login({ commit }, { email, password }) {
      try {
        const auth = getAuth()
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // Kullanıcının veritabanında kaydı var mı kontrol et
        const userRef = ref(db, `users/${userCredential.user.uid}`)
        const snapshot = await get(userRef)
        
        if (!snapshot.exists()) {
          // Veritabanında kayıt yoksa oluştur
          await set(userRef, {
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            createdAt: serverTimestamp(),
            // Başlangıç verilerini ekle
            income: {
              [new Date().getFullYear()]: {
                [new Date().getMonth() + 1]: {
                  salary: 0,
                  rent: 0,
                  other: 0
                }
              }
            },
            bills: {
              [new Date().getFullYear()]: {
                [new Date().getMonth() + 1]: {
                  phone: 0,
                  internet: 0,
                  electricity: 0,
                  water: 0,
                  gas: 0
                }
              }
            },
            debts: {
              [new Date().getFullYear()]: {
                [new Date().getMonth() + 1]: {
                  creditCard: 0,
                  loan: 0,
                  other: 0
                }
              }
            },
            savings: {
              [new Date().getFullYear()]: {
                [new Date().getMonth() + 1]: 0
              }
            }
          })
        }

        // Kullanıcı bilgilerini store'a kaydet
        const userData = (await get(userRef)).val()
        commit('SET_USER', {
          ...userCredential.user,
          ...userData
        })

        return userCredential.user
      } catch (error) {
        // Firebase auth hatalarını Türkçeleştir
        let errorMessage
        
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            errorMessage = 'E-posta adresi veya şifre hatalı.'
            break
          case 'auth/invalid-email':
            errorMessage = 'Geçersiz e-posta adresi.'
            break
          case 'auth/user-disabled':
            errorMessage = 'Bu hesap devre dışı bırakılmış.'
            break
          case 'auth/too-many-requests':
            errorMessage = 'Çok fazla başarısız giriş denemesi yaptınız. Lütfen daha sonra tekrar deneyin.'
            break
          default:
            errorMessage = 'Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyin.'
        }

        // Sadece development ortamında konsola hata bas
        if (process.env.NODE_ENV === 'development') {
          console.error('Giriş yapılamadı:', error)
        }
        
        throw new Error(errorMessage)
      }
    },

    async logout({ commit }) {
      try {
        await expenseAPI.logout()
        commit('CLEAR_USER')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async handleAuthStateChange({ commit, dispatch }, user) {
      try {
        if (user) {
          // Kullanıcı bilgilerini veritabanından al
          const userRef = ref(db, `users/${user.uid}`)
          const snapshot = await get(userRef)
          
          if (snapshot.exists()) {
            const userData = snapshot.val()
            
            // User state'i güncelle
            commit('SET_USER', {
              ...user,
              ...userData
            })

            // Store'ları başlat
            const year = new Date().getFullYear()
            const month = new Date().getMonth() + 1

            // Income verilerini al ve store'a kaydet
            const incomeRef = ref(db, `users/${user.uid}/income/${year}/${month}`)
            const incomeSnapshot = await get(incomeRef)
            if (incomeSnapshot.exists()) {
              commit('income/SET_INCOME', incomeSnapshot.val(), { root: true })
            } else {
              commit('income/CLEAR_INCOME', null, { root: true })
            }
          }
        } else {
          commit('CLEAR_USER')
          commit('income/CLEAR_INCOME', null, { root: true })
        }
      } catch (error) {
        console.error('Auth state handling error:', error)
        commit('CLEAR_USER')
        commit('income/CLEAR_INCOME', null, { root: true })
      }
    },

    async deleteAccount({ commit }) {
      try {
        await expenseAPI.deleteAccount()
        commit('CLEAR_USER')
        return true
      } catch (error) {
        console.error('Hesap silinemedi:', error)
        throw error
      }
    },

    async updateProfile({ commit }, { displayName, password }) {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        
        if (!user) throw new Error('Kullanıcı bulunamadı')

        // Profil güncellemesi
        await updateProfile(user, { displayName })

        // Şifre güncellemesi (eğer yeni şifre girilmişse)
        if (password) {
          await updatePassword(user, password)
        }

        // Veritabanında da güncelle
        const userRef = ref(db, `users/${user.uid}`)
        await update(userRef, {
          displayName,
          updatedAt: serverTimestamp()
        })

        // Store'u güncelle
        commit('SET_USER', { ...user, displayName })
        
        return true
      } catch (error) {
        console.error('Profil güncellenemedi:', error)
        throw new Error('Profil güncellenirken bir hata oluştu')
      }
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    userName: state => state.user?.displayName || 'Kullanıcı'
  }
} 