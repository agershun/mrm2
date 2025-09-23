import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

/**
 * Composable для управления состояниями загрузки
 * Обеспечивает единый интерфейс для всех типов загрузки в приложении
 */
export function useLoading(initialState = false) {
  const appStore = useAppStore()

  // Локальное состояние загрузки
  const isLoading = ref(initialState)
  const loadingMessage = ref('')
  const loadingError = ref(null)

  // Состояние для конкретных операций
  const operationStates = ref(new Map())

  /**
   * Установка состояния загрузки
   */
  const setLoading = (loading, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
    if (!loading) {
      loadingError.value = null
    }
  }

  /**
   * Установка глобального состояния загрузки через AppStore
   */
  const setGlobalLoading = (loading) => {
    appStore.setLoading(loading)
  }

  /**
   * Выполнение асинхронной операции с автоматическим управлением загрузкой
   */
  const withLoading = async (operation, options = {}) => {
    const {
      message = 'Загрузка...',
      global = false,
      errorHandler = null,
      successMessage = null
    } = options

    try {
      if (global) {
        setGlobalLoading(true)
      } else {
        setLoading(true, message)
      }

      const result = await operation()

      if (successMessage) {
        appStore.showSuccess(successMessage)
      }

      return result
    } catch (error) {
      loadingError.value = error

      if (errorHandler) {
        errorHandler(error)
      } else {
        // Используем централизованную обработку ошибок
        const { handleError } = await import('@/utils/errorHandler')
        handleError(error, {
          context: message,
          showToUser: true
        })
      }

      throw error
    } finally {
      if (global) {
        setGlobalLoading(false)
      } else {
        setLoading(false)
      }
    }
  }

  /**
   * Управление состоянием конкретной операции
   */
  const setOperationLoading = (operationKey, loading, message = '') => {
    if (loading) {
      operationStates.value.set(operationKey, { loading: true, message })
    } else {
      operationStates.value.delete(operationKey)
    }
  }

  /**
   * Проверка, выполняется ли конкретная операция
   */
  const isOperationLoading = (operationKey) => {
    return operationStates.value.has(operationKey)
  }

  /**
   * Получение сообщения для конкретной операции
   */
  const getOperationMessage = (operationKey) => {
    const state = operationStates.value.get(operationKey)
    return state?.message || ''
  }

  /**
   * Выполнение операции с конкретным ключом
   */
  const withOperationLoading = async (operationKey, operation, options = {}) => {
    const {
      message = 'Загрузка...',
      errorHandler = null,
      successMessage = null
    } = options

    try {
      setOperationLoading(operationKey, true, message)

      const result = await operation()

      if (successMessage) {
        appStore.showSuccess(successMessage)
      }

      return result
    } catch (error) {
      if (errorHandler) {
        errorHandler(error)
      } else {
        const { handleError } = await import('@/utils/errorHandler')
        handleError(error, {
          context: `${operationKey}: ${message}`,
          showToUser: true
        })
      }

      throw error
    } finally {
      setOperationLoading(operationKey, false)
    }
  }

  // Computed значения
  const hasAnyLoading = computed(() => {
    return isLoading.value || operationStates.value.size > 0
  })

  const loadingOperations = computed(() => {
    return Array.from(operationStates.value.keys())
  })

  const operationMessages = computed(() => {
    const messages = []
    for (const [key, state] of operationStates.value.entries()) {
      if (state.message) {
        messages.push(`${key}: ${state.message}`)
      }
    }
    return messages
  })

  return {
    // Состояние
    isLoading: computed(() => isLoading.value),
    loadingMessage: computed(() => loadingMessage.value),
    loadingError: computed(() => loadingError.value),
    hasAnyLoading,
    loadingOperations,
    operationMessages,

    // Методы
    setLoading,
    setGlobalLoading,
    withLoading,
    setOperationLoading,
    isOperationLoading,
    getOperationMessage,
    withOperationLoading
  }
}

/**
 * Хук для создания debounced loading состояния
 * Полезно для предотвращения мерцания при быстрых операциях
 */
export function useDebouncedLoading(delay = 300) {
  const { isLoading, setLoading, ...rest } = useLoading()
  const debouncedLoading = ref(false)
  let timeoutId = null

  const setDebouncedLoading = (loading, message = '') => {
    if (loading) {
      // Сразу показываем загрузку, если задержка небольшая
      if (delay <= 100) {
        debouncedLoading.value = true
      } else {
        // Устанавливаем задержку для показа загрузки
        timeoutId = setTimeout(() => {
          debouncedLoading.value = true
        }, delay)
      }
      setLoading(true, message)
    } else {
      // Сразу скрываем загрузку
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      debouncedLoading.value = false
      setLoading(false)
    }
  }

  return {
    isLoading: computed(() => debouncedLoading.value),
    setLoading: setDebouncedLoading,
    ...rest
  }
}