/**
 * Pinia store для управления промптами LLM и их выполнением
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as promptsAPI from '@/api/modules/prompts'

export const usePromptsStore = defineStore('prompts', () => {
  // State
  const prompts = ref([])
  const campaignTemplates = ref([])
  const promptExecutions = ref([])
  const currentExecution = ref(null)
  const currentPipeline = ref(null)

  const loading = ref(false)
  const executionLoading = ref(false)
  const error = ref(null)

  // Getters
  const promptsByCategory = computed(() => {
    const grouped = {}
    prompts.value.forEach(prompt => {
      const category = prompt.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(prompt)
    })
    return grouped
  })

  const promptsByStep = computed(() => {
    return prompts.value
      .filter(p => p.step)
      .sort((a, b) => a.step - b.step)
  })

  const templatesByCategory = computed(() => {
    const grouped = {}
    campaignTemplates.value.forEach(template => {
      const category = template.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(template)
    })
    return grouped
  })

  const recentExecutions = computed(() => {
    return promptExecutions.value
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
      .slice(0, 10)
  })

  const executionsByPrompt = computed(() => {
    const grouped = {}
    promptExecutions.value.forEach(execution => {
      const promptId = execution.prompt_id
      if (!grouped[promptId]) {
        grouped[promptId] = []
      }
      grouped[promptId].push(execution)
    })
    return grouped
  })

  // Actions
  const loadPrompts = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await promptsAPI.getPrompts(filters)
      prompts.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadPromptById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const prompt = await promptsAPI.getPromptById(id)

      // Обновляем в списке если есть
      const index = prompts.value.findIndex(p => p.prompt_id === id)
      if (index !== -1) {
        prompts.value[index] = prompt
      } else {
        prompts.value.push(prompt)
      }

      return prompt
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPrompt = async (promptData) => {
    loading.value = true
    error.value = null

    try {
      const newPrompt = await promptsAPI.createPrompt(promptData)
      prompts.value.push(newPrompt)
      return newPrompt
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePrompt = async (id, updates) => {
    loading.value = true
    error.value = null

    try {
      const updatedPrompt = await promptsAPI.updatePrompt(id, updates)

      const index = prompts.value.findIndex(p => p.prompt_id === id)
      if (index !== -1) {
        prompts.value[index] = updatedPrompt
      }

      return updatedPrompt
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePrompt = async (id) => {
    loading.value = true
    error.value = null

    try {
      await promptsAPI.deletePrompt(id)
      const index = prompts.value.findIndex(p => p.prompt_id === id)
      if (index !== -1) {
        prompts.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Campaign Templates
  const loadCampaignTemplates = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await promptsAPI.getCampaignTemplates(filters)
      campaignTemplates.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadCampaignTemplateById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const template = await promptsAPI.getCampaignTemplateById(id)

      const index = campaignTemplates.value.findIndex(t => t.template_id === id)
      if (index !== -1) {
        campaignTemplates.value[index] = template
      } else {
        campaignTemplates.value.push(template)
      }

      return template
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Prompt Executions
  const executePrompt = async (promptId, inputData, parameters = {}) => {
    executionLoading.value = true
    error.value = null

    try {
      const execution = await promptsAPI.executePrompt(promptId, inputData, parameters)
      promptExecutions.value.unshift(execution)
      currentExecution.value = execution
      return execution
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      executionLoading.value = false
    }
  }

  const loadPromptExecutions = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await promptsAPI.getPromptExecutions(filters)
      promptExecutions.value = response.data
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadPromptExecutionById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const execution = await promptsAPI.getPromptExecutionById(id)
      currentExecution.value = execution

      const index = promptExecutions.value.findIndex(e => e.execution_id === id)
      if (index !== -1) {
        promptExecutions.value[index] = execution
      } else {
        promptExecutions.value.push(execution)
      }

      return execution
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Pipeline Execution
  const executePipeline = async (pipelineConfig) => {
    executionLoading.value = true
    error.value = null

    try {
      const pipeline = await promptsAPI.executePipeline(pipelineConfig)
      currentPipeline.value = pipeline

      // Добавляем все выполнения в список
      pipeline.steps.forEach(execution => {
        promptExecutions.value.unshift(execution)
      })

      return pipeline
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      executionLoading.value = false
    }
  }

  // Utility functions
  const getPromptByStep = (step) => {
    return prompts.value.find(p => p.step === step)
  }

  const getExecutionsForPrompt = (promptId) => {
    return promptExecutions.value.filter(e => e.prompt_id === promptId)
  }

  const getTemplateByCategory = (category) => {
    return campaignTemplates.value.filter(t => t.category === category)
  }

  const clearCurrentExecution = () => {
    currentExecution.value = null
  }

  const clearCurrentPipeline = () => {
    currentPipeline.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // Campaign Planning Helpers
  const createCampaignFromTemplate = async (templateId, campaignDescription) => {
    const template = campaignTemplates.value.find(t => t.template_id === templateId)
    if (!template) {
      throw new Error('Шаблон не найден')
    }

    const pipelineConfig = {
      template_id: templateId,
      steps: template.prompt_sequence.map((promptId, index) => ({
        step: index + 1,
        prompt_id: promptId,
        input_data: index === 0
          ? { campaign_description: campaignDescription }
          : {}, // Будет заполнено из предыдущих шагов
        parameters: {}
      }))
    }

    return await executePipeline(pipelineConfig)
  }

  const continueFromStep = async (pipelineId, fromStep, inputData) => {
    // Реализация продолжения пайплайна с определенного шага
    // Будет использоваться для корректировки и переделки шагов
    executionLoading.value = true
    error.value = null

    try {
      // Логика продолжения пайплайна
      const currentPipeline = currentPipeline.value
      if (!currentPipeline) {
        throw new Error('Нет активного пайплайна')
      }

      // Создаем новую конфигурацию с нужного шага
      const remainingSteps = currentPipeline.steps.slice(fromStep - 1)
      const newPipelineConfig = {
        parent_pipeline_id: pipelineId,
        steps: remainingSteps.map(step => ({
          ...step,
          input_data: step.step === fromStep ? inputData : step.input_data
        }))
      }

      return await executePipeline(newPipelineConfig)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      executionLoading.value = false
    }
  }

  return {
    // State
    prompts,
    campaignTemplates,
    promptExecutions,
    currentExecution,
    currentPipeline,
    loading,
    executionLoading,
    error,

    // Getters
    promptsByCategory,
    promptsByStep,
    templatesByCategory,
    recentExecutions,
    executionsByPrompt,

    // Actions
    loadPrompts,
    loadPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt,
    loadCampaignTemplates,
    loadCampaignTemplateById,
    executePrompt,
    loadPromptExecutions,
    loadPromptExecutionById,
    executePipeline,

    // Utilities
    getPromptByStep,
    getExecutionsForPrompt,
    getTemplateByCategory,
    clearCurrentExecution,
    clearCurrentPipeline,
    clearError,

    // Campaign Planning
    createCampaignFromTemplate,
    continueFromStep
  }
})