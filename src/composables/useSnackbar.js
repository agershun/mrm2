import { useAppStore } from '@/stores/appStore'

export function useSnackbar() {
  const appStore = useAppStore()

  const showSnackbar = (message, type = 'info') => {
    return appStore.addNotification({
      message,
      type,
      timeout: 5000
    })
  }

  const showSuccess = (message) => {
    return appStore.showSuccess(message)
  }

  const showError = (message) => {
    return appStore.showError(message)
  }

  const showWarning = (message) => {
    return appStore.showWarning(message)
  }

  const showInfo = (message) => {
    return appStore.showInfo(message)
  }

  return {
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}