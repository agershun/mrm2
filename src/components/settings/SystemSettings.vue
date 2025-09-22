<template>
  <div class="system-settings">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-cog</v-icon>
        Системные настройки
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveSettings">
          <!-- Общие настройки -->
          <div class="settings-section">
            <h3 class="text-h6 mb-4">Общие настройки</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.system_name"
                  label="Название системы"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.system_version"
                  label="Версия системы"
                  variant="outlined"
                  readonly
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.default_language"
                  :items="languages"
                  label="Язык по умолчанию"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.default_timezone"
                  :items="timezones"
                  label="Часовой пояс"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.default_currency"
                  :items="currencies"
                  label="Валюта по умолчанию"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.date_format"
                  :items="dateFormats"
                  label="Формат даты"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Настройки производительности -->
          <div class="settings-section">
            <h3 class="text-h6 mb-4">Производительность</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.page_size"
                  label="Размер страницы (записей)"
                  variant="outlined"
                  type="number"
                  min="10"
                  max="1000"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.cache_timeout"
                  label="Время кэширования (минут)"
                  variant="outlined"
                  type="number"
                  min="1"
                  max="1440"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.enable_caching"
                  label="Включить кэширование"
                  color="primary"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.enable_compression"
                  label="Включить сжатие данных"
                  color="primary"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Настройки уведомлений -->
          <div class="settings-section">
            <h3 class="text-h6 mb-4">Уведомления</h3>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.email_notifications"
                  label="Email уведомления"
                  color="primary"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.push_notifications"
                  label="Push уведомления"
                  color="primary"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.admin_email"
                  label="Email администратора"
                  variant="outlined"
                  type="email"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.notification_frequency"
                  :items="notificationFrequencies"
                  label="Частота уведомлений"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Настройки безопасности -->
          <div class="settings-section">
            <h3 class="text-h6 mb-4">Безопасность</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.session_timeout"
                  label="Время сессии (минут)"
                  variant="outlined"
                  type="number"
                  min="5"
                  max="1440"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.password_expiry"
                  label="Срок действия пароля (дней)"
                  variant="outlined"
                  type="number"
                  min="30"
                  max="365"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.require_two_factor"
                  label="Требовать двухфакторную аутентификацию"
                  color="primary"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.log_user_activity"
                  label="Логировать активность пользователей"
                  color="primary"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Настройки мониторинга -->
          <div class="settings-section">
            <h3 class="text-h6 mb-4">Мониторинг</h3>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.enable_analytics"
                  label="Включить аналитику использования"
                  color="primary"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.enable_error_tracking"
                  label="Отслеживание ошибок"
                  color="primary"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.log_level"
                  :items="logLevels"
                  label="Уровень логирования"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.log_retention_days"
                  label="Хранение логов (дней)"
                  variant="outlined"
                  type="number"
                  min="1"
                  max="365"
                />
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="resetSettings">Сбросить</v-btn>
        <v-btn
          color="primary"
          @click="saveSettings"
          :loading="isSaving"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Статистика системы -->
    <v-card class="mt-6">
      <v-card-title>
        <v-icon class="me-2">mdi-chart-line</v-icon>
        Статистика системы
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-primary">
                  {{ systemStats.uptime }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Время работы
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-success">
                  {{ systemStats.activeUsers }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Активных пользователей
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-info">
                  {{ systemStats.totalActivities }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Активностей
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-warning">
                  {{ systemStats.storageUsed }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Используется места
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
// import { useSettingsStore } from '@/stores/settingsStore'
import { useAppStore } from '@/stores/appStore'

export default {
  name: 'SystemSettings',
  setup() {
    const appStore = useAppStore()

    const isSaving = ref(false)
    const settings = ref({
      system_name: 'Креола MRM',
      system_version: '2.0.0',
      default_language: 'ru',
      default_timezone: 'Europe/Moscow',
      default_currency: 'RUB',
      date_format: 'DD.MM.YYYY',
      page_size: 50,
      cache_timeout: 30,
      enable_caching: true,
      enable_compression: true,
      email_notifications: true,
      push_notifications: false,
      admin_email: 'admin@kreola.ru',
      notification_frequency: 'daily',
      session_timeout: 60,
      password_expiry: 90,
      require_two_factor: false,
      log_user_activity: true,
      enable_analytics: true,
      enable_error_tracking: true,
      log_level: 'info',
      log_retention_days: 30
    })

    const systemStats = ref({
      uptime: '45 дней',
      activeUsers: 12,
      totalActivities: 1247,
      storageUsed: '2.3 ГБ'
    })

    const languages = ref([
      { title: 'Русский', value: 'ru' },
      { title: 'English', value: 'en' }
    ])

    const timezones = ref([
      { title: 'Москва (UTC+3)', value: 'Europe/Moscow' },
      { title: 'Лондон (UTC+0)', value: 'Europe/London' },
      { title: 'Нью-Йорк (UTC-5)', value: 'America/New_York' }
    ])

    const currencies = ref([
      { title: 'Российский рубль (₽)', value: 'RUB' },
      { title: 'Доллар США ($)', value: 'USD' },
      { title: 'Евро (€)', value: 'EUR' }
    ])

    const dateFormats = ref([
      { title: 'ДД.ММ.ГГГГ', value: 'DD.MM.YYYY' },
      { title: 'ММ/ДД/ГГГГ', value: 'MM/DD/YYYY' },
      { title: 'ГГГГ-ММ-ДД', value: 'YYYY-MM-DD' }
    ])

    const notificationFrequencies = ref([
      { title: 'Немедленно', value: 'immediate' },
      { title: 'Ежедневно', value: 'daily' },
      { title: 'Еженедельно', value: 'weekly' }
    ])

    const logLevels = ref([
      { title: 'Отладка', value: 'debug' },
      { title: 'Информация', value: 'info' },
      { title: 'Предупреждения', value: 'warning' },
      { title: 'Ошибки', value: 'error' }
    ])

    const saveSettings = async () => {
      try {
        isSaving.value = true
        // await settingsStore.updateSystemSettings(settings.value)
        console.log('Сохранение системных настроек:', settings.value)
        appStore.showSuccess('Настройки сохранены успешно')
      } catch (error) {
        console.error('Error saving settings:', error)
        appStore.showError('Ошибка сохранения настроек')
      } finally {
        isSaving.value = false
      }
    }

    const resetSettings = () => {
      settings.value = {
        system_name: 'Креола MRM',
        system_version: '2.0.0',
        default_language: 'ru',
        default_timezone: 'Europe/Moscow',
        default_currency: 'RUB',
        date_format: 'DD.MM.YYYY',
        page_size: 50,
        cache_timeout: 30,
        enable_caching: true,
        enable_compression: true,
        email_notifications: true,
        push_notifications: false,
        admin_email: 'admin@kreola.ru',
        notification_frequency: 'daily',
        session_timeout: 60,
        password_expiry: 90,
        require_two_factor: false,
        log_user_activity: true,
        enable_analytics: true,
        enable_error_tracking: true,
        log_level: 'info',
        log_retention_days: 30
      }
    }

    onMounted(async () => {
      try {
        // const savedSettings = await settingsStore.getSystemSettings()
        const savedSettings = null
        if (savedSettings) {
          settings.value = { ...settings.value, ...savedSettings }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    })

    return {
      settings,
      systemStats,
      isSaving,
      languages,
      timezones,
      currencies,
      dateFormats,
      notificationFrequencies,
      logLevels,
      saveSettings,
      resetSettings
    }
  }
}
</script>

<style scoped>
.system-settings {
  max-width: 100%;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section:last-child {
  margin-bottom: 0;
}
</style>