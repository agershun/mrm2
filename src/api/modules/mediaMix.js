/**
 * API для работы с медиа-миксом
 */

import mediaMixMock from '../mocks/mediaMix.mock.json'
import mediaMixTemplatesMock from '../mocks/mediaMixTemplates.mock.json'
import channelPerformanceMock from '../mocks/channelPerformance.mock.json'
import optimizationResultsMock from '../mocks/optimizationResults.mock.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getMediaMixes = async (filters = {}) => {
  await delay(500)
  let result = [...mediaMixMock]

  if (filters.campaign_id) {
    result = result.filter(mix => mix.campaign_id === filters.campaign_id)
  }

  if (filters.status) {
    result = result.filter(mix => mix.status === filters.status)
  }

  if (filters.channel) {
    result = result.filter(mix =>
      mix.channels.some(ch => ch.channel_name === filters.channel)
    )
  }

  return {
    data: result,
    total: result.length,
    success: true
  }
}

export const getMediaMixById = async (id) => {
  await delay(300)
  const mix = mediaMixMock.find(m => m.mix_id === id)

  if (!mix) {
    throw new Error(`Медиа-микс с ID ${id} не найден`)
  }

  return mix
}

export const createMediaMix = async (mixData) => {
  await delay(600)

  const newMix = {
    mix_id: `mix_${Date.now()}`,
    ...mixData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return newMix
}

export const updateMediaMix = async (id, updates) => {
  await delay(500)

  const existingMix = mediaMixMock.find(m => m.mix_id === id)
  if (!existingMix) {
    throw new Error(`Медиа-микс с ID ${id} не найден`)
  }

  const updatedMix = {
    ...existingMix,
    ...updates,
    updated_at: new Date().toISOString()
  }

  return updatedMix
}

export const deleteMediaMix = async (id) => {
  await delay(400)

  const existingMix = mediaMixMock.find(m => m.mix_id === id)
  if (!existingMix) {
    throw new Error(`Медиа-микс с ID ${id} не найден`)
  }

  return { success: true, message: 'Медиа-микс успешно удален' }
}

export const getMediaMixTemplates = async (filters = {}) => {
  await delay(400)
  let result = [...mediaMixTemplatesMock]

  if (filters.industry) {
    result = result.filter(template => template.industry === filters.industry)
  }

  if (filters.campaign_type) {
    result = result.filter(template => template.campaign_type === filters.campaign_type)
  }

  return {
    data: result,
    total: result.length,
    success: true
  }
}

export const optimizeMediaMix = async (mixId, optimizationParams) => {
  await delay(2000) // Имитация длительной оптимизации

  const optimizationResult = {
    optimization_id: `opt_${Date.now()}`,
    mix_id: mixId,
    optimization_type: optimizationParams.optimization_type || 'roi',
    constraints: optimizationParams.constraints || {},
    results: optimizationResultsMock[0].recommendations,
    performance_uplift: {
      roi_improvement: 15.3,
      reach_improvement: 8.7,
      frequency_optimization: 12.1
    },
    status: 'completed',
    created_at: new Date().toISOString()
  }

  return optimizationResult
}

export const getChannelPerformance = async (filters = {}) => {
  await delay(500)
  let result = [...channelPerformanceMock]

  if (filters.channel) {
    result = result.filter(perf => perf.channel === filters.channel)
  }

  if (filters.period) {
    result = result.filter(perf => perf.period === filters.period)
  }

  return {
    data: result,
    total: result.length,
    success: true
  }
}

export const calculateMediaMixROI = async (mixData) => {
  await delay(800)

  let totalBudget = 0
  let totalRevenue = 0
  let totalImpressions = 0
  let totalConversions = 0

  mixData.channels.forEach(channel => {
    totalBudget += channel.budget_allocation
    totalRevenue += channel.expected_revenue || 0
    totalImpressions += channel.expected_impressions || 0
    totalConversions += channel.expected_conversions || 0
  })

  const roi = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0
  const cpm = totalImpressions > 0 ? (totalBudget / totalImpressions) * 1000 : 0
  const cpa = totalConversions > 0 ? totalBudget / totalConversions : 0

  return {
    total_budget: totalBudget,
    total_revenue: totalRevenue,
    roi: roi,
    total_impressions: totalImpressions,
    total_conversions: totalConversions,
    cpm: cpm,
    cpa: cpa,
    calculation_date: new Date().toISOString()
  }
}

export const compareMediaMixes = async (mixIds) => {
  await delay(600)

  const mixes = mixIds.map(id =>
    mediaMixMock.find(m => m.mix_id === id)
  ).filter(Boolean)

  if (mixes.length === 0) {
    throw new Error('Медиа-миксы для сравнения не найдены')
  }

  const comparison = {
    mixes: mixes,
    comparison_metrics: {
      budget_efficiency: mixes.map(mix => ({
        mix_id: mix.mix_id,
        score: Math.random() * 40 + 60 // 60-100
      })),
      channel_diversity: mixes.map(mix => ({
        mix_id: mix.mix_id,
        score: mix.channels.length * 20
      })),
      risk_level: mixes.map(mix => ({
        mix_id: mix.mix_id,
        score: Math.random() * 30 + 20 // 20-50
      }))
    },
    recommendations: [
      'Рекомендуется увеличить долю digital каналов для лучшей атрибуции',
      'Рассмотрите возможность тестирования новых каналов',
      'Оптимизируйте частоту показов для повышения эффективности'
    ],
    created_at: new Date().toISOString()
  }

  return comparison
}