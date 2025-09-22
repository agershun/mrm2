import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useConfigStore = defineStore('config', () => {
  const appStore = useAppStore()

  // State
  const nColumns = ref([])
  const forecastStatusTags = ref([])
  const scenarioTags = ref([])
  const isLoading = ref(false)
  const filters = ref({})

  // Getters
  const nColumnsByTable = computed(() => {
    const groups = {}
    nColumns.value.forEach(column => {
      const tableName = column.table_name || 'unknown'
      if (!groups[tableName]) {
        groups[tableName] = []
      }
      groups[tableName].push(column)
    })
    return groups
  })

  const activeNColumns = computed(() =>
    nColumns.value.filter(column => column.is_active)
  )

  const activeForecastStatusTags = computed(() =>
    forecastStatusTags.value.filter(tag => tag.is_active)
  )

  const activeScenarioTags = computed(() =>
    scenarioTags.value.filter(tag => tag.is_active)
  )

  const nColumnsByType = computed(() => {
    const groups = {
      'text': [],
      'number': [],
      'date': [],
      'boolean': [],
      'select': [],
      'multiselect': []
    }
    nColumns.value.forEach(column => {
      const type = column.data_type || 'text'
      if (groups[type]) {
        groups[type].push(column)
      }
    })
    return groups
  })

  const forecastTagsByStatus = computed(() => {
    const groups = {}
    forecastStatusTags.value.forEach(tag => {
      const status = tag.status || 'active'
      if (!groups[status]) {
        groups[status] = []
      }
      groups[status].push(tag)
    })
    return groups
  })

  const scenarioTagsByCategory = computed(() => {
    const groups = {}
    scenarioTags.value.forEach(tag => {
      const category = tag.category || 'general'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(tag)
    })
    return groups
  })

  // Actions
  const fetchNColumns = async (tableName = null) => {
    try {
      isLoading.value = true
      const data = await api.config.getNColumns(tableName)
      nColumns.value = data || []
    } catch (error) {
      console.error('Error fetching NColumns:', error)
      appStore.showError('Ошибка загрузки настраиваемых колонок: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchForecastStatusTags = async () => {
    try {
      const data = await api.config.getForecastStatusTags()
      forecastStatusTags.value = data || []
    } catch (error) {
      console.error('Error fetching forecast status tags:', error)
      appStore.showError('Ошибка загрузки тегов статуса прогноза: ' + error.message)
    }
  }

  const fetchScenarioTags = async () => {
    try {
      const data = await api.config.getScenarioTags()
      scenarioTags.value = data || []
    } catch (error) {
      console.error('Error fetching scenario tags:', error)
      appStore.showError('Ошибка загрузки тегов сценариев: ' + error.message)
    }
  }

  const createNColumn = async (columnData) => {
    try {
      isLoading.value = true
      const newColumn = await api.config.createNColumn(columnData)
      nColumns.value.push(newColumn)
      appStore.showSuccess('Настраиваемая колонка создана успешно')
      return newColumn
    } catch (error) {
      appStore.showError('Ошибка создания настраиваемой колонки: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateNColumn = async (columnId, updateData) => {
    try {
      isLoading.value = true
      const updatedColumn = await api.config.updateNColumn(columnId, updateData)

      const index = nColumns.value.findIndex(c => c.ncolumn_id === columnId)
      if (index !== -1) {
        nColumns.value[index] = { ...nColumns.value[index], ...updatedColumn }
      }

      appStore.showSuccess('Настраиваемая колонка обновлена')
      return updatedColumn
    } catch (error) {
      appStore.showError('Ошибка обновления настраиваемой колонки: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteNColumn = async (columnId) => {
    try {
      isLoading.value = true
      await api.config.deleteNColumn(columnId)

      nColumns.value = nColumns.value.filter(c => c.ncolumn_id !== columnId)
      appStore.showSuccess('Настраиваемая колонка удалена')
    } catch (error) {
      appStore.showError('Ошибка удаления настраиваемой колонки: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const reorderNColumns = async (tableName, columnIds) => {
    try {
      await api.config.reorderNColumns(tableName, columnIds)

      // Обновляем порядок в локальном состоянии
      columnIds.forEach((columnId, index) => {
        const columnIndex = nColumns.value.findIndex(c => c.ncolumn_id === columnId)
        if (columnIndex !== -1) {
          nColumns.value[columnIndex].display_order = index + 1
        }
      })

      appStore.showSuccess('Порядок колонок обновлен')
    } catch (error) {
      appStore.showError('Ошибка изменения порядка колонок: ' + error.message)
      throw error
    }
  }

  const createForecastStatusTag = async (tagData) => {
    try {
      const newTag = await api.config.createForecastStatusTag(tagData)
      forecastStatusTags.value.push(newTag)
      appStore.showSuccess('Тег статуса прогноза создан успешно')
      return newTag
    } catch (error) {
      appStore.showError('Ошибка создания тега статуса прогноза: ' + error.message)
      throw error
    }
  }

  const updateForecastStatusTag = async (tagId, updateData) => {
    try {
      const updatedTag = await api.config.updateForecastStatusTag(tagId, updateData)

      const index = forecastStatusTags.value.findIndex(t => t.tag_id === tagId)
      if (index !== -1) {
        forecastStatusTags.value[index] = { ...forecastStatusTags.value[index], ...updatedTag }
      }

      appStore.showSuccess('Тег статуса прогноза обновлен')
      return updatedTag
    } catch (error) {
      appStore.showError('Ошибка обновления тега статуса прогноза: ' + error.message)
      throw error
    }
  }

  const deleteForecastStatusTag = async (tagId) => {
    try {
      await api.config.deleteForecastStatusTag(tagId)
      forecastStatusTags.value = forecastStatusTags.value.filter(t => t.tag_id !== tagId)
      appStore.showSuccess('Тег статуса прогноза удален')
    } catch (error) {
      appStore.showError('Ошибка удаления тега статуса прогноза: ' + error.message)
      throw error
    }
  }

  const createScenarioTag = async (tagData) => {
    try {
      const newTag = await api.config.createScenarioTag(tagData)
      scenarioTags.value.push(newTag)
      appStore.showSuccess('Тег сценария создан успешно')
      return newTag
    } catch (error) {
      appStore.showError('Ошибка создания тега сценария: ' + error.message)
      throw error
    }
  }

  const updateScenarioTag = async (tagId, updateData) => {
    try {
      const updatedTag = await api.config.updateScenarioTag(tagId, updateData)

      const index = scenarioTags.value.findIndex(t => t.tag_id === tagId)
      if (index !== -1) {
        scenarioTags.value[index] = { ...scenarioTags.value[index], ...updatedTag }
      }

      appStore.showSuccess('Тег сценария обновлен')
      return updatedTag
    } catch (error) {
      appStore.showError('Ошибка обновления тега сценария: ' + error.message)
      throw error
    }
  }

  const deleteScenarioTag = async (tagId) => {
    try {
      await api.config.deleteScenarioTag(tagId)
      scenarioTags.value = scenarioTags.value.filter(t => t.tag_id !== tagId)
      appStore.showSuccess('Тег сценария удален')
    } catch (error) {
      appStore.showError('Ошибка удаления тега сценария: ' + error.message)
      throw error
    }
  }

  const activateNColumn = async (columnId) => {
    return updateNColumn(columnId, { is_active: true })
  }

  const deactivateNColumn = async (columnId) => {
    return updateNColumn(columnId, { is_active: false })
  }

  const activateForecastStatusTag = async (tagId) => {
    return updateForecastStatusTag(tagId, { is_active: true })
  }

  const deactivateForecastStatusTag = async (tagId) => {
    return updateForecastStatusTag(tagId, { is_active: false })
  }

  const activateScenarioTag = async (tagId) => {
    return updateScenarioTag(tagId, { is_active: true })
  }

  const deactivateScenarioTag = async (tagId) => {
    return updateScenarioTag(tagId, { is_active: false })
  }

  const exportConfig = async (configType = 'all') => {
    try {
      const result = await api.config.exportConfig(configType)
      appStore.showSuccess('Конфигурация экспортирована')
      return result
    } catch (error) {
      appStore.showError('Ошибка экспорта конфигурации: ' + error.message)
      throw error
    }
  }

  const importConfig = async (configData) => {
    try {
      isLoading.value = true
      const result = await api.config.importConfig(configData)

      // Обновляем данные после импорта
      await Promise.all([
        fetchNColumns(),
        fetchForecastStatusTags(),
        fetchScenarioTags()
      ])

      appStore.showSuccess('Конфигурация импортирована')
      return result
    } catch (error) {
      appStore.showError('Ошибка импорта конфигурации: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const resetConfig = async (configType = 'all') => {
    try {
      isLoading.value = true
      await api.config.resetConfig(configType)

      // Обновляем данные после сброса
      await Promise.all([
        fetchNColumns(),
        fetchForecastStatusTags(),
        fetchScenarioTags()
      ])

      appStore.showSuccess('Конфигурация сброшена к значениям по умолчанию')
    } catch (error) {
      appStore.showError('Ошибка сброса конфигурации: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  // Инициализация
  const initialize = async () => {
    try {
      await Promise.all([
        fetchNColumns(),
        fetchForecastStatusTags(),
        fetchScenarioTags()
      ])
    } catch (error) {
      console.error('Config store initialization failed:', error)
    }
  }

  return {
    // State
    nColumns,
    forecastStatusTags,
    scenarioTags,
    isLoading,
    filters,

    // Getters
    nColumnsByTable,
    activeNColumns,
    activeForecastStatusTags,
    activeScenarioTags,
    nColumnsByType,
    forecastTagsByStatus,
    scenarioTagsByCategory,

    // Actions
    fetchNColumns,
    fetchForecastStatusTags,
    fetchScenarioTags,
    createNColumn,
    updateNColumn,
    deleteNColumn,
    reorderNColumns,
    createForecastStatusTag,
    updateForecastStatusTag,
    deleteForecastStatusTag,
    createScenarioTag,
    updateScenarioTag,
    deleteScenarioTag,
    activateNColumn,
    deactivateNColumn,
    activateForecastStatusTag,
    deactivateForecastStatusTag,
    activateScenarioTag,
    deactivateScenarioTag,
    exportConfig,
    importConfig,
    resetConfig,
    setFilters,
    clearFilters,
    initialize
  }
})