/**
 * API модуль для работы с инвестициями
 * Реализует методы из TABLES.md для таблиц Investments, InvestmentValues, ManualAllocations, ActivityInvestments
 */

import apiClient from '../client.js'

// Импортируем моки
import investmentsMock from '../mocks/investments.mock.json'
import investmentValuesMock from '../mocks/investmentValues.mock.json'
import manualAllocationsMock from '../mocks/manualAllocations.mock.json'
import activityInvestmentsMock from '../mocks/activityInvestments.mock.json'
import investmentPlansMock from '../mocks/investmentPlans.mock.json'
import investmentHierarchyMock from '../mocks/investmentHierarchy.mock.json'

/**
 * Получает список всех инвестиций с фильтрацией
 * @param {Object} filters - Фильтры: {type, status, period, owner_id}
 * @returns {Promise<Array>} - Список инвестиций
 */
export const getInvestments = async (filters = {}) => {
  try {
    const response = await apiClient.get('/investments', filters)

    // Возвращаем данные из мока с применением фильтров
    let investments = [...investmentsMock]

    if (filters.type) {
      investments = investments.filter(inv => inv.investment_type === filters.type)
    }

    if (filters.status) {
      investments = investments.filter(inv => inv.status === filters.status)
    }

    if (filters.owner_id) {
      investments = investments.filter(inv => inv.owner_id === filters.owner_id)
    }

    if (filters.period) {
      const currentYear = new Date().getFullYear()
      const targetYear = filters.period === 'current' ? currentYear : currentYear + 1
      investments = investments.filter(inv =>
        new Date(inv.start_date).getFullYear() === targetYear
      )
    }

    return investments
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает детальную информацию об инвестиции
 * @param {string} investmentId - ID инвестиции
 * @returns {Promise<Object>} - Детальная информация об инвестиции
 */
export const getInvestmentDetails = async (investmentId) => {
  try {
    const response = await apiClient.get(`/investments/${investmentId}`)

    // Возвращаем данные из мока
    return investmentsMock.find(inv => inv.investment_id === investmentId)
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новую инвестицию
 * @param {Object} data - Данные инвестиции
 * @returns {Promise<Object>} - Созданная инвестиция
 */
export const createInvestment = async (data) => {
  try {
    const response = await apiClient.post('/investments', data)

    // TODO: Заменить на реальное создание
    return {
      investment_id: Date.now().toString(),
      status: 'Draft',
      approval_status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Обновляет инвестицию
 * @param {string} investmentId - ID инвестиции
 * @param {Object} data - Новые данные
 * @returns {Promise<Object>} - Обновленная инвестиция
 */
export const updateInvestment = async (investmentId, data) => {
  try {
    const response = await apiClient.put(`/investments/${investmentId}`, data)

    // TODO: Заменить на реальное обновление
    return {
      investment_id: investmentId,
      ...data,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет инвестицию
 * @param {string} investmentId - ID инвестиции
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteInvestment = async (investmentId) => {
  try {
    const response = await apiClient.delete(`/investments/${investmentId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает значения инвестиции по периодам
 * @param {string} investmentId - ID инвестиции (опционально)
 * @param {Object} filters - Фильтры: {start_date, end_date, period_type}
 * @returns {Promise<Array>} - Значения инвестиции
 */
export const getInvestmentValues = async (investmentId = null, filters = {}) => {
  try {
    const url = investmentId ? `/investments/${investmentId}/values` : '/investment-values'
    const response = await apiClient.get(url, filters)

    // Возвращаем данные из мока
    let values = [...investmentValuesMock]

    if (investmentId) {
      values = values.filter(value => value.investment_id === investmentId)
    }

    if (filters.start_date) {
      values = values.filter(value => value.value_date >= filters.start_date)
    }

    if (filters.end_date) {
      values = values.filter(value => value.value_date <= filters.end_date)
    }

    if (filters.period_type) {
      values = values.filter(value => value.period_type === filters.period_type)
    }

    return values
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает ручные распределения
 * @param {Object} filters - Фильтры: {investment_id, activity_id, status}
 * @returns {Promise<Array>} - Список ручных распределений
 */
export const getManualAllocations = async (filters = {}) => {
  try {
    const response = await apiClient.get('/manual-allocations', filters)

    // Возвращаем данные из мока с применением фильтров
    let allocations = [...manualAllocationsMock]

    if (filters.investment_id) {
      allocations = allocations.filter(alloc => alloc.investment_id === filters.investment_id)
    }

    if (filters.activity_id) {
      allocations = allocations.filter(alloc => alloc.activity_id === filters.activity_id)
    }

    if (filters.status) {
      allocations = allocations.filter(alloc => alloc.status === filters.status)
    }

    return allocations
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает ручное распределение
 * @param {Object} data - Данные распределения
 * @returns {Promise<Object>} - Созданное распределение
 */
export const createManualAllocation = async (data) => {
  try {
    const response = await apiClient.post('/manual-allocations', data)

    // TODO: Заменить на реальное создание
    return {
      allocation_id: Date.now().toString(),
      status: 'Active',
      allocation_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает связи активностей с инвестициями
 * @param {string} activityId - ID активности (опционально)
 * @returns {Promise<Array>} - Список связей
 */
export const getActivityInvestments = async (activityId = null) => {
  try {
    const url = activityId ? `/activities/${activityId}/investments` : '/activity-investments'
    const response = await apiClient.get(url)

    // Возвращаем данные из мока
    let links = [...activityInvestmentsMock]

    if (activityId) {
      links = links.filter(link => link.activity_id === activityId)
    }

    return links
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Связывает активность с инвестицией
 * @param {Object} data - Данные связи: {activity_id, investment_id, allocation_percentage}
 * @returns {Promise<Object>} - Созданная связь
 */
export const linkActivityToInvestment = async (data) => {
  try {
    const response = await apiClient.post('/activity-investments', data)

    // TODO: Заменить на реальное создание
    return {
      link_id: Date.now().toString(),
      status: 'Active',
      allocation_type: 'Manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет связь активности с инвестицией
 * @param {string} linkId - ID связи
 * @returns {Promise<boolean>} - Результат удаления
 */
export const unlinkActivityFromInvestment = async (linkId) => {
  try {
    const response = await apiClient.delete(`/activity-investments/${linkId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Рассчитывает ROI для инвестиции
 * @param {string} investmentId - ID инвестиции
 * @returns {Promise<Object>} - Данные ROI
 */
export const calculateROI = async (investmentId) => {
  try {
    const response = await apiClient.get(`/investments/${investmentId}/roi`)

    // TODO: Заменить на реальный расчет
    const investment = investmentsMock.find(inv => inv.investment_id === investmentId)
    if (!investment) {
      throw new Error('Investment not found')
    }

    return {
      investment_id: investmentId,
      expected_roi: investment.expected_roi,
      actual_roi: Math.max(0, investment.expected_roi + (Math.random() - 0.5) * 10),
      total_invested: investment.actual_spent,
      total_revenue: investment.actual_spent * (investment.expected_roi / 100 + 1),
      profit: investment.actual_spent * (investment.expected_roi / 100),
      calculated_at: new Date().toISOString()
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Генерирует прогноз инвестиций
 * @param {Object} params - Параметры прогноза: {period, investments, scenarios}
 * @returns {Promise<Object>} - Данные прогноза
 */
export const generateForecast = async (params = {}) => {
  try {
    const response = await apiClient.post('/investments/forecast', params)

    // TODO: Заменить на реальное прогнозирование
    const forecast = {
      forecast_id: Date.now().toString(),
      period: params.period || 'next_quarter',
      scenarios: [
        {
          name: 'Оптимистичный',
          total_investment: 45000000,
          expected_return: 58500000,
          roi: 30.0,
          probability: 0.3
        },
        {
          name: 'Реалистичный',
          total_investment: 42000000,
          expected_return: 52500000,
          roi: 25.0,
          probability: 0.5
        },
        {
          name: 'Пессимистичный',
          total_investment: 38000000,
          expected_return: 45600000,
          roi: 20.0,
          probability: 0.2
        }
      ],
      generated_at: new Date().toISOString()
    }

    return forecast
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Оптимизирует распределение инвестиций
 * @param {Object} params - Параметры оптимизации: {budget, constraints, objectives}
 * @returns {Promise<Object>} - Результат оптимизации
 */
export const optimizeAllocation = async (params) => {
  try {
    const response = await apiClient.post('/investments/optimize', params)

    // TODO: Заменить на реальную оптимизацию
    const optimization = {
      optimization_id: Date.now().toString(),
      recommendations: [
        {
          investment_type: 'Digital Advertising',
          recommended_allocation: 35,
          current_allocation: 30,
          improvement_potential: '+12% ROI'
        },
        {
          investment_type: 'Social Media',
          recommended_allocation: 25,
          current_allocation: 20,
          improvement_potential: '+8% ROI'
        },
        {
          investment_type: 'Traditional Media',
          recommended_allocation: 20,
          current_allocation: 25,
          improvement_potential: '+5% ROI'
        },
        {
          investment_type: 'Innovation',
          recommended_allocation: 20,
          current_allocation: 25,
          improvement_potential: '+15% ROI'
        }
      ],
      expected_improvement: 18.5,
      confidence_score: 0.85,
      generated_at: new Date().toISOString()
    }

    return optimization
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Поиск инвестиций по ключевому слову
 * @param {string} keyword - Ключевое слово для поиска
 * @returns {Promise<Array>} - Результаты поиска
 */
export const searchInvestments = async (keyword) => {
  try {
    const response = await apiClient.get('/investments/search', { keyword })

    // Поиск в моках
    const searchTerm = keyword.toLowerCase()
    return investmentsMock.filter(investment =>
      investment.name.toLowerCase().includes(searchTerm) ||
      investment.description?.toLowerCase().includes(searchTerm) ||
      investment.investment_type?.toLowerCase().includes(searchTerm)
    )
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает тренды инвестиций
 * @param {Object} params - Параметры: {period, type, metrics}
 * @returns {Promise<Object>} - Данные трендов
 */
export const getInvestmentTrends = async (params = {}) => {
  try {
    const response = await apiClient.get('/investments/trends', params)

    // TODO: Заменить на реальные тренды
    const trends = {
      period: params.period || 'last_12_months',
      metrics: {
        total_investments: [
          { month: '2024-01', value: 8500000 },
          { month: '2024-02', value: 9200000 },
          { month: '2024-03', value: 10100000 },
          { month: '2024-04', value: 9800000 },
          { month: '2024-05', value: 11500000 },
          { month: '2024-06', value: 12300000 },
          { month: '2024-07', value: 10900000 },
          { month: '2024-08', value: 13200000 },
          { month: '2024-09', value: 14100000 },
          { month: '2024-10', value: 12800000 },
          { month: '2024-11', value: 15600000 },
          { month: '2024-12', value: 16900000 }
        ],
        roi_trends: [
          { month: '2024-01', value: 22.1 },
          { month: '2024-02', value: 23.5 },
          { month: '2024-03', value: 25.2 },
          { month: '2024-04', value: 24.8 },
          { month: '2024-05', value: 26.7 },
          { month: '2024-06', value: 28.1 },
          { month: '2024-07', value: 27.3 },
          { month: '2024-08', value: 29.4 },
          { month: '2024-09', value: 30.2 },
          { month: '2024-10', value: 28.9 },
          { month: '2024-11', value: 31.5 },
          { month: '2024-12', value: 32.8 }
        ]
      },
      generated_at: new Date().toISOString()
    }

    return trends
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает планы инвестиций
 * @param {Object} filters - Фильтры: {status, fiscal_year}
 * @returns {Promise<Array>} - Список планов инвестиций
 */
export const getInvestmentPlans = async (filters = {}) => {
  try {
    const response = await apiClient.get('/investment-plans', filters)

    // Возвращаем данные из мока с применением фильтров
    let plans = [...investmentPlansMock]

    if (filters.status) {
      plans = plans.filter(plan => plan.status === filters.status)
    }

    if (filters.fiscal_year) {
      plans = plans.filter(plan => plan.fiscal_year === filters.fiscal_year)
    }

    return plans
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Получает иерархическую структуру инвестиций
 * @param {string} planId - ID плана инвестиций (опционально)
 * @returns {Promise<Array>} - Иерархическая структура инвестиций
 */
export const getInvestmentHierarchy = async (planId = null) => {
  try {
    const url = planId ? `/investment-plans/${planId}/hierarchy` : '/investment-hierarchy'
    const response = await apiClient.get(url)

    // Возвращаем данные из мока
    let hierarchy = [...investmentHierarchyMock]

    if (planId) {
      hierarchy = hierarchy.filter(item => item.investment_plan_id === planId)
    }

    return hierarchy
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Создает новый элемент иерархии инвестиций
 * @param {Object} data - Данные элемента иерархии
 * @returns {Promise<Object>} - Созданный элемент
 */
export const createInvestmentHierarchyItem = async (data) => {
  try {
    const response = await apiClient.post('/investment-hierarchy', data)

    // TODO: Заменить на реальное создание
    return {
      investment_id: `inv_${data.type}_${Date.now()}`,
      level: data.level || 0,
      total_amount: data.total_amount || 0,
      connected_to_activities: false,
      kreola_id: `KRL-${data.type.toUpperCase()}-${Date.now()}`,
      persistent_id: `persistent_${data.type}_${Date.now()}`,
      created_by: 'current_user',
      updated_by: 'current_user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    }
  } catch (error) {
    apiClient.handleError(error)
  }
}

/**
 * Удаляет элемент иерархии инвестиций
 * @param {string} itemId - ID элемента иерархии
 * @returns {Promise<boolean>} - Результат удаления
 */
export const deleteInvestmentHierarchyItem = async (itemId) => {
  try {
    const response = await apiClient.delete(`/investment-hierarchy/${itemId}`)
    return true
  } catch (error) {
    apiClient.handleError(error)
  }
}