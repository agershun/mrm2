import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useImportsStore = defineStore('imports', () => {
  const appStore = useAppStore()

  // State
  const importTemplates = ref([])
  const scheduledImports = ref([])
  const importHistory = ref([])
  const selectedTemplate = ref(null)
  const selectedImport = ref(null)
  const isLoading = ref(false)
  const filters = ref({})

  // Getters
  const templatesWithHistory = computed(() => {
    return importTemplates.value.map(template => ({
      ...template,
      history: importHistory.value.filter(history => history.template_id === template.template_id),
      scheduled: scheduledImports.value.filter(scheduled => scheduled.template_id === template.template_id)
    }))
  })

  const selectedTemplateData = computed(() => {
    if (!selectedTemplate.value) return null
    const template = importTemplates.value.find(t => t.template_id === selectedTemplate.value)
    if (!template) return null

    return {
      ...template,
      history: importHistory.value.filter(history => history.template_id === template.template_id),
      scheduled: scheduledImports.value.filter(scheduled => scheduled.template_id === template.template_id)
    }
  })

  const selectedImportData = computed(() => {
    if (!selectedImport.value) return null
    return importHistory.value.find(h => h.import_id === selectedImport.value)
  })

  const filteredTemplates = computed(() => {
    let filtered = importTemplates.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(search) ||
        template.description?.toLowerCase().includes(search)
      )
    }

    if (filters.value.entity_type) {
      filtered = filtered.filter(template => template.entity_type === filters.value.entity_type)
    }

    if (filters.value.is_active !== undefined) {
      filtered = filtered.filter(template => template.is_active === filters.value.is_active)
    }

    return filtered
  })

  const filteredHistory = computed(() => {
    let filtered = importHistory.value

    if (filters.value.status) {
      filtered = filtered.filter(history => history.status === filters.value.status)
    }

    if (filters.value.template_id) {
      filtered = filtered.filter(history => history.template_id === filters.value.template_id)
    }

    if (filters.value.date_from) {
      filtered = filtered.filter(history =>
        new Date(history.created_at) >= new Date(filters.value.date_from)
      )
    }

    if (filters.value.date_to) {
      filtered = filtered.filter(history =>
        new Date(history.created_at) <= new Date(filters.value.date_to)
      )
    }

    return filtered
  })

  const templatesByType = computed(() => {
    const groups = {
      'activities': [],
      'budgets': [],
      'investments': [],
      'actuals': [],
      'performance': [],
      'other': []
    }
    importTemplates.value.forEach(template => {
      const type = template.entity_type || 'other'
      if (groups[type]) {
        groups[type].push(template)
      }
    })
    return groups
  })

  const importsByStatus = computed(() => {
    const groups = {
      'pending': [],
      'running': [],
      'completed': [],
      'failed': [],
      'cancelled': []
    }
    importHistory.value.forEach(history => {
      const status = history.status || 'pending'
      if (groups[status]) {
        groups[status].push(history)
      }
    })
    return groups
  })

  const scheduledImportsToday = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return scheduledImports.value.filter(scheduled =>
      scheduled.next_run_date && scheduled.next_run_date.startsWith(today)
    )
  })

  const recentImports = computed(() => {
    return importHistory.value
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
  })

  // Actions
  const fetchImportTemplates = async (filterParams = {}) => {
    try {
      isLoading.value = true
      const data = await api.imports.getImportTemplates(filterParams)
      importTemplates.value = data || []
    } catch (error) {
      console.error('Error fetching import templates:', error)
      appStore.showError('Ошибка загрузки шаблонов импорта: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchScheduledImports = async () => {
    try {
      const data = await api.imports.getScheduledImports()
      scheduledImports.value = data || []
    } catch (error) {
      console.error('Error fetching scheduled imports:', error)
      appStore.showError('Ошибка загрузки запланированных импортов: ' + error.message)
    }
  }

  const fetchImportHistory = async (filterParams = {}) => {
    try {
      const data = await api.imports.getImportHistory(filterParams)
      importHistory.value = data || []
    } catch (error) {
      console.error('Error fetching import history:', error)
      appStore.showError('Ошибка загрузки истории импорта: ' + error.message)
    }
  }

  const selectTemplate = (templateId) => {
    selectedTemplate.value = templateId
  }

  const selectImport = (importId) => {
    selectedImport.value = importId
  }

  const createTemplate = async (templateData) => {
    try {
      isLoading.value = true
      const newTemplate = await api.imports.createImportTemplate(templateData)
      importTemplates.value.push(newTemplate)
      appStore.showSuccess('Шаблон импорта создан успешно')
      return newTemplate
    } catch (error) {
      appStore.showError('Ошибка создания шаблона импорта: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateTemplate = async (templateId, updateData) => {
    try {
      isLoading.value = true
      const updatedTemplate = await api.imports.updateImportTemplate(templateId, updateData)

      const index = importTemplates.value.findIndex(t => t.template_id === templateId)
      if (index !== -1) {
        importTemplates.value[index] = { ...importTemplates.value[index], ...updatedTemplate }
      }

      appStore.showSuccess('Шаблон импорта обновлен')
      return updatedTemplate
    } catch (error) {
      appStore.showError('Ошибка обновления шаблона импорта: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteTemplate = async (templateId) => {
    try {
      isLoading.value = true
      await api.imports.deleteImportTemplate(templateId)

      importTemplates.value = importTemplates.value.filter(t => t.template_id !== templateId)
      // Удаляем связанные данные
      scheduledImports.value = scheduledImports.value.filter(s => s.template_id !== templateId)

      if (selectedTemplate.value === templateId) {
        selectedTemplate.value = null
      }

      appStore.showSuccess('Шаблон импорта удален')
    } catch (error) {
      appStore.showError('Ошибка удаления шаблона импорта: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const duplicateTemplate = async (templateId, newName) => {
    try {
      const duplicatedTemplate = await api.imports.duplicateImportTemplate(templateId, newName)
      importTemplates.value.push(duplicatedTemplate)
      appStore.showSuccess('Шаблон импорта скопирован')
      return duplicatedTemplate
    } catch (error) {
      appStore.showError('Ошибка копирования шаблона импорта: ' + error.message)
      throw error
    }
  }

  const runImport = async (templateId, fileData = null, options = {}) => {
    try {
      isLoading.value = true
      const importResult = await api.imports.runImport(templateId, fileData, options)

      // Добавляем в историю
      importHistory.value.unshift(importResult)

      appStore.showSuccess('Импорт запущен')
      return importResult
    } catch (error) {
      appStore.showError('Ошибка запуска импорта: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const scheduleImport = async (scheduleData) => {
    try {
      const newSchedule = await api.imports.createScheduledImport(scheduleData)
      scheduledImports.value.push(newSchedule)
      appStore.showSuccess('Импорт запланирован')
      return newSchedule
    } catch (error) {
      appStore.showError('Ошибка планирования импорта: ' + error.message)
      throw error
    }
  }

  const updateScheduledImport = async (scheduleId, updateData) => {
    try {
      const updatedSchedule = await api.imports.updateScheduledImport(scheduleId, updateData)

      const index = scheduledImports.value.findIndex(s => s.schedule_id === scheduleId)
      if (index !== -1) {
        scheduledImports.value[index] = { ...scheduledImports.value[index], ...updatedSchedule }
      }

      appStore.showSuccess('Запланированный импорт обновлен')
      return updatedSchedule
    } catch (error) {
      appStore.showError('Ошибка обновления запланированного импорта: ' + error.message)
      throw error
    }
  }

  const deleteScheduledImport = async (scheduleId) => {
    try {
      await api.imports.deleteScheduledImport(scheduleId)
      scheduledImports.value = scheduledImports.value.filter(s => s.schedule_id !== scheduleId)
      appStore.showSuccess('Запланированный импорт удален')
    } catch (error) {
      appStore.showError('Ошибка удаления запланированного импорта: ' + error.message)
      throw error
    }
  }

  const cancelImport = async (importId) => {
    try {
      await api.imports.cancelImport(importId)

      const index = importHistory.value.findIndex(h => h.import_id === importId)
      if (index !== -1) {
        importHistory.value[index].status = 'cancelled'
      }

      appStore.showSuccess('Импорт отменен')
    } catch (error) {
      appStore.showError('Ошибка отмены импорта: ' + error.message)
      throw error
    }
  }

  const retryImport = async (importId) => {
    try {
      const retryResult = await api.imports.retryImport(importId)
      importHistory.value.unshift(retryResult)
      appStore.showSuccess('Импорт запущен повторно')
      return retryResult
    } catch (error) {
      appStore.showError('Ошибка повторного запуска импорта: ' + error.message)
      throw error
    }
  }

  const getImportStatus = async (importId) => {
    try {
      const status = await api.imports.getImportStatus(importId)

      // Обновляем статус в локальном состоянии
      const index = importHistory.value.findIndex(h => h.import_id === importId)
      if (index !== -1 && status) {
        importHistory.value[index] = { ...importHistory.value[index], ...status }
      }

      return status
    } catch (error) {
      console.error('Error getting import status:', error)
      return null
    }
  }

  const downloadImportLog = async (importId) => {
    try {
      const log = await api.imports.getImportLog(importId)
      appStore.showSuccess('Лог импорта загружен')
      return log
    } catch (error) {
      appStore.showError('Ошибка загрузки лога импорта: ' + error.message)
      throw error
    }
  }

  const validateImportFile = async (templateId, fileData) => {
    try {
      const validation = await api.imports.validateImportFile(templateId, fileData)
      return validation
    } catch (error) {
      appStore.showError('Ошибка валидации файла импорта: ' + error.message)
      throw error
    }
  }

  const previewImport = async (templateId, fileData, options = {}) => {
    try {
      const preview = await api.imports.previewImport(templateId, fileData, options)
      return preview
    } catch (error) {
      appStore.showError('Ошибка предварительного просмотра импорта: ' + error.message)
      throw error
    }
  }

  const activateTemplate = async (templateId) => {
    return updateTemplate(templateId, { is_active: true })
  }

  const deactivateTemplate = async (templateId) => {
    return updateTemplate(templateId, { is_active: false })
  }

  const enableScheduledImport = async (scheduleId) => {
    return updateScheduledImport(scheduleId, { is_enabled: true })
  }

  const disableScheduledImport = async (scheduleId) => {
    return updateScheduledImport(scheduleId, { is_enabled: false })
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const searchTemplates = async (keyword) => {
    if (!keyword.trim()) {
      await fetchImportTemplates()
      return
    }

    try {
      isLoading.value = true
      const results = await api.imports.searchImportTemplates(keyword)
      importTemplates.value = results || []
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
        fetchImportTemplates(),
        fetchScheduledImports(),
        fetchImportHistory({ limit: 50 }) // Загружаем последние 50 записей
      ])
    } catch (error) {
      console.error('Imports store initialization failed:', error)
    }
  }

  return {
    // State
    importTemplates,
    scheduledImports,
    importHistory,
    selectedTemplate,
    selectedImport,
    isLoading,
    filters,

    // Getters
    templatesWithHistory,
    selectedTemplateData,
    selectedImportData,
    filteredTemplates,
    filteredHistory,
    templatesByType,
    importsByStatus,
    scheduledImportsToday,
    recentImports,

    // Actions
    fetchImportTemplates,
    fetchScheduledImports,
    fetchImportHistory,
    selectTemplate,
    selectImport,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    runImport,
    scheduleImport,
    updateScheduledImport,
    deleteScheduledImport,
    cancelImport,
    retryImport,
    getImportStatus,
    downloadImportLog,
    validateImportFile,
    previewImport,
    activateTemplate,
    deactivateTemplate,
    enableScheduledImport,
    disableScheduledImport,
    setFilters,
    clearFilters,
    searchTemplates,
    initialize
  }
})