import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useActivitiesStore = defineStore('activities', () => {
  const appStore = useAppStore()

  // State
  const activities = ref([])
  const activityTypes = ref([])
  const activityTypeGroups = ref([])
  const selectedActivity = ref(null)
  const isLoading = ref(false)
  const currentView = ref('timeline') // 'hierarchy', 'timeline', 'summary', 'ganttastic', 'gantt-elastic'
  const filters = ref({})
  const groupBy = ref(null)
  const hierarchyExpanded = ref({}) // ID активностей, которые развернуты в дереве
  const searchHighlighted = ref(new Set()) // ID активностей, выделенных в результате поиска
  const searchResultIds = ref(new Set()) // ID активностей из результатов поиска
  const selectedParentForCreation = ref(null) // ID родительской активности для создания новой

  // Getters
  const activitiesTree = computed(() => {
    // Преобразуем плоский список в дерево
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_activity_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.activity_id)
        }))
    }
    return buildTree(activities.value)
  })

  const selectedActivityData = computed(() => {
    if (!selectedActivity.value) return null
    return activities.value.find(a => a.activity_id === selectedActivity.value)
  })

  const filteredActivities = computed(() => {
    let filtered = activities.value

    // Применяем базовые фильтры (быстрые фильтры)
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(activity =>
        activity.name.toLowerCase().includes(search)
      )
    }

    if (filters.value.status) {
      filtered = filtered.filter(activity =>
        activity.status === filters.value.status
      )
    }

    if (filters.value.activity_type_id) {
      filtered = filtered.filter(activity =>
        activity.activity_type_id === filters.value.activity_type_id
      )
    }

    if (filters.value.created_by) {
      filtered = filtered.filter(activity =>
        activity.created_by === filters.value.created_by
      )
    }

    if (filters.value.currency_code) {
      filtered = filtered.filter(activity =>
        activity.currency_code === filters.value.currency_code
      )
    }

    if (filters.value.start_date) {
      const startDate = new Date(filters.value.start_date)
      filtered = filtered.filter(activity =>
        activity.in_market_start_date && new Date(activity.in_market_start_date) >= startDate
      )
    }

    if (filters.value.end_date) {
      const endDate = new Date(filters.value.end_date)
      filtered = filtered.filter(activity =>
        activity.in_market_start_date && new Date(activity.in_market_start_date) <= endDate
      )
    }

    // Применяем расширенные условия фильтрации
    if (filters.value.conditions && Array.isArray(filters.value.conditions)) {
      for (const condition of filters.value.conditions) {
        filtered = applyFilterCondition(filtered, condition)
      }
    }

    // Если включена опция "показать полную иерархию", добавляем родительские элементы
    if (filters.value.show_full_hierarchy && filtered.length < activities.value.length) {
      const filteredIds = new Set(filtered.map(a => a.activity_id))
      const additionalActivities = []

      // Для каждой отфильтрованной активности добавляем всех родителей
      for (const activity of filtered) {
        let currentParentId = activity.parent_activity_id
        while (currentParentId) {
          if (!filteredIds.has(currentParentId)) {
            const parent = activities.value.find(a => a.activity_id === currentParentId)
            if (parent) {
              additionalActivities.push(parent)
              filteredIds.add(currentParentId)
              currentParentId = parent.parent_activity_id
            } else {
              break
            }
          } else {
            break
          }
        }
      }

      filtered = [...filtered, ...additionalActivities]
    }

    return filtered
  })

  // Применение отдельного условия фильтрации
  const applyFilterCondition = (activities, condition) => {
    const { field, operator, value } = condition

    return activities.filter(activity => {
      const fieldValue = activity[field]

      switch (operator) {
        case 'contains':
          return fieldValue && fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        case 'not_contains':
          return !fieldValue || !fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        case 'equals':
          return fieldValue === value
        case 'not_equals':
          return fieldValue !== value
        case 'starts_with':
          return fieldValue && fieldValue.toString().toLowerCase().startsWith(value.toLowerCase())
        case 'ends_with':
          return fieldValue && fieldValue.toString().toLowerCase().endsWith(value.toLowerCase())
        case 'greater_than':
          return fieldValue && parseFloat(fieldValue) > parseFloat(value)
        case 'less_than':
          return fieldValue && parseFloat(fieldValue) < parseFloat(value)
        case 'greater_or_equal':
          return fieldValue && parseFloat(fieldValue) >= parseFloat(value)
        case 'less_or_equal':
          return fieldValue && parseFloat(fieldValue) <= parseFloat(value)
        case 'in':
          return value.includes(fieldValue)
        case 'not_in':
          return !value.includes(fieldValue)
        default:
          return true
      }
    })
  }

  const groupedActivities = computed(() => {
    if (!groupBy.value) return null

    const groups = {}
    filteredActivities.value.forEach(activity => {
      const groupKey = activity[groupBy.value] || 'Не указано'
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(activity)
    })

    return groups
  })

  // Actions
  const fetchActivities = async (filterParams = {}) => {
    try {
      isLoading.value = true
      // console.log('[ActivitiesStore] Fetching activities...')
      // console.log(85);
      const data = await api.activities.getActivities(filterParams, groupBy.value)
      // console.log(87);
      // console.log('[ActivitiesStore] Received activities:', data)
      activities.value = data || []
      // console.log('[ActivitiesStore] Activities loaded:', activities.value.length)
    } catch (error) {
      console.error('[ActivitiesStore] Error fetching activities:', error)
      appStore.showError('Ошибка загрузки активностей: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchActivityTypes = async () => {
    try {
      // console.log('[ActivitiesStore] Fetching activity types...')
      const [types, groups] = await Promise.all([
        api.activityTypes.getActivityTypes(),
        api.activityTypes.getActivityTypeGroups()
      ])
      // console.log('[ActivitiesStore] Received types:', types)
      // console.log('[ActivitiesStore] Received groups:', groups)
      activityTypes.value = types || []
      activityTypeGroups.value = groups || []
      // console.log('[ActivitiesStore] ActivityTypes loaded:', activityTypes.value.length)
    } catch (error) {
      console.error('[ActivitiesStore] Error fetching activity types:', error)
      appStore.showError('Ошибка загрузки типов активностей: ' + error.message)
    }
  }

  const selectActivity = (activityId) => {
    selectedActivity.value = activityId
  }

  const createActivity = async (activityData) => {
    try {
      isLoading.value = true
      const newActivity = await api.activities.createActivity(activityData)
      activities.value.push(newActivity)
      appStore.showSuccess('Активность создана успешно')
      return newActivity
    } catch (error) {
      appStore.showError('Ошибка создания активности: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateActivity = async (activityId, updateData) => {
    try {
      isLoading.value = true
      const updatedActivity = await api.activities.updateActivity(activityId, updateData)

      const index = activities.value.findIndex(a => a.activity_id === activityId)
      if (index !== -1) {
        activities.value[index] = { ...activities.value[index], ...updatedActivity }
      }

      appStore.showSuccess('Активность обновлена')
      return updatedActivity
    } catch (error) {
      appStore.showError('Ошибка обновления активности: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteActivity = async (activityId) => {
    try {
      isLoading.value = true
      await api.activities.deleteActivity(activityId)

      // Удаляем из списка
      activities.value = activities.value.filter(a => a.activity_id !== activityId)

      // Сбрасываем выбор, если удалили выбранную активность
      if (selectedActivity.value === activityId) {
        selectedActivity.value = null
      }

      appStore.showSuccess('Активность удалена')
    } catch (error) {
      appStore.showError('Ошибка удаления активности: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const duplicateActivity = async (activityId) => {
    try {
      isLoading.value = true
      const duplicatedActivity = await api.activities.duplicateActivity(activityId)
      activities.value.push(duplicatedActivity)
      appStore.showSuccess('Активность дублирована')
      return duplicatedActivity
    } catch (error) {
      appStore.showError('Ошибка дублирования активности: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const moveActivity = async (activityId, newParentId) => {
    try {
      const updatedActivity = await api.activities.moveActivity(activityId, newParentId)

      const index = activities.value.findIndex(a => a.activity_id === activityId)
      if (index !== -1) {
        activities.value[index] = { ...activities.value[index], ...updatedActivity }
      }

      appStore.showSuccess('Активность перемещена')
      return updatedActivity
    } catch (error) {
      appStore.showError('Ошибка перемещения активности: ' + error.message)
      throw error
    }
  }

  const setView = (view) => {
    currentView.value = view
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const setGroupBy = (field) => {
    groupBy.value = field
  }

  const toggleHierarchyNode = (activityId) => {
    hierarchyExpanded.value[activityId] = !hierarchyExpanded.value[activityId]
  }

  const expandAllNodes = () => {
    activities.value.forEach(activity => {
      hierarchyExpanded.value[activity.activity_id] = true
    })
  }

  const collapseAllNodes = () => {
    hierarchyExpanded.value = {}
  }

  const searchActivities = async (keyword) => {
    if (!keyword.trim()) {
      await fetchActivities()
      clearSearchHighlight()
      return
    }

    try {
      isLoading.value = true
      const results = await api.activities.searchActivities(keyword)
      activities.value = results || []

      // Подсвечиваем найденные результаты
      const foundIds = results.map(r => r.activity_id)
      searchResultIds.value = new Set(foundIds)
      highlightSearchResults(foundIds)
    } catch (error) {
      appStore.showError('Ошибка поиска: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const clearSearch = async () => {
    await fetchActivities()
    clearSearchHighlight()
    searchResultIds.value = new Set()
  }

  const highlightSearchResult = (activityId) => {
    searchHighlighted.value.add(activityId)
  }

  const highlightSearchResults = (activityIds) => {
    searchHighlighted.value = new Set(activityIds)
  }

  const clearSearchHighlight = () => {
    searchHighlighted.value = new Set()
  }

  const setSearchResults = (results) => {
    const ids = results.map(r => r.activity_id)
    searchResultIds.value = new Set(ids)
    highlightSearchResults(ids)
  }

  const expandSearchResults = () => {
    // Разворачиваем все узлы, которые содержат результаты поиска
    for (const activityId of searchResultIds.value) {
      expandToActivity(activityId)
    }
  }

  const expandToActivity = (activityId) => {
    // Находим путь от корня до активности и разворачиваем все узлы на пути
    const activity = activities.value.find(a => a.activity_id === activityId)
    if (!activity) return

    let currentId = activity.parent_activity_id
    while (currentId) {
      hierarchyExpanded.value[currentId] = true
      const parent = activities.value.find(a => a.activity_id === currentId)
      currentId = parent ? parent.parent_activity_id : null
    }
  }

  const isActivityHighlighted = (activityId) => {
    return searchHighlighted.value.has(activityId)
  }

  const setSelectedParentForCreation = (parentId) => {
    selectedParentForCreation.value = parentId
  }

  const clearSelectedParentForCreation = () => {
    selectedParentForCreation.value = null
  }

  // Инициализация
  const initialize = async () => {
    console.log('[ActivitiesStore] Initializing...')
    try {
      await Promise.all([
        fetchActivities(),
        fetchActivityTypes()
      ])
      console.log('[ActivitiesStore] Initialization completed successfully')
      console.log('[ActivitiesStore] Activities count:', activities.value.length)
      console.log('[ActivitiesStore] ActivityTypes count:', activityTypes.value.length)
    } catch (error) {
      console.error('[ActivitiesStore] Initialization failed:', error)
    }
  }

  return {
    // State
    activities,
    activityTypes,
    activityTypeGroups,
    selectedActivity,
    isLoading,
    currentView,
    filters,
    groupBy,
    hierarchyExpanded,
    searchHighlighted,
    searchResultIds,
    selectedParentForCreation,

    // Getters
    activitiesTree,
    selectedActivityData,
    filteredActivities,
    groupedActivities,

    // Actions
    fetchActivities,
    fetchActivityTypes,
    selectActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    duplicateActivity,
    moveActivity,
    setView,
    setFilters,
    clearFilters,
    setGroupBy,
    toggleHierarchyNode,
    expandAllNodes,
    collapseAllNodes,
    searchActivities,
    clearSearch,
    highlightSearchResult,
    highlightSearchResults,
    clearSearchHighlight,
    setSearchResults,
    expandSearchResults,
    expandToActivity,
    isActivityHighlighted,
    setSelectedParentForCreation,
    clearSelectedParentForCreation,
    initialize
  }
})