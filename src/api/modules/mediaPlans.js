/**
 * API для работы с медиа-планами
 */

import mediaPlansMock from '../mocks/mediaPlans.mock.json'
import mediaPlanTemplatesMock from '../mocks/mediaPlanTemplates.mock.json'
import flightSchedulesMock from '../mocks/flightSchedules.mock.json'
import planExecutionMock from '../mocks/planExecution.mock.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getMediaPlans = async (filters = {}) => {
  await delay(500)
  let result = [...mediaPlansMock]

  if (filters.campaign_id) {
    result = result.filter(plan => plan.campaign_id === filters.campaign_id)
  }

  if (filters.status) {
    result = result.filter(plan => plan.status === filters.status)
  }

  if (filters.period) {
    result = result.filter(plan =>
      plan.plan_period.start_date <= filters.period.end_date &&
      plan.plan_period.end_date >= filters.period.start_date
    )
  }

  if (filters.channel) {
    result = result.filter(plan =>
      plan.flights.some(flight => flight.channel === filters.channel)
    )
  }

  return {
    data: result,
    total: result.length,
    success: true
  }
}

export const getMediaPlanById = async (id) => {
  await delay(300)
  const plan = mediaPlansMock.find(p => p.plan_id === id)

  if (!plan) {
    throw new Error(`Медиа-план с ID ${id} не найден`)
  }

  return plan
}

export const createMediaPlan = async (planData) => {
  await delay(600)

  const newPlan = {
    plan_id: `plan_${Date.now()}`,
    ...planData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return newPlan
}

export const updateMediaPlan = async (id, updates) => {
  await delay(500)

  const existingPlan = mediaPlansMock.find(p => p.plan_id === id)
  if (!existingPlan) {
    throw new Error(`Медиа-план с ID ${id} не найден`)
  }

  const updatedPlan = {
    ...existingPlan,
    ...updates,
    updated_at: new Date().toISOString()
  }

  return updatedPlan
}

export const deleteMediaPlan = async (id) => {
  await delay(400)

  const existingPlan = mediaPlansMock.find(p => p.plan_id === id)
  if (!existingPlan) {
    throw new Error(`Медиа-план с ID ${id} не найден`)
  }

  return { success: true, message: 'Медиа-план успешно удален' }
}

export const getMediaPlanTemplates = async (filters = {}) => {
  await delay(400)
  let result = [...mediaPlanTemplatesMock]

  if (filters.industry) {
    result = result.filter(template => template.industry === filters.industry)
  }

  if (filters.plan_type) {
    result = result.filter(template => template.plan_type === filters.plan_type)
  }

  if (filters.duration_weeks) {
    result = result.filter(template =>
      template.recommended_duration.min <= filters.duration_weeks &&
      template.recommended_duration.max >= filters.duration_weeks
    )
  }

  return {
    data: result,
    total: result.length,
    success: true
  }
}

export const generateMediaPlan = async (mixId, planParams) => {
  await delay(1500) // Имитация генерации плана

  const generatedPlan = {
    plan_id: `plan_generated_${Date.now()}`,
    mix_id: mixId,
    plan_name: `Автоматически сгенерированный план ${new Date().toLocaleDateString()}`,
    plan_description: 'План сгенерирован на основе медиа-микса с учетом указанных параметров',
    plan_period: planParams.period,
    total_budget: planParams.total_budget,
    flights: generateFlights(planParams),
    kpis: planParams.target_kpis || {},
    status: 'draft',
    generated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return generatedPlan
}

export const getFlightSchedules = async (planId) => {
  await delay(400)

  const schedules = flightSchedulesMock.filter(schedule =>
    schedule.plan_id === planId
  )

  return {
    data: schedules,
    total: schedules.length,
    success: true
  }
}

export const updateFlightSchedule = async (flightId, scheduleData) => {
  await delay(500)

  const updatedSchedule = {
    flight_id: flightId,
    ...scheduleData,
    updated_at: new Date().toISOString()
  }

  return updatedSchedule
}

export const executePlan = async (planId, executionParams) => {
  await delay(1000)

  const execution = {
    execution_id: `exec_${Date.now()}`,
    plan_id: planId,
    execution_status: 'in_progress',
    started_at: new Date().toISOString(),
    estimated_completion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    platforms_status: {
      google: 'pending',
      facebook: 'pending',
      instagram: 'pending'
    },
    created_campaigns: [],
    execution_log: [
      {
        timestamp: new Date().toISOString(),
        action: 'execution_started',
        details: 'Начато выполнение медиа-плана'
      }
    ]
  }

  return execution
}

export const getPlanExecution = async (planId) => {
  await delay(300)

  const execution = planExecutionMock.find(exec => exec.plan_id === planId)
  return execution || null
}

export const validatePlan = async (planData) => {
  await delay(800)

  const validationResults = {
    is_valid: true,
    warnings: [],
    errors: [],
    recommendations: []
  }

  // Проверка бюджета
  const totalFlightsBudget = planData.flights.reduce((sum, flight) => sum + flight.budget, 0)
  if (totalFlightsBudget > planData.total_budget) {
    validationResults.errors.push({
      type: 'budget_overflow',
      message: `Сумма бюджетов флайтов (${totalFlightsBudget}) превышает общий бюджет (${planData.total_budget})`
    })
    validationResults.is_valid = false
  }

  // Проверка перекрытий по времени
  const channelOverlaps = checkChannelOverlaps(planData.flights)
  if (channelOverlaps.length > 0) {
    validationResults.warnings.push({
      type: 'time_overlap',
      message: 'Найдены перекрытия по времени в одном канале',
      details: channelOverlaps
    })
  }

  // Рекомендации по оптимизации
  if (planData.flights.length > 20) {
    validationResults.recommendations.push({
      type: 'complexity',
      message: 'Рассмотрите возможность упрощения плана - слишком много флайтов'
    })
  }

  return validationResults
}

export const duplicatePlan = async (planId, newParams = {}) => {
  await delay(500)

  const originalPlan = mediaPlansMock.find(p => p.plan_id === planId)
  if (!originalPlan) {
    throw new Error(`Медиа-план с ID ${planId} не найден`)
  }

  const duplicatedPlan = {
    ...originalPlan,
    plan_id: `plan_copy_${Date.now()}`,
    plan_name: `Копия: ${originalPlan.plan_name}`,
    ...newParams,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return duplicatedPlan
}

// Вспомогательные функции
function generateFlights(params) {
  const flights = []
  const channels = params.channels || ['google', 'facebook', 'instagram']

  channels.forEach((channel, index) => {
    const flightBudget = Math.floor(params.total_budget / channels.length)

    flights.push({
      flight_id: `flight_${Date.now()}_${index}`,
      flight_name: `${channel} флайт`,
      channel: channel,
      format: getDefaultFormat(channel),
      start_date: params.period.start_date,
      end_date: params.period.end_date,
      budget: flightBudget,
      daily_budget: Math.floor(flightBudget / getDurationDays(params.period)),
      targeting: getDefaultTargeting(channel),
      frequency_cap: getDefaultFrequencyCap(channel),
      status: 'planned'
    })
  })

  return flights
}

function getDefaultFormat(channel) {
  const formats = {
    google: 'search_ads',
    facebook: 'feed_ads',
    instagram: 'stories',
    youtube: 'video_ads',
    tiktok: 'in_feed_video'
  }
  return formats[channel] || 'display'
}

function getDefaultTargeting(channel) {
  return {
    age_range: '25-45',
    interests: ['technology', 'business'],
    geographic: 'Russia'
  }
}

function getDefaultFrequencyCap(channel) {
  const caps = {
    google: { daily: 3, weekly: 15 },
    facebook: { daily: 2, weekly: 10 },
    instagram: { daily: 4, weekly: 20 },
    youtube: { daily: 1, weekly: 5 }
  }
  return caps[channel] || { daily: 2, weekly: 10 }
}

function getDurationDays(period) {
  const start = new Date(period.start_date)
  const end = new Date(period.end_date)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
}

function checkChannelOverlaps(flights) {
  const overlaps = []
  const channelFlights = {}

  // Группируем флайты по каналам
  flights.forEach(flight => {
    if (!channelFlights[flight.channel]) {
      channelFlights[flight.channel] = []
    }
    channelFlights[flight.channel].push(flight)
  })

  // Проверяем перекрытия в каждом канале
  Object.entries(channelFlights).forEach(([channel, channelFlightsArray]) => {
    for (let i = 0; i < channelFlightsArray.length; i++) {
      for (let j = i + 1; j < channelFlightsArray.length; j++) {
        const flight1 = channelFlightsArray[i]
        const flight2 = channelFlightsArray[j]

        if (isDateOverlap(flight1.start_date, flight1.end_date, flight2.start_date, flight2.end_date)) {
          overlaps.push({
            channel,
            flight1: flight1.flight_name,
            flight2: flight2.flight_name
          })
        }
      }
    }
  })

  return overlaps
}

function isDateOverlap(start1, end1, start2, end2) {
  const s1 = new Date(start1)
  const e1 = new Date(end1)
  const s2 = new Date(start2)
  const e2 = new Date(end2)

  return s1 <= e2 && s2 <= e1
}