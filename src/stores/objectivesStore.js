import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useObjectivesStore = defineStore('objectives', () => {
  const appStore = useAppStore()

  // State
  const objectives = ref([])
  const objectiveKeyResults = ref([])
  const investmentObjectives = ref([])
  const selectedObjective = ref(null)
  const isLoading = ref(false)
  const filters = ref({})

  // Getters
  const objectivesTree = computed(() => {
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_objective_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.objective_id),
          keyResults: objectiveKeyResults.value.filter(kr => kr.objective_id === item.objective_id)
        }))
    }
    return buildTree(objectives.value)
  })

  const selectedObjectiveData = computed(() => {
    if (!selectedObjective.value) return null
    const objective = objectives.value.find(o => o.objective_id === selectedObjective.value)
    if (!objective) return null
    return {
      ...objective,
      keyResults: objectiveKeyResults.value.filter(kr => kr.objective_id === objective.objective_id),
      investments: investmentObjectives.value.filter(io => io.objective_id === objective.objective_id)
    }
  })

  const filteredObjectives = computed(() => {
    let filtered = objectives.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(obj =>
        obj.name.toLowerCase().includes(search) ||
        obj.description?.toLowerCase().includes(search)
      )
    }

    if (filters.value.status) {
      filtered = filtered.filter(obj => obj.status === filters.value.status)
    }

    if (filters.value.type) {
      filtered = filtered.filter(obj => obj.type === filters.value.type)
    }

    return filtered
  })

  const objectivesByStatus = computed(() => {
    const groups = {
      'active': [],
      'completed': [],
      'paused': [],
      'cancelled': []
    }
    objectives.value.forEach(obj => {
      const status = obj.status || 'active'
      if (groups[status]) {
        groups[status].push(obj)
      }
    })
    return groups
  })

  // Actions
  const fetchObjectives = async (filterParams = {}) => {
    try {
      isLoading.value = true
      const data = await api.objectives.getObjectives(filterParams)
      objectives.value = data || []
    } catch (error) {
      console.error('Error fetching objectives:', error)
      appStore.showError('Ошибка загрузки целей: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchObjectiveKeyResults = async (objectiveId = null) => {
    try {
      const data = await api.objectives.getObjectiveKeyResults(objectiveId)
      objectiveKeyResults.value = data || []
    } catch (error) {
      console.error('Error fetching key results:', error)
      appStore.showError('Ошибка загрузки ключевых результатов: ' + error.message)
    }
  }

  const fetchInvestmentObjectives = async () => {
    try {
      const data = await api.objectives.getInvestmentObjectives()
      investmentObjectives.value = data || []
    } catch (error) {
      console.error('Error fetching investment objectives:', error)
      appStore.showError('Ошибка загрузки связей инвестиций и целей: ' + error.message)
    }
  }

  const selectObjective = (objectiveId) => {
    selectedObjective.value = objectiveId
  }

  const createObjective = async (objectiveData) => {
    try {
      isLoading.value = true
      const newObjective = await api.objectives.createObjective(objectiveData)
      objectives.value.push(newObjective)
      appStore.showSuccess('Цель создана успешно')
      return newObjective
    } catch (error) {
      appStore.showError('Ошибка создания цели: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateObjective = async (objectiveId, updateData) => {
    try {
      isLoading.value = true
      const updatedObjective = await api.objectives.updateObjective(objectiveId, updateData)

      const index = objectives.value.findIndex(o => o.objective_id === objectiveId)
      if (index !== -1) {
        objectives.value[index] = { ...objectives.value[index], ...updatedObjective }
      }

      appStore.showSuccess('Цель обновлена')
      return updatedObjective
    } catch (error) {
      appStore.showError('Ошибка обновления цели: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteObjective = async (objectiveId) => {
    try {
      isLoading.value = true
      await api.objectives.deleteObjective(objectiveId)

      objectives.value = objectives.value.filter(o => o.objective_id !== objectiveId)

      if (selectedObjective.value === objectiveId) {
        selectedObjective.value = null
      }

      appStore.showSuccess('Цель удалена')
    } catch (error) {
      appStore.showError('Ошибка удаления цели: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createKeyResult = async (keyResultData) => {
    try {
      const newKeyResult = await api.objectives.createKeyResult(keyResultData)
      objectiveKeyResults.value.push(newKeyResult)
      appStore.showSuccess('Ключевой результат создан')
      return newKeyResult
    } catch (error) {
      appStore.showError('Ошибка создания ключевого результата: ' + error.message)
      throw error
    }
  }

  const updateKeyResult = async (keyResultId, updateData) => {
    try {
      const updatedKeyResult = await api.objectives.updateKeyResult(keyResultId, updateData)

      const index = objectiveKeyResults.value.findIndex(kr => kr.key_result_id === keyResultId)
      if (index !== -1) {
        objectiveKeyResults.value[index] = { ...objectiveKeyResults.value[index], ...updatedKeyResult }
      }

      appStore.showSuccess('Ключевой результат обновлен')
      return updatedKeyResult
    } catch (error) {
      appStore.showError('Ошибка обновления ключевого результата: ' + error.message)
      throw error
    }
  }

  const deleteKeyResult = async (keyResultId) => {
    try {
      await api.objectives.deleteKeyResult(keyResultId)
      objectiveKeyResults.value = objectiveKeyResults.value.filter(kr => kr.key_result_id !== keyResultId)
      appStore.showSuccess('Ключевой результат удален')
    } catch (error) {
      appStore.showError('Ошибка удаления ключевого результата: ' + error.message)
      throw error
    }
  }

  const linkInvestmentToObjective = async (investmentId, objectiveId, weight = 1.0) => {
    try {
      const link = await api.objectives.createInvestmentObjective({
        investment_id: investmentId,
        objective_id: objectiveId,
        allocation_weight: weight
      })
      investmentObjectives.value.push(link)
      appStore.showSuccess('Инвестиция привязана к цели')
      return link
    } catch (error) {
      appStore.showError('Ошибка привязки инвестиции к цели: ' + error.message)
      throw error
    }
  }

  const unlinkInvestmentFromObjective = async (investmentId, objectiveId) => {
    try {
      await api.objectives.deleteInvestmentObjective(investmentId, objectiveId)
      investmentObjectives.value = investmentObjectives.value.filter(
        io => !(io.investment_id === investmentId && io.objective_id === objectiveId)
      )
      appStore.showSuccess('Инвестиция отвязана от цели')
    } catch (error) {
      appStore.showError('Ошибка отвязки инвестиции от цели: ' + error.message)
      throw error
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const searchObjectives = async (keyword) => {
    if (!keyword.trim()) {
      await fetchObjectives()
      return
    }

    try {
      isLoading.value = true
      const results = await api.objectives.searchObjectives(keyword)
      objectives.value = results || []
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
        fetchObjectives(),
        fetchObjectiveKeyResults(),
        fetchInvestmentObjectives()
      ])
    } catch (error) {
      console.error('Objectives store initialization failed:', error)
    }
  }

  return {
    // State
    objectives,
    objectiveKeyResults,
    investmentObjectives,
    selectedObjective,
    isLoading,
    filters,

    // Getters
    objectivesTree,
    selectedObjectiveData,
    filteredObjectives,
    objectivesByStatus,

    // Actions
    fetchObjectives,
    fetchObjectiveKeyResults,
    fetchInvestmentObjectives,
    selectObjective,
    createObjective,
    updateObjective,
    deleteObjective,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult,
    linkInvestmentToObjective,
    unlinkInvestmentFromObjective,
    setFilters,
    clearFilters,
    searchObjectives,
    initialize
  }
})