/**
 * API модуль для работы с базой знаний (Knowledge Base)
 */

import channelKpisMock from '../mocks/channelKpis.mock.json'
import historicalDataMock from '../mocks/historicalData.mock.json'
import marketingDocumentsMock from '../mocks/marketingDocuments.mock.json'
import bestPracticesMock from '../mocks/bestPractices.mock.json'
import corporateDocumentsMock from '../mocks/corporateDocuments.mock.json'

// Симуляция задержки сети
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Ключевые показатели эффективности каналов
export const getChannelKpis = async (filters = {}) => {
  await delay(300)

  let result = [...channelKpisMock]

  // Фильтрация по каналу
  if (filters.channel) {
    result = result.filter(kpi => kpi.channel === filters.channel)
  }

  // Фильтрация по формату
  if (filters.format) {
    result = result.filter(kpi => kpi.format === filters.format)
  }

  // Фильтрация по сегменту ЦА
  if (filters.segment) {
    result = result.filter(kpi =>
      kpi.target_segment.toLowerCase().includes(filters.segment.toLowerCase())
    )
  }

  // Фильтрация по периоду
  if (filters.period) {
    result = result.filter(kpi => kpi.period === filters.period)
  }

  // Фильтрация по типу KPI
  if (filters.kpi_type) {
    result = result.filter(kpi => kpi.kpi_type === filters.kpi_type)
  }

  return {
    data: result,
    total: result.length
  }
}

export const getChannelKpiById = async (id) => {
  await delay(200)
  const kpi = channelKpisMock.find(k => k.kpi_id === id)
  if (!kpi) {
    throw new Error('KPI не найден')
  }
  return kpi
}

export const createChannelKpi = async (kpiData) => {
  await delay(400)

  const newKpi = {
    kpi_id: `kpi_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...kpiData
  }

  channelKpisMock.push(newKpi)
  return newKpi
}

export const updateChannelKpi = async (id, updates) => {
  await delay(300)

  const index = channelKpisMock.findIndex(k => k.kpi_id === id)
  if (index === -1) {
    throw new Error('KPI не найден')
  }

  channelKpisMock[index] = {
    ...channelKpisMock[index],
    ...updates,
    updated_at: new Date().toISOString()
  }

  return channelKpisMock[index]
}

export const deleteChannelKpi = async (id) => {
  await delay(200)

  const index = channelKpisMock.findIndex(k => k.kpi_id === id)
  if (index === -1) {
    throw new Error('KPI не найден')
  }

  channelKpisMock.splice(index, 1)
  return { success: true }
}

// Исторические данные
export const getHistoricalData = async (filters = {}) => {
  await delay(400)

  let result = [...historicalDataMock]

  // Фильтрация по каналу
  if (filters.channel) {
    result = result.filter(data => data.channel === filters.channel)
  }

  // Фильтрация по периоду
  if (filters.period_from && filters.period_to) {
    result = result.filter(data => {
      const dataPeriod = new Date(data.period)
      return dataPeriod >= new Date(filters.period_from) &&
             dataPeriod <= new Date(filters.period_to)
    })
  }

  // Фильтрация по типу кампании
  if (filters.campaign_type) {
    result = result.filter(data => data.campaign_type === filters.campaign_type)
  }

  return {
    data: result,
    total: result.length
  }
}

export const getHistoricalDataById = async (id) => {
  await delay(200)
  const data = historicalDataMock.find(h => h.historical_id === id)
  if (!data) {
    throw new Error('Исторические данные не найдены')
  }
  return data
}

export const createHistoricalData = async (historicalData) => {
  await delay(500)

  const newData = {
    historical_id: `hist_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...historicalData
  }

  historicalDataMock.push(newData)
  return newData
}

export const updateHistoricalData = async (id, updates) => {
  await delay(300)

  const index = historicalDataMock.findIndex(h => h.historical_id === id)
  if (index === -1) {
    throw new Error('Исторические данные не найдены')
  }

  historicalDataMock[index] = {
    ...historicalDataMock[index],
    ...updates,
    updated_at: new Date().toISOString()
  }

  return historicalDataMock[index]
}

export const deleteHistoricalData = async (id) => {
  await delay(200)

  const index = historicalDataMock.findIndex(h => h.historical_id === id)
  if (index === -1) {
    throw new Error('Исторические данные не найдены')
  }

  historicalDataMock.splice(index, 1)
  return { success: true }
}

// Маркетинговые документы
export const getMarketingDocuments = async (filters = {}) => {
  await delay(300)

  let result = [...marketingDocumentsMock]

  // Фильтрация по типу документа
  if (filters.document_type) {
    result = result.filter(doc => doc.document_type === filters.document_type)
  }

  // Фильтрация по категории
  if (filters.category) {
    result = result.filter(doc => doc.category === filters.category)
  }

  // Поиск по названию и содержимому
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(doc =>
      doc.title.toLowerCase().includes(searchLower) ||
      doc.description.toLowerCase().includes(searchLower) ||
      doc.content.toLowerCase().includes(searchLower)
    )
  }

  // Фильтрация по тегам
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(doc =>
      filters.tags.some(tag => doc.tags.includes(tag))
    )
  }

  return {
    data: result,
    total: result.length
  }
}

export const getMarketingDocumentById = async (id) => {
  await delay(200)
  const document = marketingDocumentsMock.find(d => d.document_id === id)
  if (!document) {
    throw new Error('Документ не найден')
  }
  return document
}

export const createMarketingDocument = async (documentData) => {
  await delay(600)

  const newDocument = {
    document_id: `doc_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: '1.0',
    status: 'active',
    usage_count: 0,
    ...documentData
  }

  marketingDocumentsMock.push(newDocument)
  return newDocument
}

export const updateMarketingDocument = async (id, updates) => {
  await delay(400)

  const index = marketingDocumentsMock.findIndex(d => d.document_id === id)
  if (index === -1) {
    throw new Error('Документ не найден')
  }

  marketingDocumentsMock[index] = {
    ...marketingDocumentsMock[index],
    ...updates,
    updated_at: new Date().toISOString()
  }

  return marketingDocumentsMock[index]
}

export const deleteMarketingDocument = async (id) => {
  await delay(200)

  const index = marketingDocumentsMock.findIndex(d => d.document_id === id)
  if (index === -1) {
    throw new Error('Документ не найден')
  }

  marketingDocumentsMock.splice(index, 1)
  return { success: true }
}

// Лучшие практики
export const getBestPractices = async (filters = {}) => {
  await delay(300)

  let result = [...bestPracticesMock]

  // Фильтрация по категории
  if (filters.category) {
    result = result.filter(practice => practice.category === filters.category)
  }

  // Фильтрация по типу кампании
  if (filters.campaign_type) {
    result = result.filter(practice => practice.campaign_type === filters.campaign_type)
  }

  // Фильтрация по каналу
  if (filters.channel) {
    result = result.filter(practice =>
      practice.applicable_channels.includes(filters.channel)
    )
  }

  return {
    data: result,
    total: result.length
  }
}

export const getBestPracticeById = async (id) => {
  await delay(200)
  const practice = bestPracticesMock.find(p => p.practice_id === id)
  if (!practice) {
    throw new Error('Практика не найдена')
  }
  return practice
}

// Аналитика и статистика
export const getKnowledgeBaseStats = async () => {
  await delay(500)

  return {
    total_documents: marketingDocumentsMock.length,
    total_kpis: channelKpisMock.length,
    total_historical_records: historicalDataMock.length,
    total_best_practices: bestPracticesMock.length,
    by_category: {
      campaign_strategy: marketingDocumentsMock.filter(d => d.category === 'campaign_strategy').length,
      channel_analysis: marketingDocumentsMock.filter(d => d.category === 'channel_analysis').length,
      audience_research: marketingDocumentsMock.filter(d => d.category === 'audience_research').length,
      competitive_analysis: marketingDocumentsMock.filter(d => d.category === 'competitive_analysis').length
    },
    by_channel: {
      google: channelKpisMock.filter(k => k.channel === 'google').length,
      facebook: channelKpisMock.filter(k => k.channel === 'facebook').length,
      instagram: channelKpisMock.filter(k => k.channel === 'instagram').length,
      youtube: channelKpisMock.filter(k => k.channel === 'youtube').length,
      telegram: channelKpisMock.filter(k => k.channel === 'telegram').length
    },
    recent_activity: {
      last_updated: new Date().toISOString(),
      new_documents_this_month: 5,
      updated_kpis_this_week: 12
    }
  }
}

// Поиск по базе знаний
export const searchKnowledgeBase = async (query, filters = {}) => {
  await delay(400)

  const searchLower = query.toLowerCase()

  // Поиск в документах
  const documents = marketingDocumentsMock.filter(doc =>
    doc.title.toLowerCase().includes(searchLower) ||
    doc.description.toLowerCase().includes(searchLower) ||
    doc.content.toLowerCase().includes(searchLower) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
  )

  // Поиск в KPI
  const kpis = channelKpisMock.filter(kpi =>
    kpi.channel.toLowerCase().includes(searchLower) ||
    kpi.format.toLowerCase().includes(searchLower) ||
    kpi.target_segment.toLowerCase().includes(searchLower)
  )

  // Поиск в лучших практиках
  const practices = bestPracticesMock.filter(practice =>
    practice.title.toLowerCase().includes(searchLower) ||
    practice.description.toLowerCase().includes(searchLower) ||
    practice.content.toLowerCase().includes(searchLower)
  )

  return {
    query,
    results: {
      documents: documents.slice(0, 10),
      kpis: kpis.slice(0, 10),
      best_practices: practices.slice(0, 10)
    },
    total_results: documents.length + kpis.length + practices.length
  }
}

// Рекомендации на основе контекста
export const getRecommendations = async (context) => {
  await delay(600)

  const { campaign_objective, target_audience, budget_range, channels } = context

  // Фильтруем KPI по контексту
  let relevantKpis = channelKpisMock

  if (channels && channels.length > 0) {
    relevantKpis = relevantKpis.filter(kpi => channels.includes(kpi.channel))
  }

  // Фильтруем лучшие практики
  let relevantPractices = bestPracticesMock

  if (campaign_objective) {
    relevantPractices = relevantPractices.filter(practice =>
      practice.campaign_type === campaign_objective ||
      practice.applicable_objectives.includes(campaign_objective)
    )
  }

  if (channels && channels.length > 0) {
    relevantPractices = relevantPractices.filter(practice =>
      practice.applicable_channels.some(channel => channels.includes(channel))
    )
  }

  return {
    context,
    recommendations: {
      suggested_kpis: relevantKpis.slice(0, 5),
      best_practices: relevantPractices.slice(0, 3),
      historical_benchmarks: historicalDataMock
        .filter(data => channels ? channels.includes(data.channel) : true)
        .slice(0, 5)
    }
  }
}