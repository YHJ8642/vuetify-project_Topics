// Utilities
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const account = ref('')
    const cartTotal = ref(0)
    const favoriteTotal = ref(0)
    const role = ref('user')
    const token = ref('')
    const lastLogin = ref('') // ⭐ 帳號登入時間（當下）

    const isLoggedIn = computed(() => token.value.length > 0)
    const isAdmin = computed(() => role.value === 'admin')

    const login = (data) => {
      account.value = data.account
      cartTotal.value = data.cartTotal
      role.value = data.role
      favoriteTotal.value = data.favoriteTotal || 0

      if (data.token) {
        token.value = data.token
      }

      // ⭐ 這裡記錄登入當下的時間
      lastLogin.value = new Date().toISOString()
    }

    const logout = () => {
      account.value = ''
      cartTotal.value = 0
      favoriteTotal.value = 0
      role.value = 'user'
      token.value = ''
      lastLogin.value = ''
    }

    const setFavorites = (count) => {
      favoriteTotal.value = count
    }

    return {
      account,
      cartTotal,
      favoriteTotal,
      role,
      token,
      lastLogin, // ⭐ 回傳出去
      isLoggedIn,
      isAdmin,
      login,
      logout,
      setFavorites,
    }
  },
  {
    persist: {
      key: 'shop-user',
      pick: ['token', 'account', 'role', 'favoriteTotal', 'lastLogin'], // ⭐ 記得持久化
    },
  }
)
