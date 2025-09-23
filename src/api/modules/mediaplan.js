/**
 * API для работы с медиа-планами
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getMediaPlans = async (filters = {}) => {
  await delay(500)

  // Demo data
  return [
    {
      plan_id: 'plan_1',
      name: 'Медиаплан Q1 2025',
      status: 'draft',
      total_budget: 8000000,
      start_date: '2025-01-01',
      end_date: '2025-03-31',
      created_at: new Date().toISOString()
    }
  ]
}

export const getMediaPlan = async (planId) => {
  await delay(300)

  return {
    plan_id: planId,
    name: 'Медиаплан Q1 2025',
    status: 'draft',
    total_budget: 8000000,
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    created_at: new Date().toISOString()
  }
}

export const getMediaPlanItems = async (planId) => {
  await delay(400)

  return [
    {
      placement_id: 'placement_1',
      channel: 'Instagram',
      placement_type: 'Stories',
      start_date: '2025-01-01',
      end_date: '2025-03-31',
      budget: 3500000,
      impressions: 1400000,
      clicks: 21000,
      ctr: 1.5,
      cpm: 2500
    },
    {
      placement_id: 'placement_2',
      channel: 'YouTube',
      placement_type: 'In-Stream',
      start_date: '2025-01-15',
      end_date: '2025-03-15',
      budget: 3000000,
      impressions: 600000,
      clicks: 12000,
      ctr: 2.0,
      cpm: 5000
    },
    {
      placement_id: 'placement_3',
      channel: 'Google Ads',
      placement_type: 'Search',
      start_date: '2025-02-01',
      end_date: '2025-02-28',
      budget: 1500000,
      impressions: 150000,
      clicks: 7500,
      ctr: 5.0,
      cpm: 10000
    }
  ]
}

export const generateMediaPlan = async (campaignData) => {
  await delay(1500)

  return {
    plan_id: `plan_${Date.now()}`,
    name: 'Медиаплан Q1 2025',
    status: 'draft',
    total_budget: campaignData.budget_value || 8000000,
    start_date: campaignData.start_date || '2025-01-01',
    end_date: campaignData.end_date || '2025-03-31',
    created_at: new Date().toISOString()
  }
}

export const generateMediaPlanItems = async (planId, campaignData) => {
  await delay(1000)

  return [
    {
      placement_id: 'placement_1',
      channel: 'Instagram',
      placement_type: 'Stories',
      start_date: '2025-01-01',
      end_date: '2025-03-31',
      budget: 3500000,
      impressions: 1400000,
      clicks: 21000,
      ctr: 1.5,
      cpm: 2500
    },
    {
      placement_id: 'placement_2',
      channel: 'YouTube',
      placement_type: 'In-Stream',
      start_date: '2025-01-15',
      end_date: '2025-03-15',
      budget: 3000000,
      impressions: 600000,
      clicks: 12000,
      ctr: 2.0,
      cpm: 5000
    },
    {
      placement_id: 'placement_3',
      channel: 'Google Ads',
      placement_type: 'Search',
      start_date: '2025-02-01',
      end_date: '2025-02-28',
      budget: 1500000,
      impressions: 150000,
      clicks: 7500,
      ctr: 5.0,
      cpm: 10000
    }
  ]
}

export const updateMediaPlanItem = async (planId, itemData) => {
  await delay(200)
  return itemData
}

export const createMediaPlan = async (planData) => {
  await delay(600)

  return {
    plan_id: `plan_${Date.now()}`,
    ...planData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export const updateMediaPlan = async (planId, updates) => {
  await delay(500)

  return {
    plan_id: planId,
    ...updates,
    updated_at: new Date().toISOString()
  }
}

export const deleteMediaPlan = async (planId) => {
  await delay(400)

  return { success: true, message: 'Медиа-план успешно удален' }
}

export const exportMediaPlan = async (planId, format = 'excel') => {
  await delay(800)

  return {
    download_url: `https://example.com/exports/mediaplan_${planId}.${format}`,
    filename: `mediaplan_${planId}.${format}`,
    format: format,
    size: '2.3 MB',
    created_at: new Date().toISOString()
  }
}