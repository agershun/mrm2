import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as organizationsAPI from '@/api/modules/organizations'

export const useOrganizationsStore = defineStore('organizations', () => {
  // State
  const organizations = ref([])
  const currentOrganization = ref(null)
  const currentOrganizationStats = ref(null)
  const currentOrganizationDocuments = ref([])
  const isLoading = ref(false)
  const isLoadingStats = ref(false)
  const lastError = ref(null)

  // Getters
  const allOrganizations = computed(() => organizations.value)

  const activeOrganizations = computed(() =>
    organizations.value.filter(org => org.isActive)
  )

  const getCurrentOrganization = computed(() => currentOrganization.value)

  const getCurrentOrganizationId = computed(() =>
    currentOrganization.value?.organization_id || null
  )

  const getCurrentOrganizationName = computed(() =>
    currentOrganization.value?.name || 'Не выбрана'
  )

  const hasCurrentOrganization = computed(() =>
    !!currentOrganization.value
  )

  const getOrganizationById = computed(() => {
    return (id) => organizations.value.find(org => org.organization_id === id)
  })

  const isCurrentOrganization = computed(() => {
    return (id) => currentOrganization.value?.organization_id === id
  })

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (error) => {
    lastError.value = error
  }

  const clearError = () => {
    lastError.value = null
  }

  /**
   * Загрузить список всех организаций
   */
  const loadOrganizations = async () => {
    try {
      setLoading(true)
      clearError()

      const data = await organizationsAPI.getOrganizations()
      organizations.value = data

      // Если нет текущей организации, но есть организации, выбираем первую активную
      if (!currentOrganization.value && data.length > 0) {
        const firstActive = data.find(org => org.isActive)
        if (firstActive) {
          await setCurrentOrganization(firstActive.organization_id, false)
        }
      }

      return data
    } catch (error) {
      console.error('Error loading organizations:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Загрузить данные конкретной организации
   */
  const loadOrganization = async (organizationId) => {
    try {
      setLoading(true)
      clearError()

      const organization = await organizationsAPI.getOrganization(organizationId)

      // Обновляем в списке, если организация уже есть
      const index = organizations.value.findIndex(org => org.organization_id === organizationId)
      if (index > -1) {
        organizations.value[index] = organization
      } else {
        organizations.value.push(organization)
      }

      return organization
    } catch (error) {
      console.error('Error loading organization:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Установить текущую организацию
   */
  const setCurrentOrganization = async (organizationId, loadStats = true) => {
    try {
      clearError()

      if (!organizationId) {
        currentOrganization.value = null
        currentOrganizationStats.value = null
        currentOrganizationDocuments.value = []
        // Сохраняем в localStorage
        localStorage.removeItem('currentOrganizationId')
        return
      }

      // Ищем организацию в кэше
      let organization = organizations.value.find(org => org.organization_id === organizationId)

      // Если не найдена, загружаем
      if (!organization) {
        organization = await loadOrganization(organizationId)
      }

      currentOrganization.value = organization

      // Сохраняем в localStorage
      localStorage.setItem('currentOrganizationId', organizationId)

      // Загружаем статистику, если требуется
      if (loadStats) {
        await loadCurrentOrganizationStats()
      }

      return organization
    } catch (error) {
      console.error('Error setting current organization:', error)
      setError(error.message)
      throw error
    }
  }

  /**
   * Загрузить статистику текущей организации
   */
  const loadCurrentOrganizationStats = async () => {
    if (!currentOrganization.value) return null

    try {
      isLoadingStats.value = true
      clearError()

      const stats = await organizationsAPI.getOrganizationStats(currentOrganization.value.organization_id)
      currentOrganizationStats.value = stats

      return stats
    } catch (error) {
      console.error('Error loading organization stats:', error)
      setError(error.message)
      throw error
    } finally {
      isLoadingStats.value = false
    }
  }

  /**
   * Загрузить документы текущей организации
   */
  const loadCurrentOrganizationDocuments = async () => {
    if (!currentOrganization.value) return []

    try {
      clearError()

      const documents = await organizationsAPI.getOrganizationDocuments(currentOrganization.value.organization_id)
      currentOrganizationDocuments.value = documents

      return documents
    } catch (error) {
      console.error('Error loading organization documents:', error)
      setError(error.message)
      throw error
    }
  }

  /**
   * Создать новую организацию
   */
  const createOrganization = async (organizationData) => {
    try {
      setLoading(true)
      clearError()

      const newOrganization = await organizationsAPI.createOrganization(organizationData)
      organizations.value.push(newOrganization)

      return newOrganization
    } catch (error) {
      console.error('Error creating organization:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Обновить организацию
   */
  const updateOrganization = async (organizationId, updateData) => {
    try {
      setLoading(true)
      clearError()

      const updatedOrganization = await organizationsAPI.updateOrganization(organizationId, updateData)

      // Обновляем в списке
      const index = organizations.value.findIndex(org => org.organization_id === organizationId)
      if (index > -1) {
        organizations.value[index] = updatedOrganization
      }

      // Обновляем текущую организацию, если это она
      if (currentOrganization.value?.organization_id === organizationId) {
        currentOrganization.value = updatedOrganization
      }

      return updatedOrganization
    } catch (error) {
      console.error('Error updating organization:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Удалить организацию
   */
  const deleteOrganization = async (organizationId) => {
    try {
      setLoading(true)
      clearError()

      await organizationsAPI.deleteOrganization(organizationId)

      // Помечаем как неактивную в списке
      const index = organizations.value.findIndex(org => org.organization_id === organizationId)
      if (index > -1) {
        organizations.value[index].isActive = false
      }

      // Если удаляем текущую организацию, сбрасываем выбор
      if (currentOrganization.value?.organization_id === organizationId) {
        currentOrganization.value = null
        currentOrganizationStats.value = null
        currentOrganizationDocuments.value = []
        localStorage.removeItem('currentOrganizationId')
      }

      return true
    } catch (error) {
      console.error('Error deleting organization:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Загрузить документ для текущей организации
   */
  const uploadDocument = async (documentData) => {
    if (!currentOrganization.value) {
      throw new Error('Не выбрана организация')
    }

    try {
      clearError()

      const document = await organizationsAPI.uploadOrganizationDocument(
        currentOrganization.value.organization_id,
        documentData
      )

      currentOrganizationDocuments.value.push(document)

      return document
    } catch (error) {
      console.error('Error uploading document:', error)
      setError(error.message)
      throw error
    }
  }

  /**
   * Восстановить текущую организацию из localStorage
   */
  const restoreCurrentOrganization = async () => {
    try {
      const savedOrganizationId = localStorage.getItem('currentOrganizationId')

      if (savedOrganizationId) {
        await setCurrentOrganization(savedOrganizationId)
      }
    } catch (error) {
      console.warn('Failed to restore current organization:', error)
      localStorage.removeItem('currentOrganizationId')
    }
  }

  /**
   * Инициализация store
   */
  const initialize = async () => {
    try {
      // Загружаем список организаций
      await loadOrganizations()

      // Пытаемся восстановить текущую организацию
      await restoreCurrentOrganization()

      return true
    } catch (error) {
      console.error('Error initializing organizations store:', error)
      throw error
    }
  }

  /**
   * Очистить store
   */
  const reset = () => {
    organizations.value = []
    currentOrganization.value = null
    currentOrganizationStats.value = null
    currentOrganizationDocuments.value = []
    isLoading.value = false
    isLoadingStats.value = false
    lastError.value = null
    localStorage.removeItem('currentOrganizationId')
  }

  return {
    // State
    organizations,
    currentOrganization,
    currentOrganizationStats,
    currentOrganizationDocuments,
    isLoading,
    isLoadingStats,
    lastError,

    // Getters
    allOrganizations,
    activeOrganizations,
    getCurrentOrganization,
    getCurrentOrganizationId,
    getCurrentOrganizationName,
    hasCurrentOrganization,
    getOrganizationById,
    isCurrentOrganization,

    // Actions
    loadOrganizations,
    loadOrganization,
    setCurrentOrganization,
    loadCurrentOrganizationStats,
    loadCurrentOrganizationDocuments,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    uploadDocument,
    restoreCurrentOrganization,
    initialize,
    reset,
    setLoading,
    setError,
    clearError
  }
})