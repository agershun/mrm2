import campaignsExtendedMock from '../mocks/campaignsExtended.mock.json'
import adGroupsMock from '../mocks/adGroups.mock.json'
import adCreativesMock from '../mocks/adCreatives.mock.json'

// Симуляция задержки API
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Расширенный API для работы с рекламными кампаниями
 * Поддерживает полную иерархию: Кампания → Группа объявлений → Объявление (креатив)
 * Включает все параметры из campaign_params.md
 */

// === КАМПАНИИ ===

/**
 * Получить все кампании с расширенными параметрами
 * @param {Object} filters - Фильтры (channel, status, objective, campaign_category, phase, etc.)
 * @returns {Promise<Array>} Список кампаний
 */
export async function getCampaignsExtended(filters = {}) {
  await delay()
  let campaigns = [...campaignsExtendedMock]

  // Фильтрация по каналу
  if (filters.channel) {
    campaigns = campaigns.filter(campaign => campaign.channel === filters.channel)
  }

  // Фильтрация по статусу
  if (filters.status) {
    campaigns = campaigns.filter(campaign => campaign.status === filters.status)
  }

  // Фильтрация по цели
  if (filters.objective) {
    campaigns = campaigns.filter(campaign => campaign.objective === filters.objective)
  }

  // Фильтрация по категории
  if (filters.campaign_category) {
    campaigns = campaigns.filter(campaign => campaign.campaign_category === filters.campaign_category)
  }

  // Фильтрация по фазе
  if (filters.phase) {
    campaigns = campaigns.filter(campaign => campaign.phase === filters.phase)
  }

  // Фильтрация по типу кампании
  if (filters.campaign_type) {
    campaigns = campaigns.filter(campaign => campaign.campaign_type === filters.campaign_type)
  }

  // Фильтрация по группе кампаний
  if (filters.campaign_group_id) {
    campaigns = campaigns.filter(campaign => campaign.campaign_group_id === filters.campaign_group_id)
  }

  // Фильтрация по ответственному
  if (filters.responsible_manager) {
    campaigns = campaigns.filter(campaign => campaign.responsible_manager === filters.responsible_manager)
  }

  // Фильтрация по продуктовой линейке
  if (filters.product_line) {
    campaigns = campaigns.filter(campaign => campaign.product_line === filters.product_line)
  }

  // Фильтрация по датам
  if (filters.date_from) {
    campaigns = campaigns.filter(campaign => new Date(campaign.start_date) >= new Date(filters.date_from))
  }

  if (filters.date_to) {
    campaigns = campaigns.filter(campaign => {
      const endDate = campaign.end_date ? new Date(campaign.end_date) : new Date('2099-12-31')
      return endDate <= new Date(filters.date_to)
    })
  }

  return campaigns
}

/**
 * Получить кампанию по ID
 * @param {string} campaignId - ID кампании
 * @returns {Promise<Object|null>} Кампания
 */
export async function getCampaignExtended(campaignId) {
  await delay()
  return campaignsExtendedMock.find(campaign => campaign.campaign_id === campaignId) || null
}

/**
 * Создать новую кампанию
 * @param {Object} campaignData - Данные кампании
 * @returns {Promise<Object>} Созданная кампания
 */
export async function createCampaignExtended(campaignData) {
  await delay()

  const newCampaign = {
    campaign_id: `camp_${Date.now()}`,
    external_ids: {},
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...campaignData
  }

  // Генерация UTM-параметров если не указаны
  if (!newCampaign.utm_params && newCampaign.channel && newCampaign.name) {
    newCampaign.utm_params = generateUtmParams(newCampaign)
  }

  campaignsExtendedMock.push(newCampaign)
  return newCampaign
}

/**
 * Обновить кампанию
 * @param {string} campaignId - ID кампании
 * @param {Object} updateData - Данные для обновления
 * @returns {Promise<Object|null>} Обновленная кампания
 */
export async function updateCampaignExtended(campaignId, updateData) {
  await delay()

  const index = campaignsExtendedMock.findIndex(campaign => campaign.campaign_id === campaignId)
  if (index === -1) return null

  campaignsExtendedMock[index] = {
    ...campaignsExtendedMock[index],
    ...updateData,
    updated_at: new Date().toISOString()
  }

  return campaignsExtendedMock[index]
}

/**
 * Удалить кампанию
 * @param {string} campaignId - ID кампании
 * @returns {Promise<boolean>} Результат удаления
 */
export async function deleteCampaignExtended(campaignId) {
  await delay()

  const index = campaignsExtendedMock.findIndex(campaign => campaign.campaign_id === campaignId)
  if (index === -1) return false

  campaignsExtendedMock.splice(index, 1)
  return true
}

// === ГРУППЫ ОБЪЯВЛЕНИЙ ===

/**
 * Получить группы объявлений
 * @param {Object} filters - Фильтры (campaign_id, status, audience_type, etc.)
 * @returns {Promise<Array>} Список групп объявлений
 */
export async function getAdGroups(filters = {}) {
  await delay()
  let adGroups = [...adGroupsMock]

  if (filters.campaign_id) {
    adGroups = adGroups.filter(group => group.campaign_id === filters.campaign_id)
  }

  if (filters.status) {
    adGroups = adGroups.filter(group => group.status === filters.status)
  }

  if (filters.optimization_goal) {
    adGroups = adGroups.filter(group => group.optimization_goal === filters.optimization_goal)
  }

  return adGroups
}

/**
 * Получить группу объявлений по ID
 * @param {string} adGroupId - ID группы объявлений
 * @returns {Promise<Object|null>} Группа объявлений
 */
export async function getAdGroup(adGroupId) {
  await delay()
  return adGroupsMock.find(group => group.ad_group_id === adGroupId) || null
}

/**
 * Создать новую группу объявлений
 * @param {Object} adGroupData - Данные группы объявлений
 * @returns {Promise<Object>} Созданная группа объявлений
 */
export async function createAdGroup(adGroupData) {
  await delay()

  const newAdGroup = {
    ad_group_id: `adg_${Date.now()}`,
    external_ids: {},
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...adGroupData
  }

  adGroupsMock.push(newAdGroup)
  return newAdGroup
}

/**
 * Обновить группу объявлений
 * @param {string} adGroupId - ID группы объявлений
 * @param {Object} updateData - Данные для обновления
 * @returns {Promise<Object|null>} Обновленная группа объявлений
 */
export async function updateAdGroup(adGroupId, updateData) {
  await delay()

  const index = adGroupsMock.findIndex(group => group.ad_group_id === adGroupId)
  if (index === -1) return null

  adGroupsMock[index] = {
    ...adGroupsMock[index],
    ...updateData,
    updated_at: new Date().toISOString()
  }

  return adGroupsMock[index]
}

/**
 * Удалить группу объявлений
 * @param {string} adGroupId - ID группы объявлений
 * @returns {Promise<boolean>} Результат удаления
 */
export async function deleteAdGroup(adGroupId) {
  await delay()

  const index = adGroupsMock.findIndex(group => group.ad_group_id === adGroupId)
  if (index === -1) return false

  adGroupsMock.splice(index, 1)
  return true
}

// === ОБЪЯВЛЕНИЯ (КРЕАТИВЫ) ===

/**
 * Получить объявления (креативы)
 * @param {Object} filters - Фильтры (campaign_id, ad_group_id, status, creative_type, etc.)
 * @returns {Promise<Array>} Список объявлений
 */
export async function getAdCreatives(filters = {}) {
  await delay()
  let creatives = [...adCreativesMock]

  if (filters.campaign_id) {
    creatives = creatives.filter(creative => creative.campaign_id === filters.campaign_id)
  }

  if (filters.ad_group_id) {
    creatives = creatives.filter(creative => creative.ad_group_id === filters.ad_group_id)
  }

  if (filters.status) {
    creatives = creatives.filter(creative => creative.status === filters.status)
  }

  if (filters.creative_type) {
    creatives = creatives.filter(creative => creative.creative_type === filters.creative_type)
  }

  return creatives
}

/**
 * Получить объявление по ID
 * @param {string} creativeId - ID объявления
 * @returns {Promise<Object|null>} Объявление
 */
export async function getAdCreative(creativeId) {
  await delay()
  return adCreativesMock.find(creative => creative.creative_id === creativeId) || null
}

/**
 * Создать новое объявление
 * @param {Object} creativeData - Данные объявления
 * @returns {Promise<Object>} Созданное объявление
 */
export async function createAdCreative(creativeData) {
  await delay()

  const newCreative = {
    creative_id: `cr_${Date.now()}`,
    external_ids: {},
    status: 'draft',
    performance_metrics: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      conversions: 0,
      cost_per_conversion: 0,
      roas: 0
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...creativeData
  }

  adCreativesMock.push(newCreative)
  return newCreative
}

/**
 * Обновить объявление
 * @param {string} creativeId - ID объявления
 * @param {Object} updateData - Данные для обновления
 * @returns {Promise<Object|null>} Обновленное объявление
 */
export async function updateAdCreative(creativeId, updateData) {
  await delay()

  const index = adCreativesMock.findIndex(creative => creative.creative_id === creativeId)
  if (index === -1) return null

  adCreativesMock[index] = {
    ...adCreativesMock[index],
    ...updateData,
    updated_at: new Date().toISOString()
  }

  return adCreativesMock[index]
}

/**
 * Удалить объявление
 * @param {string} creativeId - ID объявления
 * @returns {Promise<boolean>} Результат удаления
 */
export async function deleteAdCreative(creativeId) {
  await delay()

  const index = adCreativesMock.findIndex(creative => creative.creative_id === creativeId)
  if (index === -1) return false

  adCreativesMock.splice(index, 1)
  return true
}

// === ИЕРАРХИЧЕСКИЕ ФУНКЦИИ ===

/**
 * Получить полную иерархию кампании (кампания → группы → объявления)
 * @param {string} campaignId - ID кампании
 * @returns {Promise<Object|null>} Полная иерархия кампании
 */
export async function getCampaignHierarchy(campaignId) {
  await delay()

  const campaign = await getCampaignExtended(campaignId)
  if (!campaign) return null

  const adGroups = await getAdGroups({ campaign_id: campaignId })

  const campaignWithHierarchy = {
    ...campaign,
    ad_groups: await Promise.all(adGroups.map(async (adGroup) => {
      const creatives = await getAdCreatives({ ad_group_id: adGroup.ad_group_id })
      return {
        ...adGroup,
        creatives
      }
    }))
  }

  return campaignWithHierarchy
}

/**
 * Дублировать кампанию (создать копию с версионностью)
 * @param {string} campaignId - ID исходной кампании
 * @param {Object} options - Опции дублирования
 * @returns {Promise<Object>} Новая кампания
 */
export async function duplicateCampaign(campaignId, options = {}) {
  await delay()

  const originalCampaign = await getCampaignExtended(campaignId)
  if (!originalCampaign) throw new Error('Кампания не найдена')

  const newCampaignData = {
    ...originalCampaign,
    name: options.name || `${originalCampaign.name} - Копия`,
    status: 'draft',
    version: options.version || 'copy',
    campaign_group_id: originalCampaign.campaign_group_id,
    external_ids: {}
  }

  delete newCampaignData.campaign_id
  delete newCampaignData.created_at
  delete newCampaignData.updated_at

  const newCampaign = await createCampaignExtended(newCampaignData)

  // Дублируем группы объявлений если требуется
  if (options.includeAdGroups) {
    const originalAdGroups = await getAdGroups({ campaign_id: campaignId })

    for (const adGroup of originalAdGroups) {
      const newAdGroupData = {
        ...adGroup,
        campaign_id: newCampaign.campaign_id,
        external_ids: {}
      }

      delete newAdGroupData.ad_group_id
      delete newAdGroupData.created_at
      delete newAdGroupData.updated_at

      const newAdGroup = await createAdGroup(newAdGroupData)

      // Дублируем объявления если требуется
      if (options.includeCreatives) {
        const originalCreatives = await getAdCreatives({ ad_group_id: adGroup.ad_group_id })

        for (const creative of originalCreatives) {
          const newCreativeData = {
            ...creative,
            campaign_id: newCampaign.campaign_id,
            ad_group_id: newAdGroup.ad_group_id,
            external_ids: {},
            performance_metrics: {
              impressions: 0,
              clicks: 0,
              ctr: 0,
              cpc: 0,
              conversions: 0,
              cost_per_conversion: 0,
              roas: 0
            }
          }

          delete newCreativeData.creative_id
          delete newCreativeData.created_at
          delete newCreativeData.updated_at

          await createAdCreative(newCreativeData)
        }
      }
    }
  }

  return newCampaign
}

// === АНАЛИТИЧЕСКИЕ ФУНКЦИИ ===

/**
 * Получить сводную статистику по кампаниям
 * @param {Object} filters - Фильтры для анализа
 * @returns {Promise<Object>} Статистика кампаний
 */
export async function getCampaignsStats(filters = {}) {
  await delay()

  const campaigns = await getCampaignsExtended(filters)

  const stats = {
    total_campaigns: campaigns.length,
    by_status: {},
    by_channel: {},
    by_objective: {},
    by_category: {},
    by_phase: {},
    by_type: {},
    budget_summary: {
      total_budget: 0,
      daily_budget: 0,
      lifetime_budget: 0
    },
    performance_summary: {
      total_impressions: 0,
      total_clicks: 0,
      total_conversions: 0,
      avg_ctr: 0,
      avg_cpc: 0,
      avg_roas: 0
    }
  }

  campaigns.forEach(campaign => {
    // Статистика по статусам
    stats.by_status[campaign.status] = (stats.by_status[campaign.status] || 0) + 1

    // Статистика по каналам
    stats.by_channel[campaign.channel] = (stats.by_channel[campaign.channel] || 0) + 1

    // Статистика по целям
    stats.by_objective[campaign.objective] = (stats.by_objective[campaign.objective] || 0) + 1

    // Статистика по категориям
    stats.by_category[campaign.campaign_category] = (stats.by_category[campaign.campaign_category] || 0) + 1

    // Статистика по фазам
    stats.by_phase[campaign.phase] = (stats.by_phase[campaign.phase] || 0) + 1

    // Статистика по типам
    stats.by_type[campaign.campaign_type] = (stats.by_type[campaign.campaign_type] || 0) + 1

    // Бюджеты
    if (campaign.budget_type === 'daily') {
      stats.budget_summary.daily_budget += campaign.budget_value
    } else if (campaign.budget_type === 'lifetime') {
      stats.budget_summary.lifetime_budget += campaign.budget_value
    }
    stats.budget_summary.total_budget += campaign.budget_value
  })

  return stats
}

/**
 * Поиск кампаний по различным критериям
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Array>} Результаты поиска
 */
export async function searchCampaigns(query) {
  await delay()

  const lowerQuery = query.toLowerCase()

  return campaignsExtendedMock.filter(campaign =>
    campaign.name.toLowerCase().includes(lowerQuery) ||
    campaign.campaign_id.toLowerCase().includes(lowerQuery) ||
    campaign.objective.toLowerCase().includes(lowerQuery) ||
    campaign.channel.toLowerCase().includes(lowerQuery) ||
    campaign.product_line?.toLowerCase().includes(lowerQuery) ||
    campaign.responsible_manager?.toLowerCase().includes(lowerQuery) ||
    campaign.notes?.toLowerCase().includes(lowerQuery)
  )
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

/**
 * Генерация UTM-параметров для кампании
 * @param {Object} campaign - Данные кампании
 * @returns {Object} UTM-параметры
 */
function generateUtmParams(campaign) {
  const campaignName = campaign.name
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)

  return {
    source: campaign.channel,
    medium: getDefaultMediumByChannel(campaign.channel),
    campaign: campaignName,
    term: campaign.product_line?.toLowerCase().replace(/\s+/g, '_') || 'general',
    content: campaign.campaign_category || 'main'
  }
}

/**
 * Получить медиум по умолчанию для канала
 * @param {string} channel - Канал
 * @returns {string} Медиум
 */
function getDefaultMediumByChannel(channel) {
  const mediumMap = {
    'meta': 'cpc',
    'google': 'cpc',
    'yandex': 'cpc',
    'tiktok': 'cpc',
    'vk': 'cpc',
    'programmatic': 'cpm',
    'email': 'email',
    'sms': 'sms'
  }

  return mediumMap[channel] || 'cpc'
}

/**
 * Валидация данных кампании
 * @param {Object} campaignData - Данные кампании
 * @returns {Object} Результат валидации
 */
export function validateCampaignData(campaignData) {
  const errors = []
  const warnings = []

  // Обязательные поля
  const requiredFields = ['name', 'objective', 'channel', 'budget_type', 'budget_value', 'start_date']

  requiredFields.forEach(field => {
    if (!campaignData[field]) {
      errors.push(`Поле "${field}" обязательно для заполнения`)
    }
  })

  // Валидация бюджета
  if (campaignData.budget_value && campaignData.budget_value <= 0) {
    errors.push('Бюджет должен быть больше 0')
  }

  // Валидация дат
  if (campaignData.start_date && campaignData.end_date) {
    if (new Date(campaignData.start_date) >= new Date(campaignData.end_date)) {
      errors.push('Дата начала должна быть раньше даты окончания')
    }
  }

  // Предупреждения
  if (!campaignData.utm_params) {
    warnings.push('UTM-параметры не заданы, будут сгенерированы автоматически')
  }

  if (!campaignData.kpi_targets || campaignData.kpi_targets.length === 0) {
    warnings.push('KPI цели не заданы')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}