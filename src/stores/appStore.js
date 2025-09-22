import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const notifications = ref([])
  const sidebarCollapsed = ref(false)
  const currentUser = ref(null)
  const isInitialized = ref(false)

  // Getters
  const loadingState = computed(() => isLoading.value)
  const hasNotifications = computed(() => notifications.value.length > 0)
  const userDisplayName = computed(() => {
    if (!currentUser.value) return 'Пользователь'
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`
  })

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const addNotification = (notification) => {
    const id = Date.now().toString()
    notifications.value.push({
      id,
      type: 'info',
      timeout: 5000,
      ...notification
    })
    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const showSuccess = (message) => {
    return addNotification({
      type: 'success',
      message,
      icon: 'mdi-check-circle'
    })
  }

  const showError = (message) => {
    return addNotification({
      type: 'error',
      message,
      icon: 'mdi-alert-circle',
      timeout: 10000
    })
  }

  const showWarning = (message) => {
    return addNotification({
      type: 'warning',
      message,
      icon: 'mdi-alert'
    })
  }

  const showInfo = (message) => {
    return addNotification({
      type: 'info',
      message,
      icon: 'mdi-information'
    })
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
  }

  const setCurrentUser = (user) => {
    currentUser.value = user
  }

  const initialize = async () => {
    if (isInitialized.value) return

    try {
      setLoading(true)

      // Имитируем загрузку пользователя (в реальном приложении это будет API вызов)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Устанавливаем демо пользователя
      setCurrentUser({
        id: '1',
        firstName: 'Александр',
        lastName: 'Петров',
        email: 'alexander.petrov@kreola.com',
        role: 'Administrator'
      })

      isInitialized.value = true
      showSuccess('Система инициализирована успешно')
    } catch (error) {
      showError('Ошибка инициализации системы')
      console.error('App initialization error:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    currentUser.value = null
    isInitialized.value = false
    notifications.value = []
    // В реальном приложении здесь будет очистка токенов и редирект
  }

  return {
    // State
    isLoading,
    notifications,
    sidebarCollapsed,
    currentUser,
    isInitialized,

    // Getters
    loadingState,
    hasNotifications,
    userDisplayName,

    // Actions
    setLoading,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    toggleSidebar,
    setSidebarCollapsed,
    setCurrentUser,
    initialize,
    logout
  }
})