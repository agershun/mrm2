import apiClient from '../client'

const MODULE_NAME = 'organizations'

// Моки данных для разработки
let organizationsMock = null

const loadMocks = async () => {
  if (!organizationsMock) {
    try {
      const response = await import('../mocks/organizations.mock.json')
      organizationsMock = response.default
    } catch (error) {
      console.warn('Failed to load organizations mock data:', error)
      organizationsMock = []
    }
  }
  return organizationsMock
}

/**
 * Получить список всех организаций
 * @returns {Promise<Array>} Массив организаций
 */
export const getOrganizations = async () => {
  try {
    const organizations = await loadMocks()

    // Имитируем API задержку
    await new Promise(resolve => setTimeout(resolve, 300))

    return organizations.map(org => ({
      ...org,
      isActive: org.is_active !== false
    }))
  } catch (error) {
    console.error('Error fetching organizations:', error)
    throw new Error('Ошибка загрузки списка организаций')
  }
}

/**
 * Получить данные конкретной организации
 * @param {string} organizationId ID организации
 * @returns {Promise<Object>} Данные организации
 */
export const getOrganization = async (organizationId) => {
  try {
    const organizations = await loadMocks()
    const organization = organizations.find(org => org.organization_id === organizationId)

    if (!organization) {
      throw new Error(`Организация с ID ${organizationId} не найдена`)
    }

    // Имитируем API задержку
    await new Promise(resolve => setTimeout(resolve, 200))

    return {
      ...organization,
      isActive: organization.is_active !== false
    }
  } catch (error) {
    console.error('Error fetching organization:', error)
    throw new Error('Ошибка загрузки данных организации')
  }
}

/**
 * Создать новую организацию
 * @param {Object} organizationData Данные новой организации
 * @returns {Promise<Object>} Созданная организация
 */
export const createOrganization = async (organizationData) => {
  try {
    const organizations = await loadMocks()

    const newOrganization = {
      organization_id: `org_${Date.now()}`,
      name: organizationData.name,
      legal_name: organizationData.legal_name || organizationData.name,
      industry: organizationData.industry || 'other',
      description: organizationData.description || '',
      logo_url: organizationData.logo_url || null,
      website: organizationData.website || '',
      email: organizationData.email || '',
      phone: organizationData.phone || '',
      address: organizationData.address || {
        street: '',
        city: '',
        region: '',
        postal_code: '',
        country: 'russia'
      },
      social_media: organizationData.social_media || {
        linkedin: '',
        facebook: '',
        twitter: '',
        instagram: ''
      },
      legal_info: organizationData.legal_info || {
        tax_id: '',
        registration_number: '',
        kpp: '',
        okpo: ''
      },
      strategy_description: organizationData.strategy_description || '',
      target_audience: organizationData.target_audience || '',
      marketing_constraints: organizationData.marketing_constraints || [],
      brand_guidelines_url: organizationData.brand_guidelines_url || '',
      is_active: organizationData.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // В реальном приложении это было бы API вызовом
    organizations.push(newOrganization)

    // Имитируем API задержку
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      ...newOrganization,
      isActive: newOrganization.is_active
    }
  } catch (error) {
    console.error('Error creating organization:', error)
    throw new Error('Ошибка создания организации')
  }
}

/**
 * Обновить данные организации
 * @param {string} organizationId ID организации
 * @param {Object} updateData Данные для обновления
 * @returns {Promise<Object>} Обновленная организация
 */
export const updateOrganization = async (organizationId, updateData) => {
  try {
    const organizations = await loadMocks()
    const organizationIndex = organizations.findIndex(org => org.organization_id === organizationId)

    if (organizationIndex === -1) {
      throw new Error(`Организация с ID ${organizationId} не найдена`)
    }

    const updatedOrganization = {
      ...organizations[organizationIndex],
      ...updateData,
      organization_id: organizationId, // Защищаем от изменения ID
      updated_at: new Date().toISOString()
    }

    organizations[organizationIndex] = updatedOrganization

    // Имитируем API задержку
    await new Promise(resolve => setTimeout(resolve, 400))

    return {
      ...updatedOrganization,
      isActive: updatedOrganization.is_active !== false
    }
  } catch (error) {
    console.error('Error updating organization:', error)
    throw new Error('Ошибка обновления организации')
  }
}

/**
 * Удалить организацию (мягкое удаление)
 * @param {string} organizationId ID организации
 * @returns {Promise<boolean>} Результат операции
 */
export const deleteOrganization = async (organizationId) => {
  try {
    const organizations = await loadMocks()
    const organizationIndex = organizations.findIndex(org => org.organization_id === organizationId)

    if (organizationIndex === -1) {
      throw new Error(`Организация с ID ${organizationId} не найдена`)
    }

    // Мягкое удаление - помечаем как неактивную
    organizations[organizationIndex] = {
      ...organizations[organizationIndex],
      is_active: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Имитируем API задержку
    await new Promise(resolve => setTimeout(resolve, 300))

    return true
  } catch (error) {
    console.error('Error deleting organization:', error)
    throw new Error('Ошибка удаления организации')
  }
}

/**
 * Получить статистику организации
 * @param {string} organizationId ID организации
 * @returns {Promise<Object>} Статистика организации
 */
export const getOrganizationStats = async (organizationId) => {
  try {
    // В реальном приложении это были бы агрегированные данные из других модулей
    const stats = {
      totalUsers: Math.floor(Math.random() * 20) + 5,
      activeProjects: Math.floor(Math.random() * 15) + 3,
      totalBudget: (Math.random() * 50 + 10).toFixed(1) + 'М ₽',
      accountAge: Math.floor(Math.random() * 1000) + 100,
      totalCampaigns: Math.floor(Math.random() * 50) + 10,
      activeCampaigns: Math.floor(Math.random() * 20) + 5,
      totalSpend: (Math.random() * 25 + 5).toFixed(1) + 'М ₽',
      avgROI: (Math.random() * 300 + 150).toFixed(0) + '%'
    }

    // Имитируем API задержку
    await new Promise(resolve => setTimeout(resolve, 200))

    return stats
  } catch (error) {
    console.error('Error fetching organization stats:', error)
    throw new Error('Ошибка загрузки статистики организации')
  }
}

/**
 * Получить документы организации
 * @param {string} organizationId ID организации
 * @returns {Promise<Array>} Список документов
 */
export const getOrganizationDocuments = async (organizationId) => {
  try {
    // Моковые документы с уникальными ID для каждой организации
    const documents = [
      {
        document_id: `doc_${organizationId}_1`,
        organization_id: organizationId,
        name: 'Брендбук компании',
        file_url: '#',
        file_type: 'pdf',
        category: 'brand_guidelines',
        description: 'Основные правила использования фирменного стиля',
        uploaded_by: 'user_1',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        document_id: `doc_${organizationId}_2`,
        organization_id: organizationId,
        name: 'Маркетинговая стратегия 2024',
        file_url: '#',
        file_type: 'docx',
        category: 'strategy',
        description: 'Стратегический план развития на 2024 год',
        uploaded_by: 'user_1',
        created_at: '2024-02-01T14:30:00Z'
      }
    ]

    // Имитируем API задержку
    await new Promise(resolve => setTimeout(resolve, 200))

    return documents
  } catch (error) {
    console.error('Error fetching organization documents:', error)
    throw new Error('Ошибка загрузки документов организации')
  }
}

/**
 * Загрузить документ организации
 * @param {string} organizationId ID организации
 * @param {Object} documentData Данные документа
 * @returns {Promise<Object>} Загруженный документ
 */
export const uploadOrganizationDocument = async (organizationId, documentData) => {
  try {
    const newDocument = {
      document_id: `doc_${Date.now()}`,
      organization_id: organizationId,
      name: documentData.name,
      file_url: documentData.file_url || '#',
      file_type: documentData.file_type || 'pdf',
      category: documentData.category || 'other',
      description: documentData.description || '',
      uploaded_by: documentData.uploaded_by || 'current_user',
      created_at: new Date().toISOString()
    }

    // Имитируем API задержку
    await new Promise(resolve => setTimeout(resolve, 1000))

    return newDocument
  } catch (error) {
    console.error('Error uploading document:', error)
    throw new Error('Ошибка загрузки документа')
  }
}

export default {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
  getOrganizationDocuments,
  uploadOrganizationDocument
}