/**
 * Централизованная система обработки ошибок
 * Обеспечивает единообразную обработку ошибок по всему приложению
 */

import { useAppStore } from '@/stores/appStore'

/**
 * Типы ошибок
 */
export const ERROR_TYPES = {
  API: 'api',
  VALIDATION: 'validation',
  NETWORK: 'network',
  AUTHORIZATION: 'authorization',
  UNKNOWN: 'unknown'
}

/**
 * Уровни критичности ошибок
 */
export const ERROR_LEVELS = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

/**
 * Основной класс для обработки ошибок
 */
export class ErrorHandler {
  constructor() {
    this.appStore = null
  }

  /**
   * Инициализация с магазином приложения
   */
  init() {
    if (!this.appStore) {
      this.appStore = useAppStore()
    }
  }

  /**
   * Обработка ошибки
   * @param {Error|string} error - Ошибка или сообщение
   * @param {Object} options - Опции обработки
   * @param {string} options.type - Тип ошибки
   * @param {string} options.level - Уровень критичности
   * @param {string} options.context - Контекст ошибки
   * @param {boolean} options.showToUser - Показывать ли ошибку пользователю
   * @param {boolean} options.logToConsole - Логировать ли в консоль
   */
  handle(error, options = {}) {
    const {
      type = ERROR_TYPES.UNKNOWN,
      level = ERROR_LEVELS.ERROR,
      context = '',
      showToUser = true,
      logToConsole = true
    } = options

    // Подготовка данных об ошибке
    const errorData = this._prepareErrorData(error, type, level, context)

    // Логирование в консоль (только в dev режиме)
    if (logToConsole && process.env.NODE_ENV === 'development') {
      this._logToConsole(errorData)
    }

    // Отправка в систему мониторинга (для production)
    if (process.env.NODE_ENV === 'production') {
      this._sendToMonitoring(errorData)
    }

    // Показ пользователю
    if (showToUser) {
      this._showToUser(errorData)
    }

    return errorData
  }

  /**
   * Обработка API ошибок
   */
  handleApiError(error, context = '') {
    const errorType = this._determineApiErrorType(error)

    return this.handle(error, {
      type: errorType,
      level: ERROR_LEVELS.ERROR,
      context: `API: ${context}`,
      showToUser: true
    })
  }

  /**
   * Обработка ошибок валидации
   */
  handleValidationError(error, context = '') {
    return this.handle(error, {
      type: ERROR_TYPES.VALIDATION,
      level: ERROR_LEVELS.WARNING,
      context: `Validation: ${context}`,
      showToUser: true
    })
  }

  /**
   * Обработка сетевых ошибок
   */
  handleNetworkError(error, context = '') {
    return this.handle(error, {
      type: ERROR_TYPES.NETWORK,
      level: ERROR_LEVELS.ERROR,
      context: `Network: ${context}`,
      showToUser: true
    })
  }

  /**
   * Тихое логирование без показа пользователю
   */
  logSilent(error, context = '') {
    return this.handle(error, {
      type: ERROR_TYPES.UNKNOWN,
      level: ERROR_LEVELS.INFO,
      context,
      showToUser: false
    })
  }

  /**
   * Подготовка данных об ошибке
   */
  _prepareErrorData(error, type, level, context) {
    const timestamp = new Date().toISOString()
    const userAgent = navigator.userAgent
    const url = window.location.href

    let message = ''
    let stack = ''

    if (error instanceof Error) {
      message = error.message
      stack = error.stack
    } else if (typeof error === 'string') {
      message = error
    } else {
      message = 'Неизвестная ошибка'
    }

    return {
      message,
      stack,
      type,
      level,
      context,
      timestamp,
      userAgent,
      url,
      originalError: error
    }
  }

  /**
   * Логирование в консоль
   */
  _logToConsole(errorData) {
    const { message, type, level, context, timestamp } = errorData

    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${type} - ${context ? context + ': ' : ''}${message}`

    switch (level) {
      case ERROR_LEVELS.ERROR:
        console.error(logMessage, errorData)
        break
      case ERROR_LEVELS.WARNING:
        console.warn(logMessage, errorData)
        break
      case ERROR_LEVELS.INFO:
        console.info(logMessage, errorData)
        break
      default:
        console.log(logMessage, errorData)
    }
  }

  /**
   * Отправка в систему мониторинга
   */
  _sendToMonitoring(errorData) {
    // TODO: Интеграция с системой мониторинга (Sentry, LogRocket и т.д.)
    // Например:
    // Sentry.captureException(errorData.originalError, {
    //   tags: { type: errorData.type },
    //   extra: errorData
    // })
  }

  /**
   * Показ ошибки пользователю
   */
  _showToUser(errorData) {
    this.init()

    if (!this.appStore) {
      console.warn('AppStore не инициализирован для показа ошибок пользователю')
      return
    }

    const userMessage = this._getUserFriendlyMessage(errorData)
    const color = this._getNotificationColor(errorData.level)

    this.appStore.showNotification({
      message: userMessage,
      color,
      timeout: this._getNotificationTimeout(errorData.level)
    })
  }

  /**
   * Получение пользовательского сообщения
   */
  _getUserFriendlyMessage(errorData) {
    const { type, message } = errorData

    // Переводим технические ошибки в понятные пользователю
    switch (type) {
      case ERROR_TYPES.NETWORK:
        return 'Проблемы с сетевым соединением. Проверьте подключение к интернету.'

      case ERROR_TYPES.AUTHORIZATION:
        return 'Ошибка авторизации. Пожалуйста, войдите в систему заново.'

      case ERROR_TYPES.API:
        if (message.includes('404')) {
          return 'Запрашиваемые данные не найдены.'
        }
        if (message.includes('500')) {
          return 'Ошибка сервера. Попробуйте позже.'
        }
        if (message.includes('400')) {
          return 'Некорректный запрос. Проверьте введенные данные.'
        }
        return 'Ошибка при обращении к серверу.'

      case ERROR_TYPES.VALIDATION:
        return message || 'Ошибка валидации данных.'

      default:
        return message || 'Произошла неизвестная ошибка.'
    }
  }

  /**
   * Получение цвета уведомления
   */
  _getNotificationColor(level) {
    switch (level) {
      case ERROR_LEVELS.ERROR:
        return 'error'
      case ERROR_LEVELS.WARNING:
        return 'warning'
      case ERROR_LEVELS.INFO:
        return 'info'
      default:
        return 'error'
    }
  }

  /**
   * Получение времени показа уведомления
   */
  _getNotificationTimeout(level) {
    switch (level) {
      case ERROR_LEVELS.ERROR:
        return 8000 // 8 секунд для ошибок
      case ERROR_LEVELS.WARNING:
        return 5000 // 5 секунд для предупреждений
      case ERROR_LEVELS.INFO:
        return 3000 // 3 секунды для информации
      default:
        return 5000
    }
  }

  /**
   * Определение типа API ошибки
   */
  _determineApiErrorType(error) {
    if (error.message && error.message.includes('401')) {
      return ERROR_TYPES.AUTHORIZATION
    }
    if (error.message && (error.message.includes('Network') || error.message.includes('fetch'))) {
      return ERROR_TYPES.NETWORK
    }
    return ERROR_TYPES.API
  }
}

// Создаем глобальный экземпляр
export const errorHandler = new ErrorHandler()

// Удобные функции для быстрого использования
export const handleError = (error, options) => errorHandler.handle(error, options)
export const handleApiError = (error, context) => errorHandler.handleApiError(error, context)
export const handleValidationError = (error, context) => errorHandler.handleValidationError(error, context)
export const handleNetworkError = (error, context) => errorHandler.handleNetworkError(error, context)
export const logSilent = (error, context) => errorHandler.logSilent(error, context)