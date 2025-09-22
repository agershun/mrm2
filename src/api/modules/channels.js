import channelCategoriesMock from '../mocks/channelCategories.mock.json'
import trafficSourcesMock from '../mocks/trafficSources.mock.json'
import detailedTrafficSourcesMock from '../mocks/detailedTrafficSources.mock.json'

// Симуляция задержки API
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * API для работы с каналами трафика
 * Включает категории каналов, источники трафика и детальные источники
 */

// === КАТЕГОРИИ КАНАЛОВ ===

/**
 * Получить все категории каналов
 * @returns {Promise<Array>} Список категорий каналов
 */
export async function getChannelCategories() {
  await delay()
  return channelCategoriesMock
}

/**
 * Получить категорию канала по ID
 * @param {string} categoryId - ID категории
 * @returns {Promise<Object|null>} Категория канала
 */
export async function getChannelCategory(categoryId) {
  await delay()
  return channelCategoriesMock.find(category => category.category_id === categoryId) || null
}

/**
 * Создать новую категорию канала
 * @param {Object} categoryData - Данные категории
 * @returns {Promise<Object>} Созданная категория
 */
export async function createChannelCategory(categoryData) {
  await delay()
  const newCategory = {
    category_id: `category_${Date.now()}`,
    ...categoryData,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  channelCategoriesMock.push(newCategory)
  return newCategory
}

/**
 * Обновить категорию канала
 * @param {string} categoryId - ID категории
 * @param {Object} updateData - Данные для обновления
 * @returns {Promise<Object|null>} Обновленная категория
 */
export async function updateChannelCategory(categoryId, updateData) {
  await delay()
  const index = channelCategoriesMock.findIndex(category => category.category_id === categoryId)
  if (index === -1) return null

  channelCategoriesMock[index] = {
    ...channelCategoriesMock[index],
    ...updateData,
    updated_at: new Date().toISOString()
  }
  return channelCategoriesMock[index]
}

/**
 * Удалить категорию канала
 * @param {string} categoryId - ID категории
 * @returns {Promise<boolean>} Результат удаления
 */
export async function deleteChannelCategory(categoryId) {
  await delay()
  const index = channelCategoriesMock.findIndex(category => category.category_id === categoryId)
  if (index === -1) return false

  channelCategoriesMock.splice(index, 1)
  return true
}

// === ИСТОЧНИКИ ТРАФИКА ===

/**
 * Получить все источники трафика
 * @param {Object} filters - Фильтры (category_id, is_active)
 * @returns {Promise<Array>} Список источников трафика
 */
export async function getTrafficSources(filters = {}) {
  await delay()
  let sources = [...trafficSourcesMock]

  if (filters.category_id) {
    sources = sources.filter(source => source.category_id === filters.category_id)
  }

  if (filters.is_active !== undefined) {
    sources = sources.filter(source => source.is_active === filters.is_active)
  }

  return sources
}

/**
 * Получить источник трафика по ID
 * @param {string} sourceId - ID источника
 * @returns {Promise<Object|null>} Источник трафика
 */
export async function getTrafficSource(sourceId) {
  await delay()
  return trafficSourcesMock.find(source => source.source_id === sourceId) || null
}

/**
 * Создать новый источник трафика
 * @param {Object} sourceData - Данные источника
 * @returns {Promise<Object>} Созданный источник
 */
export async function createTrafficSource(sourceData) {
  await delay()
  const newSource = {
    source_id: `source_${Date.now()}`,
    ...sourceData,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  trafficSourcesMock.push(newSource)
  return newSource
}

/**
 * Обновить источник трафика
 * @param {string} sourceId - ID источника
 * @param {Object} updateData - Данные для обновления
 * @returns {Promise<Object|null>} Обновленный источник
 */
export async function updateTrafficSource(sourceId, updateData) {
  await delay()
  const index = trafficSourcesMock.findIndex(source => source.source_id === sourceId)
  if (index === -1) return null

  trafficSourcesMock[index] = {
    ...trafficSourcesMock[index],
    ...updateData,
    updated_at: new Date().toISOString()
  }
  return trafficSourcesMock[index]
}

/**
 * Удалить источник трафика
 * @param {string} sourceId - ID источника
 * @returns {Promise<boolean>} Результат удаления
 */
export async function deleteTrafficSource(sourceId) {
  await delay()
  const index = trafficSourcesMock.findIndex(source => source.source_id === sourceId)
  if (index === -1) return false

  trafficSourcesMock.splice(index, 1)
  return true
}

// === ДЕТАЛЬНЫЕ ИСТОЧНИКИ ТРАФИКА ===

/**
 * Получить все детальные источники трафика
 * @param {Object} filters - Фильтры (source_id, utm_source, utm_medium, is_active)
 * @returns {Promise<Array>} Список детальных источников
 */
export async function getDetailedTrafficSources(filters = {}) {
  await delay()
  let sources = [...detailedTrafficSourcesMock]

  if (filters.source_id) {
    sources = sources.filter(source => source.source_id === filters.source_id)
  }

  if (filters.utm_source) {
    sources = sources.filter(source => source.utm_source === filters.utm_source)
  }

  if (filters.utm_medium) {
    sources = sources.filter(source => source.utm_medium === filters.utm_medium)
  }

  if (filters.is_active !== undefined) {
    sources = sources.filter(source => source.is_active === filters.is_active)
  }

  return sources
}

/**
 * Получить детальный источник трафика по ID
 * @param {string} detailedSourceId - ID детального источника
 * @returns {Promise<Object|null>} Детальный источник трафика
 */
export async function getDetailedTrafficSource(detailedSourceId) {
  await delay()
  return detailedTrafficSourcesMock.find(source => source.detailed_source_id === detailedSourceId) || null
}

/**
 * Создать новый детальный источник трафика
 * @param {Object} sourceData - Данные детального источника
 * @returns {Promise<Object>} Созданный детальный источник
 */
export async function createDetailedTrafficSource(sourceData) {
  await delay()
  const newSource = {
    detailed_source_id: `detailed_source_${Date.now()}`,
    ...sourceData,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  detailedTrafficSourcesMock.push(newSource)
  return newSource
}

/**
 * Обновить детальный источник трафика
 * @param {string} detailedSourceId - ID детального источника
 * @param {Object} updateData - Данные для обновления
 * @returns {Promise<Object|null>} Обновленный детальный источник
 */
export async function updateDetailedTrafficSource(detailedSourceId, updateData) {
  await delay()
  const index = detailedTrafficSourcesMock.findIndex(source => source.detailed_source_id === detailedSourceId)
  if (index === -1) return null

  detailedTrafficSourcesMock[index] = {
    ...detailedTrafficSourcesMock[index],
    ...updateData,
    updated_at: new Date().toISOString()
  }
  return detailedTrafficSourcesMock[index]
}

/**
 * Удалить детальный источник трафика
 * @param {string} detailedSourceId - ID детального источника
 * @returns {Promise<boolean>} Результат удаления
 */
export async function deleteDetailedTrafficSource(detailedSourceId) {
  await delay()
  const index = detailedTrafficSourcesMock.findIndex(source => source.detailed_source_id === detailedSourceId)
  if (index === -1) return false

  detailedTrafficSourcesMock.splice(index, 1)
  return true
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

/**
 * Получить полную иерархию каналов (категория -> источник -> детальный источник)
 * @returns {Promise<Array>} Иерархическая структура каналов
 */
export async function getChannelsHierarchy() {
  await delay()

  const categories = await getChannelCategories()
  const sources = await getTrafficSources()
  const detailedSources = await getDetailedTrafficSources()

  return categories.map(category => ({
    ...category,
    sources: sources
      .filter(source => source.category_id === category.category_id)
      .map(source => ({
        ...source,
        detailed_sources: detailedSources.filter(detailed => detailed.source_id === source.source_id)
      }))
  }))
}

/**
 * Поиск каналов по названию
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Object>} Результаты поиска по всем уровням
 */
export async function searchChannels(query) {
  await delay()

  const lowerQuery = query.toLowerCase()

  const categories = channelCategoriesMock.filter(category =>
    category.name.toLowerCase().includes(lowerQuery) ||
    category.description.toLowerCase().includes(lowerQuery)
  )

  const sources = trafficSourcesMock.filter(source =>
    source.name.toLowerCase().includes(lowerQuery) ||
    source.description.toLowerCase().includes(lowerQuery)
  )

  const detailedSources = detailedTrafficSourcesMock.filter(source =>
    source.name.toLowerCase().includes(lowerQuery) ||
    source.description.toLowerCase().includes(lowerQuery) ||
    source.utm_source.toLowerCase().includes(lowerQuery) ||
    source.utm_medium.toLowerCase().includes(lowerQuery)
  )

  return {
    categories,
    sources,
    detailed_sources: detailedSources
  }
}

/**
 * Получить статистику по каналам
 * @returns {Promise<Object>} Статистика использования каналов
 */
export async function getChannelsStats() {
  await delay()

  return {
    total_categories: channelCategoriesMock.length,
    active_categories: channelCategoriesMock.filter(c => c.is_active).length,
    total_sources: trafficSourcesMock.length,
    active_sources: trafficSourcesMock.filter(s => s.is_active).length,
    total_detailed_sources: detailedTrafficSourcesMock.length,
    active_detailed_sources: detailedTrafficSourcesMock.filter(s => s.is_active).length,
    categories_distribution: channelCategoriesMock.reduce((acc, category) => {
      const sourcesCount = trafficSourcesMock.filter(s => s.category_id === category.category_id).length
      acc[category.name] = sourcesCount
      return acc
    }, {})
  }
}