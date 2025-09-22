/**
 * API модуль для работы с промптами LLM для планирования кампаний
 */

import promptsMock from '../mocks/prompts.mock.json'
import campaignTemplatesMock from '../mocks/campaignTemplates.mock.json'
import promptExecutionsMock from '../mocks/promptExecutions.mock.json'

// Симуляция задержки сети
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Промпты для планирования кампаний
export const getPrompts = async (filters = {}) => {
  await delay(300)

  let result = [...promptsMock]

  // Фильтрация по категории
  if (filters.category) {
    result = result.filter(prompt => prompt.category === filters.category)
  }

  // Фильтрация по типу
  if (filters.type) {
    result = result.filter(prompt => prompt.type === filters.type)
  }

  // Поиск по названию
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(prompt =>
      prompt.name.toLowerCase().includes(searchLower) ||
      prompt.description.toLowerCase().includes(searchLower)
    )
  }

  return {
    data: result,
    total: result.length
  }
}

export const getPromptById = async (id) => {
  await delay(200)
  const prompt = promptsMock.find(p => p.prompt_id === id)
  if (!prompt) {
    throw new Error('Промпт не найден')
  }
  return prompt
}

export const createPrompt = async (promptData) => {
  await delay(500)

  const newPrompt = {
    prompt_id: `prompt_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: '1.0',
    is_active: true,
    ...promptData
  }

  promptsMock.push(newPrompt)
  return newPrompt
}

export const updatePrompt = async (id, updates) => {
  await delay(400)

  const index = promptsMock.findIndex(p => p.prompt_id === id)
  if (index === -1) {
    throw new Error('Промпт не найден')
  }

  promptsMock[index] = {
    ...promptsMock[index],
    ...updates,
    updated_at: new Date().toISOString()
  }

  return promptsMock[index]
}

export const deletePrompt = async (id) => {
  await delay(300)

  const index = promptsMock.findIndex(p => p.prompt_id === id)
  if (index === -1) {
    throw new Error('Промпт не найден')
  }

  promptsMock.splice(index, 1)
  return { success: true }
}

// Шаблоны кампаний
export const getCampaignTemplates = async (filters = {}) => {
  await delay(300)

  let result = [...campaignTemplatesMock]

  if (filters.category) {
    result = result.filter(template => template.category === filters.category)
  }

  return {
    data: result,
    total: result.length
  }
}

export const getCampaignTemplateById = async (id) => {
  await delay(200)
  const template = campaignTemplatesMock.find(t => t.template_id === id)
  if (!template) {
    throw new Error('Шаблон не найден')
  }
  return template
}

// Выполнение промптов
export const executePrompt = async (promptId, inputData, parameters = {}) => {
  await delay(2000) // Симуляция времени выполнения LLM

  const execution = {
    execution_id: `exec_${Date.now()}`,
    prompt_id: promptId,
    input_data: inputData,
    parameters: parameters,
    status: 'completed',
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    output_data: generateMockOutput(promptId, inputData),
    tokens_used: Math.floor(Math.random() * 1000) + 500,
    execution_time: Math.floor(Math.random() * 10000) + 1000
  }

  promptExecutionsMock.push(execution)
  return execution
}

export const getPromptExecutions = async (filters = {}) => {
  await delay(300)

  let result = [...promptExecutionsMock]

  if (filters.prompt_id) {
    result = result.filter(exec => exec.prompt_id === filters.prompt_id)
  }

  if (filters.status) {
    result = result.filter(exec => exec.status === filters.status)
  }

  // Сортировка по дате (новые первыми)
  result.sort((a, b) => new Date(b.started_at) - new Date(a.started_at))

  return {
    data: result,
    total: result.length
  }
}

export const getPromptExecutionById = async (id) => {
  await delay(200)
  const execution = promptExecutionsMock.find(e => e.execution_id === id)
  if (!execution) {
    throw new Error('Выполнение не найдено')
  }
  return execution
}

// Пайплайн выполнения последовательности промптов
export const executePipeline = async (pipelineConfig) => {
  await delay(500)

  const pipelineId = `pipeline_${Date.now()}`
  const results = []

  for (const step of pipelineConfig.steps) {
    const execution = await executePrompt(
      step.prompt_id,
      step.input_data,
      step.parameters
    )
    results.push(execution)
  }

  return {
    pipeline_id: pipelineId,
    status: 'completed',
    steps: results,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  }
}

// Генерация mock-данных для выходных данных промптов
function generateMockOutput(promptId, inputData) {
  const prompt = promptsMock.find(p => p.prompt_id === promptId)
  if (!prompt) return {}

  switch (prompt.step) {
    case 1: // Создание карточки кампании
      return {
        campaign_card: {
          name: 'Кампания продвижения нового продукта',
          goal: 'Генерация лидов',
          type: 'Тактическая',
          description: 'Комплексная кампания для запуска нового продукта',
          target_audience: 'Мужчины и женщины 25-45 лет, Москва и МО',
          channels: ['Instagram', 'YouTube', 'Telegram'],
          geography: 'Москва, Московская область',
          period: '01.09.2025 - 30.09.2025',
          budget: '1000000',
          key_kpis: ['CPM < 300', 'CTR > 2%', 'CPA < 500'],
          confidence_level: 'высокий'
        }
      }

    case 2: // Параметры кампании
      return {
        parameters: [
          { parameter: 'Целевая аудитория', value: 'Мужчины и женщины 25-45 лет', source: 'документ', confidence: 'высокий' },
          { parameter: 'География', value: 'Москва, МО', source: 'ввод', confidence: 'высокий' },
          { parameter: 'Каналы', value: 'Instagram, YouTube, Telegram', source: 'предполагается', confidence: 'средний' },
          { parameter: 'Бюджет', value: '1000000 руб', source: 'ввод', confidence: 'высокий' }
        ]
      }

    case 4: // Медиа-микс
      return {
        media_mix: [
          { channel: 'Instagram', segment: 'Женщины 25-35', format: 'Сторис', budget: 400000, reach: 350000, cpm: 285 },
          { channel: 'YouTube', segment: 'Мужчины 25-45', format: 'Видео', budget: 400000, reach: 300000, cpm: 300 },
          { channel: 'Telegram', segment: 'Все 25-45', format: 'Посты', budget: 200000, reach: 150000, cpm: 280 }
        ]
      }

    default:
      return { message: 'Промпт выполнен успешно', data: inputData }
  }
}