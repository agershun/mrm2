/**
 * Базовый API клиент для Kreola MRM
 * Имитирует работу с REST API, используя JSON моки
 */

// Симуляция задержки сети
const API_DELAY = 300

/**
 * Имитация HTTP запроса
 * @param {string} method - HTTP метод
 * @param {string} endpoint - URL эндпоинта
 * @param {Object} data - Данные для отправки
 * @returns {Promise} - Промис с результатом
 */
const mockRequest = async (method, endpoint, data = null) => {
  // Имитируем задержку сети
  await new Promise(resolve => setTimeout(resolve, API_DELAY))

  // Имитируем случайные ошибки (0.00005% вероятность)
  if (Math.random() < 0.00005) {
    throw new Error('Network error: Unable to connect to server')
  }

  console.log(`[API] ${method} ${endpoint}`, data ? { data } : '')

  return {
    ok: true,
    status: 200,
    data: null // Будет заполняться в конкретных методах API
  }
}

/**
 * Базовый класс API клиента
 */
class ApiClient {
  constructor(baseURL = import.meta.env.VITE_API_URL) {
    this.baseURL = baseURL
  }

  /**
   * GET запрос
   */
  async get(endpoint, params = {}) {
    const url = this.buildUrl(endpoint, params)
    return mockRequest('GET', url)
  }

  /**
   * POST запрос
   */
  async post(endpoint, data = {}) {
    return mockRequest('POST', endpoint, data)
  }

  /**
   * PUT запрос
   */
  async put(endpoint, data = {}) {
    return mockRequest('PUT', endpoint, data)
  }

  /**
   * DELETE запрос
   */
  async delete(endpoint) {
    return mockRequest('DELETE', endpoint)
  }

  /**
   * PATCH запрос
   */
  async patch(endpoint, data = {}) {
    return mockRequest('PATCH', endpoint, data)
  }

  /**
   * Построение URL с параметрами
   */
  buildUrl(endpoint, params = {}) {
    const url = new URL(endpoint, this.baseURL)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        // Корректная сериализация параметров
        let value = params[key]
        if (typeof value === 'object') {
          value = JSON.stringify(value)
        }
        url.searchParams.append(key, String(value))
      }
    })
    return url.toString()
  }

  /**
   * Обработка ошибок
   */
  handleError(error) {
    console.error('[API Error]', error)
    throw error
  }
}

// Создаем экземпляр API клиента
const apiClient = new ApiClient()

export default apiClient