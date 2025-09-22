<template>
  <div class="integration-settings">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-connection</v-icon>
        Настройки интеграций
      </v-card-title>
      <v-card-text>
        <!-- Активные интеграции -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">Активные интеграции</h3>
          <v-row>
            <v-col
              v-for="integration in integrations.filter(i => i.enabled)"
              :key="integration.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card variant="outlined" :color="integration.status === 'connected' ? 'success' : 'error'">
                <v-card-text>
                  <div class="d-flex align-center mb-3">
                    <v-avatar :color="integration.color" size="40" class="me-3">
                      <v-icon :icon="integration.icon" color="white" />
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="font-weight-medium">{{ integration.name }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ integration.description }}
                      </div>
                    </div>
                    <v-chip
                      :color="integration.status === 'connected' ? 'success' : 'error'"
                      size="small"
                      variant="tonal"
                    >
                      {{ integration.status === 'connected' ? 'Подключено' : 'Ошибка' }}
                    </v-chip>
                  </div>

                  <div class="text-caption text-medium-emphasis mb-2">
                    Последняя синхронизация: {{ integration.lastSync }}
                  </div>

                  <div class="d-flex gap-2">
                    <v-btn
                      size="small"
                      variant="outlined"
                      @click="configureIntegration(integration)"
                    >
                      Настроить
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="outlined"
                      color="primary"
                      @click="syncIntegration(integration)"
                      :loading="integration.syncing"
                    >
                      Синхронизировать
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-6" />

        <!-- Доступные интеграции -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">Доступные интеграции</h3>
          <v-row>
            <v-col
              v-for="integration in integrations.filter(i => !i.enabled)"
              :key="integration.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card variant="outlined">
                <v-card-text>
                  <div class="d-flex align-center mb-3">
                    <v-avatar :color="integration.color" size="40" class="me-3">
                      <v-icon :icon="integration.icon" color="white" />
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="font-weight-medium">{{ integration.name }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ integration.description }}
                      </div>
                    </div>
                  </div>

                  <div class="text-body-2 mb-3">
                    {{ integration.fullDescription }}
                  </div>

                  <v-btn
                    color="primary"
                    variant="outlined"
                    block
                    @click="enableIntegration(integration)"
                  >
                    Подключить
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-6" />

        <!-- Настройки синхронизации -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">Настройки синхронизации</h3>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="syncSettings.frequency"
                :items="syncFrequencies"
                label="Частота синхронизации"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="syncSettings.timeout"
                label="Таймаут (секунд)"
                variant="outlined"
                type="number"
                min="30"
                max="300"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-switch
                v-model="syncSettings.autoRetry"
                label="Автоматически повторять при ошибках"
                color="primary"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-switch
                v-model="syncSettings.notifyErrors"
                label="Уведомлять об ошибках синхронизации"
                color="primary"
              />
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="resetSyncSettings">Сбросить</v-btn>
        <v-btn
          color="primary"
          @click="saveSyncSettings"
          :loading="isSaving"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Диалог конфигурации интеграции -->
    <v-dialog v-model="showConfigDialog" max-width="600">
      <v-card v-if="selectedIntegration">
        <v-card-title>
          Настройка {{ selectedIntegration.name }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveIntegrationConfig">
            <template v-if="selectedIntegration.id === 'google_ads'">
              <v-text-field
                v-model="integrationConfig.client_id"
                label="Client ID"
                variant="outlined"
                required
              />
              <v-text-field
                v-model="integrationConfig.client_secret"
                label="Client Secret"
                variant="outlined"
                type="password"
                required
              />
              <v-text-field
                v-model="integrationConfig.developer_token"
                label="Developer Token"
                variant="outlined"
                required
              />
            </template>

            <template v-if="selectedIntegration.id === 'yandex_direct'">
              <v-text-field
                v-model="integrationConfig.token"
                label="OAuth Token"
                variant="outlined"
                required
              />
              <v-text-field
                v-model="integrationConfig.client_login"
                label="Client Login"
                variant="outlined"
                required
              />
            </template>

            <template v-if="selectedIntegration.id === 'facebook_ads'">
              <v-text-field
                v-model="integrationConfig.app_id"
                label="App ID"
                variant="outlined"
                required
              />
              <v-text-field
                v-model="integrationConfig.app_secret"
                label="App Secret"
                variant="outlined"
                type="password"
                required
              />
              <v-text-field
                v-model="integrationConfig.access_token"
                label="Access Token"
                variant="outlined"
                required
              />
            </template>

            <v-switch
              v-model="integrationConfig.auto_sync"
              label="Автоматическая синхронизация"
              color="primary"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showConfigDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="saveIntegrationConfig"
            :loading="isSavingConfig"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
// import { useSettingsStore } from '@/stores/settingsStore'
import { useAppStore } from '@/stores/appStore'

export default {
  name: 'IntegrationSettings',
  setup() {
    // const settingsStore = useSettingsStore()
    const appStore = useAppStore()

    const isSaving = ref(false)
    const isSavingConfig = ref(false)
    const showConfigDialog = ref(false)
    const selectedIntegration = ref(null)
    const integrationConfig = ref({})

    const integrations = ref([
      {
        id: 'google_ads',
        name: 'Google Ads',
        description: 'Реклама в Google',
        fullDescription: 'Интеграция с Google Ads для автоматического импорта данных кампаний, расходов и конверсий.',
        icon: 'mdi-google-ads',
        color: 'blue',
        enabled: true,
        status: 'connected',
        lastSync: '2 часа назад',
        syncing: false
      },
      {
        id: 'yandex_direct',
        name: 'Яндекс.Директ',
        description: 'Контекстная реклама',
        fullDescription: 'Интеграция с Яндекс.Директ для управления рекламными кампаниями и получения статистики.',
        icon: 'mdi-yandex',
        color: 'red',
        enabled: true,
        status: 'error',
        lastSync: '1 день назад',
        syncing: false
      },
      {
        id: 'facebook_ads',
        name: 'Facebook Ads',
        description: 'Реклама в Facebook',
        fullDescription: 'Интеграция с Facebook Ads Manager для работы с рекламными кампаниями в социальных сетях.',
        icon: 'mdi-facebook',
        color: 'indigo',
        enabled: true,
        status: 'connected',
        lastSync: '30 минут назад',
        syncing: false
      },
      {
        id: 'google_analytics',
        name: 'Google Analytics',
        description: 'Веб-аналитика',
        fullDescription: 'Подключение Google Analytics для получения данных о поведении пользователей на сайте.',
        icon: 'mdi-google-analytics',
        color: 'orange',
        enabled: false,
        status: 'disconnected'
      },
      {
        id: 'mailchimp',
        name: 'Mailchimp',
        description: 'Email-маркетинг',
        fullDescription: 'Интеграция с Mailchimp для управления email-кампаниями и анализа их эффективности.',
        icon: 'mdi-email',
        color: 'yellow darken-2',
        enabled: false,
        status: 'disconnected'
      },
      {
        id: 'salesforce',
        name: 'Salesforce',
        description: 'CRM система',
        fullDescription: 'Подключение к Salesforce для синхронизации данных о клиентах и сделках.',
        icon: 'mdi-cloud',
        color: 'cyan',
        enabled: false,
        status: 'disconnected'
      }
    ])

    const syncSettings = ref({
      frequency: 'hourly',
      timeout: 120,
      autoRetry: true,
      notifyErrors: true
    })

    const syncFrequencies = ref([
      { title: 'Каждые 15 минут', value: '15min' },
      { title: 'Каждый час', value: 'hourly' },
      { title: 'Каждые 6 часов', value: '6hours' },
      { title: 'Ежедневно', value: 'daily' },
      { title: 'Вручную', value: 'manual' }
    ])

    const configureIntegration = (integration) => {
      selectedIntegration.value = integration
      integrationConfig.value = {
        auto_sync: true,
        ...integration.config
      }
      showConfigDialog.value = true
    }

    const enableIntegration = async (integration) => {
      try {
        integration.enabled = true
        integration.status = 'disconnected'
        appStore.showSuccess(`Интеграция ${integration.name} активирована`)
        configureIntegration(integration)
      } catch (error) {
        console.error('Error enabling integration:', error)
        appStore.showError('Ошибка активации интеграции')
      }
    }

    const syncIntegration = async (integration) => {
      try {
        integration.syncing = true
        // Имитация синхронизации
        await new Promise(resolve => setTimeout(resolve, 2000))
        integration.lastSync = 'только что'
        integration.status = 'connected'
        appStore.showSuccess(`Синхронизация ${integration.name} завершена`)
      } catch (error) {
        console.error('Error syncing integration:', error)
        appStore.showError('Ошибка синхронизации')
      } finally {
        integration.syncing = false
      }
    }

    const saveIntegrationConfig = async () => {
      try {
        isSavingConfig.value = true
        selectedIntegration.value.config = { ...integrationConfig.value }
        // await settingsStore.updateIntegrationConfig(selectedIntegration.value.id, integrationConfig.value)
        console.log('Сохранение конфигурации интеграции:', selectedIntegration.value.id, integrationConfig.value)
        appStore.showSuccess('Настройки интеграции сохранены')
        showConfigDialog.value = false
      } catch (error) {
        console.error('Error saving integration config:', error)
        appStore.showError('Ошибка сохранения настроек')
      } finally {
        isSavingConfig.value = false
      }
    }

    const saveSyncSettings = async () => {
      try {
        isSaving.value = true
        // await settingsStore.updateSyncSettings(syncSettings.value)
        console.log('Сохранение настроек синхронизации:', syncSettings.value)
        appStore.showSuccess('Настройки синхронизации сохранены')
      } catch (error) {
        console.error('Error saving sync settings:', error)
        appStore.showError('Ошибка сохранения настроек')
      } finally {
        isSaving.value = false
      }
    }

    const resetSyncSettings = () => {
      syncSettings.value = {
        frequency: 'hourly',
        timeout: 120,
        autoRetry: true,
        notifyErrors: true
      }
    }

    onMounted(async () => {
      try {
        // const savedSyncSettings = await settingsStore.getSyncSettings()
        const savedSyncSettings = null
        if (savedSyncSettings) {
          syncSettings.value = { ...syncSettings.value, ...savedSyncSettings }
        }
      } catch (error) {
        console.error('Error loading sync settings:', error)
      }
    })

    return {
      integrations,
      syncSettings,
      syncFrequencies,
      isSaving,
      isSavingConfig,
      showConfigDialog,
      selectedIntegration,
      integrationConfig,
      configureIntegration,
      enableIntegration,
      syncIntegration,
      saveIntegrationConfig,
      saveSyncSettings,
      resetSyncSettings
    }
  }
}
</script>

<style scoped>
.integration-settings {
  max-width: 100%;
}
</style>