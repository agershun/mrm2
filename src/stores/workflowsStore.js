import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAppStore } from './appStore'

export const useWorkflowsStore = defineStore('workflows', () => {
  const appStore = useAppStore()

  // State
  const workflowTypes = ref([])
  const workflows = ref([])
  const workflowVariables = ref([])
  const selectedWorkflow = ref(null)
  const isLoading = ref(false)
  const filters = ref({})

  // Getters
  const workflowsByType = computed(() => {
    const groups = {}
    workflows.value.forEach(workflow => {
      const type = workflowTypes.value.find(wt => wt.workflow_type_id === workflow.workflow_type_id)
      const typeName = type ? type.name : 'Неизвестный тип'

      if (!groups[typeName]) {
        groups[typeName] = []
      }
      groups[typeName].push(workflow)
    })
    return groups
  })

  const workflowsByStatus = computed(() => {
    const groups = {
      'active': [],
      'draft': [],
      'archived': [],
      'running': [],
      'completed': [],
      'failed': []
    }
    workflows.value.forEach(workflow => {
      const status = workflow.status || 'draft'
      if (groups[status]) {
        groups[status].push(workflow)
      }
    })
    return groups
  })

  const selectedWorkflowData = computed(() => {
    if (!selectedWorkflow.value) return null
    const workflow = workflows.value.find(w => w.workflow_id === selectedWorkflow.value)
    if (!workflow) return null

    const workflowType = workflowTypes.value.find(wt => wt.workflow_type_id === workflow.workflow_type_id)
    const variables = workflowVariables.value.filter(wv => wv.workflow_id === workflow.workflow_id)

    return {
      ...workflow,
      type: workflowType,
      variables
    }
  })

  const filteredWorkflows = computed(() => {
    let filtered = workflows.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(workflow =>
        workflow.name.toLowerCase().includes(search) ||
        workflow.description?.toLowerCase().includes(search)
      )
    }

    if (filters.value.status) {
      filtered = filtered.filter(workflow => workflow.status === filters.value.status)
    }

    if (filters.value.type) {
      filtered = filtered.filter(workflow => workflow.workflow_type_id === filters.value.type)
    }

    if (filters.value.entity_type) {
      filtered = filtered.filter(workflow => workflow.entity_type === filters.value.entity_type)
    }

    return filtered
  })

  const workflowTemplates = computed(() => {
    return workflowTypes.value.filter(wt => wt.is_template)
  })

  // Actions
  const fetchWorkflowTypes = async () => {
    try {
      isLoading.value = true
      const data = await api.workflows.getWorkflowTypes()
      workflowTypes.value = data || []
    } catch (error) {
      console.error('Error fetching workflow types:', error)
      appStore.showError('Ошибка загрузки типов рабочих процессов: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchWorkflows = async (filterParams = {}) => {
    try {
      isLoading.value = true
      const data = await api.workflows.getWorkflows(filterParams)
      workflows.value = data || []
    } catch (error) {
      console.error('Error fetching workflows:', error)
      appStore.showError('Ошибка загрузки рабочих процессов: ' + error.message)
    } finally {
      isLoading.value = false
    }
  }

  const fetchWorkflowVariables = async (workflowId = null) => {
    try {
      const data = await api.workflows.getWorkflowVariables(workflowId)
      workflowVariables.value = data || []
    } catch (error) {
      console.error('Error fetching workflow variables:', error)
      appStore.showError('Ошибка загрузки переменных рабочих процессов: ' + error.message)
    }
  }

  const selectWorkflow = (workflowId) => {
    selectedWorkflow.value = workflowId
  }

  const createWorkflowType = async (typeData) => {
    try {
      isLoading.value = true
      const newType = await api.workflows.createWorkflowType(typeData)
      workflowTypes.value.push(newType)
      appStore.showSuccess('Тип рабочего процесса создан успешно')
      return newType
    } catch (error) {
      appStore.showError('Ошибка создания типа рабочего процесса: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateWorkflowType = async (typeId, updateData) => {
    try {
      isLoading.value = true
      const updatedType = await api.workflows.updateWorkflowType(typeId, updateData)

      const index = workflowTypes.value.findIndex(wt => wt.workflow_type_id === typeId)
      if (index !== -1) {
        workflowTypes.value[index] = { ...workflowTypes.value[index], ...updatedType }
      }

      appStore.showSuccess('Тип рабочего процесса обновлен')
      return updatedType
    } catch (error) {
      appStore.showError('Ошибка обновления типа рабочего процесса: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteWorkflowType = async (typeId) => {
    try {
      isLoading.value = true
      await api.workflows.deleteWorkflowType(typeId)

      workflowTypes.value = workflowTypes.value.filter(wt => wt.workflow_type_id !== typeId)
      appStore.showSuccess('Тип рабочего процесса удален')
    } catch (error) {
      appStore.showError('Ошибка удаления типа рабочего процесса: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createWorkflow = async (workflowData) => {
    try {
      isLoading.value = true
      const newWorkflow = await api.workflows.createWorkflow(workflowData)
      workflows.value.push(newWorkflow)
      appStore.showSuccess('Рабочий процесс создан успешно')
      return newWorkflow
    } catch (error) {
      appStore.showError('Ошибка создания рабочего процесса: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateWorkflow = async (workflowId, updateData) => {
    try {
      isLoading.value = true
      const updatedWorkflow = await api.workflows.updateWorkflow(workflowId, updateData)

      const index = workflows.value.findIndex(w => w.workflow_id === workflowId)
      if (index !== -1) {
        workflows.value[index] = { ...workflows.value[index], ...updatedWorkflow }
      }

      appStore.showSuccess('Рабочий процесс обновлен')
      return updatedWorkflow
    } catch (error) {
      appStore.showError('Ошибка обновления рабочего процесса: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteWorkflow = async (workflowId) => {
    try {
      isLoading.value = true
      await api.workflows.deleteWorkflow(workflowId)

      workflows.value = workflows.value.filter(w => w.workflow_id !== workflowId)
      // Удаляем связанные переменные
      workflowVariables.value = workflowVariables.value.filter(wv => wv.workflow_id !== workflowId)

      if (selectedWorkflow.value === workflowId) {
        selectedWorkflow.value = null
      }

      appStore.showSuccess('Рабочий процесс удален')
    } catch (error) {
      appStore.showError('Ошибка удаления рабочего процесса: ' + error.message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const startWorkflow = async (workflowId, inputData = {}) => {
    try {
      const result = await api.workflows.startWorkflow(workflowId, inputData)

      // Обновляем статус в локальном состоянии
      const index = workflows.value.findIndex(w => w.workflow_id === workflowId)
      if (index !== -1) {
        workflows.value[index].status = 'running'
        workflows.value[index].started_at = new Date().toISOString()
      }

      appStore.showSuccess('Рабочий процесс запущен')
      return result
    } catch (error) {
      appStore.showError('Ошибка запуска рабочего процесса: ' + error.message)
      throw error
    }
  }

  const stopWorkflow = async (workflowId) => {
    try {
      const result = await api.workflows.stopWorkflow(workflowId)

      // Обновляем статус в локальном состоянии
      const index = workflows.value.findIndex(w => w.workflow_id === workflowId)
      if (index !== -1) {
        workflows.value[index].status = 'stopped'
        workflows.value[index].stopped_at = new Date().toISOString()
      }

      appStore.showSuccess('Рабочий процесс остановлен')
      return result
    } catch (error) {
      appStore.showError('Ошибка остановки рабочего процесса: ' + error.message)
      throw error
    }
  }

  const resumeWorkflow = async (workflowId) => {
    try {
      const result = await api.workflows.resumeWorkflow(workflowId)

      // Обновляем статус в локальном состоянии
      const index = workflows.value.findIndex(w => w.workflow_id === workflowId)
      if (index !== -1) {
        workflows.value[index].status = 'running'
      }

      appStore.showSuccess('Рабочий процесс возобновлен')
      return result
    } catch (error) {
      appStore.showError('Ошибка возобновления рабочего процесса: ' + error.message)
      throw error
    }
  }

  const createVariable = async (variableData) => {
    try {
      const newVariable = await api.workflows.createWorkflowVariable(variableData)
      workflowVariables.value.push(newVariable)
      appStore.showSuccess('Переменная рабочего процесса создана')
      return newVariable
    } catch (error) {
      appStore.showError('Ошибка создания переменной рабочего процесса: ' + error.message)
      throw error
    }
  }

  const updateVariable = async (variableId, updateData) => {
    try {
      const updatedVariable = await api.workflows.updateWorkflowVariable(variableId, updateData)

      const index = workflowVariables.value.findIndex(wv => wv.variable_id === variableId)
      if (index !== -1) {
        workflowVariables.value[index] = { ...workflowVariables.value[index], ...updatedVariable }
      }

      appStore.showSuccess('Переменная рабочего процесса обновлена')
      return updatedVariable
    } catch (error) {
      appStore.showError('Ошибка обновления переменной рабочего процесса: ' + error.message)
      throw error
    }
  }

  const deleteVariable = async (variableId) => {
    try {
      await api.workflows.deleteWorkflowVariable(variableId)
      workflowVariables.value = workflowVariables.value.filter(wv => wv.variable_id !== variableId)
      appStore.showSuccess('Переменная рабочего процесса удалена')
    } catch (error) {
      appStore.showError('Ошибка удаления переменной рабочего процесса: ' + error.message)
      throw error
    }
  }

  const cloneWorkflow = async (workflowId, newName) => {
    try {
      const clonedWorkflow = await api.workflows.cloneWorkflow(workflowId, newName)
      workflows.value.push(clonedWorkflow)
      appStore.showSuccess('Рабочий процесс скопирован')
      return clonedWorkflow
    } catch (error) {
      appStore.showError('Ошибка копирования рабочего процесса: ' + error.message)
      throw error
    }
  }

  const activateWorkflow = async (workflowId) => {
    return updateWorkflow(workflowId, { status: 'active' })
  }

  const archiveWorkflow = async (workflowId) => {
    return updateWorkflow(workflowId, { status: 'archived' })
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const searchWorkflows = async (keyword) => {
    if (!keyword.trim()) {
      await fetchWorkflows()
      return
    }

    try {
      isLoading.value = true
      const results = await api.workflows.searchWorkflows(keyword)
      workflows.value = results || []
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
        fetchWorkflowTypes(),
        fetchWorkflows(),
        fetchWorkflowVariables()
      ])
    } catch (error) {
      console.error('Workflows store initialization failed:', error)
    }
  }

  return {
    // State
    workflowTypes,
    workflows,
    workflowVariables,
    selectedWorkflow,
    isLoading,
    filters,

    // Getters
    workflowsByType,
    workflowsByStatus,
    selectedWorkflowData,
    filteredWorkflows,
    workflowTemplates,

    // Actions
    fetchWorkflowTypes,
    fetchWorkflows,
    fetchWorkflowVariables,
    selectWorkflow,
    createWorkflowType,
    updateWorkflowType,
    deleteWorkflowType,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    stopWorkflow,
    resumeWorkflow,
    createVariable,
    updateVariable,
    deleteVariable,
    cloneWorkflow,
    activateWorkflow,
    archiveWorkflow,
    setFilters,
    clearFilters,
    searchWorkflows,
    initialize
  }
})