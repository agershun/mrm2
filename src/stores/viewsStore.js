import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useViewsStore = defineStore('views', () => {
  const appStore = useAppStore()

  // State
  const views = ref([])
  const viewSettings = ref([])
  const selectedView = ref(null)
  const currentViewId = ref(null)
  const isLoading = ref(false)
  const filters = ref({})

  // Getters
  const viewsWithSettings = computed(() => {
    return views.value.map(view => ({
      ...view,
      settings: viewSettings.value.filter(setting => setting.view_id === view.view_id)
    }))
  })

  const selectedViewData = computed(() => {
    if (!selectedView.value) return null
    const view = views.value.find(v => v.view_id === selectedView.value)
    if (!view) return null

    return {
      ...view,
      settings: viewSettings.value.filter(setting => setting.view_id === view.view_id)
    }
  })

  const currentViewData = computed(() => {
    if (!currentViewId.value) return null
    const view = views.value.find(v => v.view_id === currentViewId.value)
    if (!view) return null

    return {
      ...view,
      settings: viewSettings.value.filter(setting => setting.view_id === view.view_id)
    }
  })

  const filteredViews = computed(() => {
    let filtered = views.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(view =>
        view.name.toLowerCase().includes(search) ||
        view.description?.toLowerCase().includes(search)
      )
    }

    if (filters.value.view_type) {
      filtered = filtered.filter(view => view.view_type === filters.value.view_type)
    }

    if (filters.value.entity_type) {
      filtered = filtered.filter(view => view.entity_type === filters.value.entity_type)
    }

    if (filters.value.is_default !== undefined) {
      filtered = filtered.filter(view => view.is_default === filters.value.is_default)
    }

    if (filters.value.created_by) {
      filtered = filtered.filter(view => view.created_by === filters.value.created_by)
    }

    return filtered
  })

  const viewsByType = computed(() => {
    const groups = {
      'table': [],
      'chart': [],
      'dashboard': [],
      'report': [],
      'custom': []
    }
    views.value.forEach(view => {
      const type = view.view_type || 'custom'
      if (groups[type]) {
        groups[type].push(view)
      }
    })
    return groups
  })

  const publicViews = computed(() =>
    views.value.filter(view => view.is_public)
  )

  const privateViews = computed(() =>
    views.value.filter(view => !view.is_public)
  )

  const defaultViews = computed(() =>
    views.value.filter(view => view.is_default)
  )

  // Actions
  const fetchViews = async (filterParams = {}) => {
    try {
      isLoading.value = true
      const data = await api.views.getViews(filterParams)
      views.value = data || []
    } catch (error) {
      console.error('Error fetching views:', error)
      appStore.showError('Ошибка загрузки представлений: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchViewSettings = async (viewId = null) => {
    try {
      const data = await api.views.getViewSettings(viewId)
      viewSettings.value = data || []
    } catch (error) {
      console.error('Error fetching view settings:', error)
      appStore.showError('Ошибка загрузки настроек представлений: ' + error.message)
    }
  }

  const selectView = (viewId) => {
    selectedView.value = viewId
  }

  const setCurrentView = (viewId) => {
    currentViewId.value = viewId
  }

  const createView = async (viewData) => {
    try {
      isLoading.value = true
      const newView = await api.views.createView(viewData)
      views.value.push(newView)
      appStore.showSuccess('Представление создано успешно')
      return newView
    } catch (error) {
      appStore.showError('Ошибка создания представления: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateView = async (viewId, updateData) => {
    try {
      isLoading.value = true
      const updatedView = await api.views.updateView(viewId, updateData)

      const index = views.value.findIndex(v => v.view_id === viewId)
      if (index !== -1) {
        views.value[index] = { ...views.value[index], ...updatedView }
      }

      appStore.showSuccess('Представление обновлено')
      return updatedView
    } catch (error) {
      appStore.showError('Ошибка обновления представления: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteView = async (viewId) => {
    try {
      isLoading.value = true
      await api.views.deleteView(viewId)

      views.value = views.value.filter(v => v.view_id !== viewId)
      // Удаляем связанные настройки
      viewSettings.value = viewSettings.value.filter(setting => setting.view_id !== viewId)

      if (selectedView.value === viewId) {
        selectedView.value = null
      }

      if (currentViewId.value === viewId) {
        currentViewId.value = null
      }

      appStore.showSuccess('Представление удалено')
    } catch (error) {
      appStore.showError('Ошибка удаления представления: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const duplicateView = async (viewId, newName) => {
    try {
      const duplicatedView = await api.views.duplicateView(viewId, newName)
      views.value.push(duplicatedView)
      appStore.showSuccess('Представление скопировано')
      return duplicatedView
    } catch (error) {
      appStore.showError('Ошибка копирования представления: ' + error.message)
      throw error
    }
  }

  const createViewSetting = async (settingData) => {
    try {
      const newSetting = await api.views.createViewSetting(settingData)
      viewSettings.value.push(newSetting)
      appStore.showSuccess('Настройка представления создана')
      return newSetting
    } catch (error) {
      appStore.showError('Ошибка создания настройки представления: ' + error.message)
      throw error
    }
  }

  const updateViewSetting = async (settingId, updateData) => {
    try {
      const updatedSetting = await api.views.updateViewSetting(settingId, updateData)

      const index = viewSettings.value.findIndex(setting => setting.setting_id === settingId)
      if (index !== -1) {
        viewSettings.value[index] = { ...viewSettings.value[index], ...updatedSetting }
      }

      appStore.showSuccess('Настройка представления обновлена')
      return updatedSetting
    } catch (error) {
      appStore.showError('Ошибка обновления настройки представления: ' + error.message)
      throw error
    }
  }

  const deleteViewSetting = async (settingId) => {
    try {
      await api.views.deleteViewSetting(settingId)
      viewSettings.value = viewSettings.value.filter(setting => setting.setting_id !== settingId)
      appStore.showSuccess('Настройка представления удалена')
    } catch (error) {
      appStore.showError('Ошибка удаления настройки представления: ' + error.message)
      throw error
    }
  }

  const saveViewLayout = async (viewId, layoutData) => {
    try {
      const result = await api.views.saveViewLayout(viewId, layoutData)
      appStore.showSuccess('Макет представления сохранен')
      return result
    } catch (error) {
      appStore.showError('Ошибка сохранения макета представления: ' + error.message)
      throw error
    }
  }

  const loadViewLayout = async (viewId) => {
    try {
      const layout = await api.views.getViewLayout(viewId)
      return layout
    } catch (error) {
      console.error('Error loading view layout:', error)
      appStore.showError('Ошибка загрузки макета представления: ' + error.message)
      return null
    }
  }

  const shareView = async (viewId, shareData) => {
    try {
      const result = await api.views.shareView(viewId, shareData)
      appStore.showSuccess('Представление предоставлено для совместного использования')
      return result
    } catch (error) {
      appStore.showError('Ошибка предоставления представления: ' + error.message)
      throw error
    }
  }

  const unshareView = async (viewId, userId) => {
    try {
      await api.views.unshareView(viewId, userId)
      appStore.showSuccess('Доступ к представлению отозван')
    } catch (error) {
      appStore.showError('Ошибка отзыва доступа к представлению: ' + error.message)
      throw error
    }
  }

  const setAsDefault = async (viewId, entityType) => {
    try {
      // Сначала снимаем флаг по умолчанию с других представлений этого типа
      views.value.forEach(view => {
        if (view.entity_type === entityType && view.is_default) {
          view.is_default = false
        }
      })

      const result = await api.views.setAsDefault(viewId, entityType)

      // Устанавливаем флаг для текущего представления
      const index = views.value.findIndex(v => v.view_id === viewId)
      if (index !== -1) {
        views.value[index].is_default = true
      }

      appStore.showSuccess('Представление установлено по умолчанию')
      return result
    } catch (error) {
      appStore.showError('Ошибка установки представления по умолчанию: ' + error.message)
      throw error
    }
  }

  const exportView = async (viewId, format = 'json') => {
    try {
      const result = await api.views.exportView(viewId, format)
      appStore.showSuccess('Представление экспортировано')
      return result
    } catch (error) {
      appStore.showError('Ошибка экспорта представления: ' + error.message)
      throw error
    }
  }

  const importView = async (viewData) => {
    try {
      const importedView = await api.views.importView(viewData)
      views.value.push(importedView)
      appStore.showSuccess('Представление импортировано')
      return importedView
    } catch (error) {
      appStore.showError('Ошибка импорта представления: ' + error.message)
      throw error
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const searchViews = async (keyword) => {
    if (!keyword.trim()) {
      await fetchViews()
      return
    }

    try {
      isLoading.value = true
      const results = await api.views.searchViews(keyword)
      views.value = results || []
    } catch (error) {
      appStore.showError('Ошибка поиска: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  // Инициализация
  const initialize = async () => {
    try {
      await Promise.all([
        fetchViews(),
        fetchViewSettings()
      ])
    } catch (error) {
      console.error('Views store initialization failed:', error)
    }
  }

  return {
    // State
    views,
    viewSettings,
    selectedView,
    currentViewId,
    isLoading,
    filters,

    // Getters
    viewsWithSettings,
    selectedViewData,
    currentViewData,
    filteredViews,
    viewsByType,
    publicViews,
    privateViews,
    defaultViews,

    // Actions
    fetchViews,
    fetchViewSettings,
    selectView,
    setCurrentView,
    createView,
    updateView,
    deleteView,
    duplicateView,
    createViewSetting,
    updateViewSetting,
    deleteViewSetting,
    saveViewLayout,
    loadViewLayout,
    shareView,
    unshareView,
    setAsDefault,
    exportView,
    importView,
    setFilters,
    clearFilters,
    searchViews,
    initialize
  }
})