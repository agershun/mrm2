<template>
  <div class="campaigns-view">
    <!-- Заголовок -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Кампании</h1>
        <p class="text-body-1 text-medium-emphasis">
          Управление и планирование маркетинговых кампаний с многоуровневой иерархией
        </p>
      </div>
      <v-spacer />

      <!-- Быстрые действия -->
      <div class="d-flex align-center ga-2">
        <v-btn
          color="success"
          prepend-icon="mdi-plus"
          @click="createCampaignDialog = true"
        >
          Новая кампания
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-strategy"
          variant="outlined"
          @click="currentTab = 'planning'"
        >
          Планирование
        </v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="outlined"
              v-bind="props"
            />
          </template>
          <v-list>
            <v-list-item @click="exportCampaigns">
              <v-list-item-title>Экспорт данных</v-list-item-title>
            </v-list-item>
            <v-list-item @click="importCampaigns">
              <v-list-item-title>Импорт кампаний</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="campaignTemplates">
              <v-list-item-title>Шаблоны кампаний</v-list-item-title>
            </v-list-item>
            <v-list-item @click="bulkOperations">
              <v-list-item-title>Массовые операции</v-list-item-title>
            </v-list-item>
            <v-list-item @click="currentTab = 'ai'">
              <v-list-item-title>ИИ кампании</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Навигационные вкладки -->
    <v-tabs
      v-model="currentTab"
      class="mb-6"
      color="primary"
    >
      <v-tab value="management">
        <v-icon class="mr-2">mdi-bullhorn</v-icon>
        Управление кампаниями
      </v-tab>
      <v-tab value="planning">
        <v-icon class="mr-2">mdi-strategy</v-icon>
        Планирование
      </v-tab>
      <v-tab value="hierarchy">
        <v-icon class="mr-2">mdi-file-tree</v-icon>
        Иерархия
      </v-tab>
      <v-tab value="budget">
        <v-icon class="mr-2">mdi-chart-line</v-icon>
        Бюджеты
      </v-tab>
      <v-tab value="performance">
        <v-icon class="mr-2">mdi-chart-bar</v-icon>
        Эффективность
      </v-tab>
      <v-tab value="ai">
        <v-icon class="mr-2">mdi-robot</v-icon>
        ИИ кампании
      </v-tab>
    </v-tabs>

    <!-- Контент вкладок -->
    <v-tabs-window v-model="currentTab">
      <!-- Управление кампаниями -->
      <v-tabs-window-item value="management">
        <CampaignsManagement />
      </v-tabs-window-item>

      <!-- Планирование -->
      <v-tabs-window-item value="planning">
        <CampaignPlanning />
      </v-tabs-window-item>

      <!-- Иерархия -->
      <v-tabs-window-item value="hierarchy">
        <CampaignHierarchy />
      </v-tabs-window-item>

      <!-- Бюджеты -->
      <v-tabs-window-item value="budget">
        <CampaignBudgets />
      </v-tabs-window-item>

      <!-- Эффективность -->
      <v-tabs-window-item value="performance">
        <CampaignPerformance />
      </v-tabs-window-item>

      <!-- ИИ кампании (существующий функционал) -->
      <v-tabs-window-item value="ai">
        <div class="ai-campaigns-content">

          <!-- Поиск -->
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Поиск ИИ кампаний"
            variant="outlined"
            density="compact"
            style="width: 300px"
            clearable
            class="mb-4"
          />

          <!-- Фильтры -->
          <v-card class="mb-4">
            <v-card-text class="py-3">
              <v-row>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.status"
                    :items="statusOptions"
                    label="Статус"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:modelValue="applyFilters"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.category"
                    :items="categoryOptions"
                    label="Категория"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:modelValue="applyFilters"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.owner"
                    :items="ownerOptions"
                    label="Ответственный"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:modelValue="applyFilters"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-btn
                    variant="outlined"
                    prepend-icon="mdi-filter-off"
                    @click="clearFilters"
                  >
                    Сбросить фильтры
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

    <!-- Таблица кампаний -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredCampaigns"
        :loading="isLoading"
        :search="searchQuery"
        class="elevation-0"
        item-value="ai_campaign_id"
        @click:row="openCampaign"
      >
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="flat"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template #item.campaign_category="{ item }">
          <v-chip
            :color="getCategoryColor(item.campaign_category)"
            size="small"
            variant="tonal"
          >
            {{ getCategoryText(item.campaign_category) }}
          </v-chip>
        </template>

        <template #item.budget_limit="{ item }">
          <div v-if="item.budget_limit">
            <div class="text-body-2">
              Online: {{ formatCurrency(item.budget_limit.online || 0) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Offline: {{ formatCurrency(item.budget_limit.offline || 0) }}
            </div>
          </div>
          <span v-else class="text-medium-emphasis">Не указан</span>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              @click.stop="openCampaign(null, { item })"
            >
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent" location="top">
                Открыть кампанию
              </v-tooltip>
            </v-btn>

            <v-btn
              icon="mdi-content-copy"
              size="small"
              variant="text"
              @click.stop="createVersion(item)"
            >
              <v-icon>mdi-content-copy</v-icon>
              <v-tooltip activator="parent" location="top">
                Создать версию
              </v-tooltip>
            </v-btn>

            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click.stop="deleteCampaign(item)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">
                Удалить
              </v-tooltip>
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-robot-outline
            </v-icon>
            <h3 class="text-h6 mb-2">Кампании не найдены</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Создайте вашу первую кампанию с помощью ИИ
            </p>
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-plus"
              @click="createCampaign"
            >
              Создать кампанию
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

          <!-- Таблица ИИ кампаний -->
          <v-card>
            <v-data-table
              :headers="headers"
              :items="filteredCampaigns"
              :loading="isLoading"
              :search="searchQuery"
              class="elevation-0"
              item-value="ai_campaign_id"
              @click:row="openCampaign"
            >
              <template #item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="flat"
                >
                  {{ getStatusText(item.status) }}
                </v-chip>
              </template>

              <template #item.campaign_category="{ item }">
                <v-chip
                  :color="getCategoryColor(item.campaign_category)"
                  size="small"
                  variant="tonal"
                >
                  {{ getCategoryText(item.campaign_category) }}
                </v-chip>
              </template>

              <template #item.budget_limit="{ item }">
                <div v-if="item.budget_limit">
                  <div class="text-body-2">
                    Online: {{ formatCurrency(item.budget_limit.online || 0) }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Offline: {{ formatCurrency(item.budget_limit.offline || 0) }}
                  </div>
                </div>
                <span v-else class="text-medium-emphasis">Не указан</span>
              </template>

              <template #item.created_at="{ item }">
                {{ formatDate(item.created_at) }}
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex ga-1">
                  <v-btn
                    icon="mdi-eye"
                    size="small"
                    variant="text"
                    @click.stop="openCampaign(null, { item })"
                  >
                    <v-icon>mdi-eye</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Открыть кампанию
                    </v-tooltip>
                  </v-btn>

                  <v-btn
                    icon="mdi-content-copy"
                    size="small"
                    variant="text"
                    @click.stop="createVersion(item)"
                  >
                    <v-icon>mdi-content-copy</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Создать версию
                    </v-tooltip>
                  </v-btn>

                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click.stop="deleteCampaign(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Удалить
                    </v-tooltip>
                  </v-btn>
                </div>
              </template>

              <template #no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey-lighten-1" class="mb-4">
                    mdi-robot-outline
                  </v-icon>
                  <h3 class="text-h6 mb-2">Кампании не найдены</h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    Создайте вашу первую кампанию с помощью ИИ
                  </p>
                  <v-btn
                    color="primary"
                    variant="flat"
                    prepend-icon="mdi-plus"
                    @click="createCampaign"
                  >
                    Создать кампанию
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card>

          <!-- Диалог создания ИИ кампании -->
          <v-dialog v-model="showCreateDialog" max-width="600">
            <v-card>
              <v-card-title>Создать новую кампанию ИИ</v-card-title>
              <v-card-text>
                <v-form ref="createForm" v-model="isFormValid">
                  <v-text-field
                    v-model="newCampaign.name"
                    label="Название кампании"
                    variant="outlined"
                    :rules="[v => !!v || 'Название обязательно']"
                    required
                    class="mb-4"
                  />

                  <v-textarea
                    v-model="newCampaign.description"
                    label="Описание"
                    variant="outlined"
                    rows="3"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="newCampaign.objective"
                    label="Цель кампании"
                    variant="outlined"
                    placeholder="Например: Увеличить продажи на 20%"
                    class="mb-4"
                  />

                  <v-select
                    v-model="newCampaign.campaign_category"
                    :items="categoryOptions"
                    label="Категория кампании"
                    variant="outlined"
                    :rules="[v => !!v || 'Категория обязательна']"
                    required
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn @click="showCreateDialog = false">Отмена</v-btn>
                <v-btn
                  color="primary"
                  :disabled="!isFormValid"
                  :loading="isSaving"
                  @click="saveCampaign"
                >
                  Создать
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Диалог быстрого создания кампании -->
    <v-dialog v-model="createCampaignDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">Быстрое создание кампании</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="quickForm" v-model="quickFormValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="quickFormData.name"
                  label="Название кампании"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="quickFormData.template"
                  :items="campaignTemplatesOptions"
                  label="Шаблон кампании"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="quickFormData.hierarchy_level"
                  :items="hierarchyLevels"
                  label="Уровень"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="quickFormData.start_date"
                  label="Дата начала"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="quickFormData.budget"
                  label="Бюджет"
                  type="number"
                  variant="outlined"
                  suffix="₽"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="createCampaignDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!quickFormValid"
            @click="createQuickCampaign"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useCampaignsExtendedStore } from '@/stores/campaignsExtendedStore'
import { useSnackbar } from '@/composables/useSnackbar'

// Campaign Management Component
const CampaignsManagement = {
  name: 'CampaignsManagement',
  setup() {
    const isLoading = ref(false)
    const searchQuery = ref('')
    const selectedCampaigns = ref([])
    const editDialog = ref(false)
    const selectedCampaign = ref(null)

    const statusFilter = ref(null)
    const channelFilter = ref(null)
    const categoryFilter = ref(null)

    const statusOptions = [
      { title: 'Активная', value: 'active' },
      { title: 'Пауза', value: 'paused' },
      { title: 'Черновик', value: 'draft' },
      { title: 'Завершена', value: 'completed' }
    ]

    const channelOptions = [
      { title: 'Meta (Facebook/Instagram)', value: 'meta' },
      { title: 'Google Ads', value: 'google' },
      { title: 'Яндекс.Директ', value: 'yandex' },
      { title: 'TikTok', value: 'tiktok' }
    ]

    const categoryOptions = [
      { title: 'Промо-акции', value: 'promo' },
      { title: 'Тестирование', value: 'test' },
      { title: 'Always On', value: 'always_on' },
      { title: 'Ретаргетинг', value: 'retargeting' },
      { title: 'Запуск', value: 'launch' }
    ]

    const headers = [
      { title: 'Название', key: 'name', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Канал', key: 'channel', sortable: true },
      { title: 'Категория', key: 'campaign_category', sortable: true },
      { title: 'Бюджет', key: 'budget_value', sortable: true },
      { title: 'Период', key: 'date_range', sortable: false },
      { title: 'Ответственный', key: 'responsible_manager', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    // Get campaigns from store
    const campaigns = computed(() => {
      let items = campaignsStore.campaigns || []

      if (statusFilter.value) {
        items = items.filter(c => c.status === statusFilter.value)
      }
      if (channelFilter.value) {
        items = items.filter(c => c.channel === channelFilter.value)
      }
      if (categoryFilter.value) {
        items = items.filter(c => c.campaign_category === categoryFilter.value)
      }

      return items.map(campaign => ({
        ...campaign,
        date_range: formatDateRange(campaign.start_date, campaign.end_date),
        budget_display: formatBudget(campaign.budget_value, campaign.budget_type)
      }))
    })

    const formatDateRange = (start, end) => {
      const startDate = new Date(start).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
      if (!end) return `${startDate} - Не ограничено`
      const endDate = new Date(end).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
      return `${startDate} - ${endDate}`
    }

    const formatBudget = (value, type) => {
      const amount = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(value)

      return type === 'daily' ? `${amount}/день` : amount
    }

    const getStatusColor = (status) => {
      const colors = {
        'active': 'success',
        'paused': 'warning',
        'draft': 'info',
        'completed': 'default'
      }
      return colors[status] || 'default'
    }

    const getStatusText = (status) => {
      const texts = {
        'active': 'Активная',
        'paused': 'Пауза',
        'draft': 'Черновик',
        'completed': 'Завершена'
      }
      return texts[status] || status
    }

    const getChannelColor = (channel) => {
      const colors = {
        'meta': 'blue',
        'google': 'green',
        'yandex': 'red',
        'tiktok': 'purple'
      }
      return colors[channel] || 'grey'
    }

    const editCampaign = (campaign) => {
      selectedCampaign.value = { ...campaign }
      editDialog.value = true
    }

    const toggleCampaignStatus = async (campaign) => {
      try {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active'
        await campaignsStore.updateCampaign(campaign.campaign_id, { status: newStatus })
        showSnackbar(`Кампания ${newStatus === 'active' ? 'запущена' : 'приостановлена'}`, 'success')
      } catch (error) {
        showSnackbar('Ошибка при изменении статуса', 'error')
      }
    }

    const duplicateCampaign = async (campaign) => {
      try {
        const newCampaign = {
          ...campaign,
          campaign_id: undefined,
          name: `${campaign.name} (копия)`,
          status: 'draft'
        }
        await campaignsStore.createCampaign(newCampaign)
        showSnackbar('Кампания скопирована', 'success')
      } catch (error) {
        showSnackbar('Ошибка при копировании кампании', 'error')
      }
    }

    const clearFilters = () => {
      statusFilter.value = null
      channelFilter.value = null
      categoryFilter.value = null
      searchQuery.value = ''
    }

    return () => h('div', { class: 'campaigns-management' }, [
      // Header with filters
      h('div', { class: 'mb-6' }, [
        h('div', { class: 'd-flex align-center mb-4' }, [
          h('h2', { class: 'text-h5 font-weight-bold' }, 'Управление кампаниями'),
          h('div', { class: 'ml-auto d-flex ga-2' }, [
            h('button', {
              class: 'v-btn v-btn--density-default v-btn--size-default v-btn--variant-outlined',
              onClick: clearFilters
            }, 'Сбросить фильтры'),
            h('button', {
              class: 'v-btn v-btn--density-default v-btn--size-default v-btn--variant-elevated text-white',
              style: 'background-color: rgb(var(--v-theme-primary));',
              onClick: () => createCampaignDialog.value = true
            }, 'Создать кампанию')
          ])
        ]),

        // Filters row
        h('div', { class: 'row' }, [
          h('div', { class: 'col-md-3' }, [
            h('div', {
              class: 'v-field v-field--density-compact v-field--variant-outlined',
              style: 'margin-bottom: 8px;'
            }, [
              h('input', {
                class: 'v-field__input',
                placeholder: 'Поиск кампаний...',
                value: searchQuery.value,
                onInput: (e) => searchQuery.value = e.target.value
              })
            ])
          ]),
          h('div', { class: 'col-md-2' }, [
            h('select', {
              class: 'v-select__selection',
              style: 'width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;',
              value: statusFilter.value || '',
              onChange: (e) => statusFilter.value = e.target.value || null
            }, [
              h('option', { value: '' }, 'Все статусы'),
              ...statusOptions.map(opt => h('option', { value: opt.value }, opt.title))
            ])
          ]),
          h('div', { class: 'col-md-2' }, [
            h('select', {
              class: 'v-select__selection',
              style: 'width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;',
              value: channelFilter.value || '',
              onChange: (e) => channelFilter.value = e.target.value || null
            }, [
              h('option', { value: '' }, 'Все каналы'),
              ...channelOptions.map(opt => h('option', { value: opt.value }, opt.title))
            ])
          ]),
          h('div', { class: 'col-md-2' }, [
            h('select', {
              class: 'v-select__selection',
              style: 'width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;',
              value: categoryFilter.value || '',
              onChange: (e) => categoryFilter.value = e.target.value || null
            }, [
              h('option', { value: '' }, 'Все категории'),
              ...categoryOptions.map(opt => h('option', { value: opt.value }, opt.title))
            ])
          ])
        ])
      ]),

      // Campaigns table
      h('div', { class: 'v-card' }, [
        h('div', { class: 'v-table v-theme--light' }, [
          h('div', { class: 'v-table__wrapper' }, [
            h('table', {}, [
              h('thead', {}, [
                h('tr', {}, [
                  h('th', { class: 'text-left font-weight-medium' }, 'Название'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Статус'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Канал'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Бюджет'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Период'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Действия')
                ])
              ]),
              h('tbody', {}, [
                ...campaigns.value
                  .filter(campaign =>
                    !searchQuery.value ||
                    campaign.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                    campaign.responsible_manager.toLowerCase().includes(searchQuery.value.toLowerCase())
                  )
                  .map(campaign =>
                    h('tr', {
                      key: campaign.campaign_id,
                      class: 'cursor-pointer hover:bg-grey-lighten-5',
                      style: 'border-bottom: 1px solid #e0e0e0;'
                    }, [
                      h('td', { class: 'py-3' }, [
                        h('div', {}, [
                          h('div', { class: 'font-weight-medium text-body-2' }, campaign.name),
                          h('div', { class: 'text-caption text-medium-emphasis' }, campaign.responsible_manager)
                        ])
                      ]),
                      h('td', { class: 'py-3' }, [
                        h('span', {
                          class: `v-chip v-chip--density-default v-chip--size-small v-chip--variant-flat bg-${getStatusColor(campaign.status)}`
                        }, getStatusText(campaign.status))
                      ]),
                      h('td', { class: 'py-3' }, [
                        h('span', {
                          class: `v-chip v-chip--density-default v-chip--size-small v-chip--variant-tonal text-${getChannelColor(campaign.channel)}`
                        }, campaign.channel.toUpperCase())
                      ]),
                      h('td', { class: 'py-3' }, campaign.budget_display),
                      h('td', { class: 'py-3 text-caption' }, campaign.date_range),
                      h('td', { class: 'py-3' }, [
                        h('div', { class: 'd-flex ga-1' }, [
                          h('button', {
                            class: 'v-btn v-btn--density-comfortable v-btn--size-small v-btn--variant-text',
                            onClick: () => editCampaign(campaign)
                          }, 'Редактировать'),
                          h('button', {
                            class: `v-btn v-btn--density-comfortable v-btn--size-small v-btn--variant-text text-${campaign.status === 'active' ? 'warning' : 'success'}`,
                            onClick: () => toggleCampaignStatus(campaign)
                          }, campaign.status === 'active' ? 'Пауза' : 'Запуск'),
                          h('button', {
                            class: 'v-btn v-btn--density-comfortable v-btn--size-small v-btn--variant-text',
                            onClick: () => duplicateCampaign(campaign)
                          }, 'Копировать')
                        ])
                      ])
                    ])
                  )
              ])
            ])
          ])
        ])
      ])
    ])
  }
}

// Campaign Planning Component
const CampaignPlanning = {
  name: 'CampaignPlanning',
  setup() {
    const planningDialog = ref(false)
    const selectedTemplate = ref('')
    const planningData = ref({
      name: '',
      objective: '',
      budget: null,
      startDate: '',
      endDate: '',
      targetAudience: '',
      channels: [],
      products: []
    })

    const campaignTemplates = [
      {
        id: 'product_launch',
        title: 'Запуск продукта',
        description: 'Комплексная кампания для запуска нового продукта',
        icon: 'mdi-rocket-launch',
        suggestedBudget: '300000-500000',
        duration: '30-45 дней',
        channels: ['meta', 'google', 'yandex']
      },
      {
        id: 'brand_awareness',
        title: 'Повышение узнаваемости',
        description: 'Брендинговая кампания для увеличения узнаваемости',
        icon: 'mdi-bullhorn',
        suggestedBudget: '200000-400000',
        duration: '60-90 дней',
        channels: ['meta', 'tiktok', 'youtube']
      },
      {
        id: 'sales_boost',
        title: 'Увеличение продаж',
        description: 'Перформанс-кампания для роста конверсий',
        icon: 'mdi-trending-up',
        suggestedBudget: '100000-300000',
        duration: '14-30 дней',
        channels: ['google', 'yandex', 'meta']
      },
      {
        id: 'retention',
        title: 'Удержание клиентов',
        description: 'Ретаргетинг и удержание существующих клиентов',
        icon: 'mdi-account-heart',
        suggestedBudget: '50000-150000',
        duration: '30-60 дней',
        channels: ['meta', 'yandex', 'email']
      }
    ]

    const availableChannels = [
      { title: 'Meta (Facebook/Instagram)', value: 'meta', icon: 'mdi-facebook' },
      { title: 'Google Ads', value: 'google', icon: 'mdi-google' },
      { title: 'Яндекс.Директ', value: 'yandex', icon: 'mdi-alpha-y-circle' },
      { title: 'TikTok', value: 'tiktok', icon: 'mdi-music-note' },
      { title: 'YouTube', value: 'youtube', icon: 'mdi-youtube' },
      { title: 'Email Marketing', value: 'email', icon: 'mdi-email' }
    ]

    const selectTemplate = (template) => {
      selectedTemplate.value = template.id
      planningData.value.channels = template.channels
      planningDialog.value = true
    }

    const createCampaignPlan = async () => {
      try {
        // Create campaign plan logic here
        showSnackbar('План кампании создан успешно', 'success')
        planningDialog.value = false
        resetForm()
      } catch (error) {
        showSnackbar('Ошибка при создании плана', 'error')
      }
    }

    const resetForm = () => {
      selectedTemplate.value = ''
      planningData.value = {
        name: '',
        objective: '',
        budget: null,
        startDate: '',
        endDate: '',
        targetAudience: '',
        channels: [],
        products: []
      }
    }

    return () => h('div', { class: 'campaign-planning' }, [
      h('div', { class: 'mb-6' }, [
        h('h2', { class: 'text-h5 font-weight-bold mb-2' }, 'Планирование кампаний'),
        h('p', { class: 'text-body-2 text-medium-emphasis' },
          'Создавайте стратегические планы кампаний на основе готовых шаблонов')
      ]),

      // Campaign templates grid
      h('div', { class: 'row' }, [
        ...campaignTemplates.map(template =>
          h('div', { key: template.id, class: 'col-md-6 col-lg-4 mb-4' }, [
            h('div', {
              class: 'v-card v-card--density-default v-card--variant-elevated',
              style: 'height: 100%; cursor: pointer; transition: transform 0.2s;',
              onClick: () => selectTemplate(template),
              onMouseover: (e) => e.target.style.transform = 'translateY(-2px)',
              onMouseout: (e) => e.target.style.transform = 'translateY(0)'
            }, [
              h('div', { class: 'v-card-text pa-6' }, [
                h('div', { class: 'd-flex align-center mb-4' }, [
                  h('div', {
                    class: 'v-avatar v-avatar--density-default v-avatar--size-default mr-3',
                    style: 'background-color: rgb(var(--v-theme-primary)); color: white;'
                  }, [
                    h('i', { class: `${template.icon} text-h6` })
                  ]),
                  h('div', {}, [
                    h('h3', { class: 'text-h6 font-weight-bold mb-1' }, template.title),
                    h('div', { class: 'text-caption text-medium-emphasis' }, `${template.duration} • ${template.suggestedBudget} ₽`)
                  ])
                ]),
                h('p', { class: 'text-body-2 text-medium-emphasis mb-4' }, template.description),
                h('div', { class: 'd-flex flex-wrap ga-1' }, [
                  ...template.channels.map(channel =>
                    h('span', {
                      key: channel,
                      class: 'v-chip v-chip--density-default v-chip--size-small v-chip--variant-tonal'
                    }, channel.toUpperCase())
                  )
                ])
              ]),
              h('div', { class: 'v-card-actions pa-4 pt-0' }, [
                h('button', {
                  class: 'v-btn v-btn--density-default v-btn--size-default v-btn--variant-outlined',
                  style: 'width: 100%;'
                }, 'Выбрать шаблон')
              ])
            ])
          ])
        )
      ]),

      // Recent plans section
      h('div', { class: 'mt-8' }, [
        h('h3', { class: 'text-h6 font-weight-bold mb-4' }, 'Недавние планы'),
        h('div', { class: 'v-card' }, [
          h('div', { class: 'v-card-text' }, [
            h('div', { class: 'text-center py-8' }, [
              h('i', { class: 'mdi mdi-file-document-outline text-h2 text-medium-emphasis mb-4' }),
              h('p', { class: 'text-body-2 text-medium-emphasis' }, 'Здесь будут отображаться ваши недавние планы кампаний')
            ])
          ])
        ])
      ]),

      // Planning dialog
      planningDialog.value ? h('div', {
        class: 'v-overlay v-overlay--active',
        style: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;'
      }, [
        h('div', {
          class: 'v-card v-card--density-default v-card--variant-elevated',
          style: 'width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;'
        }, [
          h('div', { class: 'v-card-title d-flex align-center pa-4' }, [
            h('h2', { class: 'text-h6' }, 'Создание плана кампании'),
            h('div', { class: 'ml-auto' }, [
              h('button', {
                class: 'v-btn v-btn--icon v-btn--density-comfortable v-btn--size-default v-btn--variant-text',
                onClick: () => planningDialog.value = false
              }, [
                h('i', { class: 'mdi mdi-close' })
              ])
            ])
          ]),
          h('div', { class: 'v-card-text pa-4' }, [
            h('div', { class: 'mb-4' }, [
              h('label', { class: 'v-label text-body-2 font-weight-medium mb-2 d-block' }, 'Название кампании'),
              h('input', {
                class: 'v-field__input',
                style: 'width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px;',
                placeholder: 'Введите название кампании',
                value: planningData.value.name,
                onInput: (e) => planningData.value.name = e.target.value
              })
            ]),
            h('div', { class: 'mb-4' }, [
              h('label', { class: 'v-label text-body-2 font-weight-medium mb-2 d-block' }, 'Цель кампании'),
              h('textarea', {
                class: 'v-field__input',
                style: 'width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px; min-height: 80px; resize: vertical;',
                placeholder: 'Опишите основную цель кампании',
                value: planningData.value.objective,
                onInput: (e) => planningData.value.objective = e.target.value
              })
            ]),
            h('div', { class: 'row mb-4' }, [
              h('div', { class: 'col-md-6' }, [
                h('label', { class: 'v-label text-body-2 font-weight-medium mb-2 d-block' }, 'Бюджет (₽)'),
                h('input', {
                  class: 'v-field__input',
                  style: 'width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px;',
                  type: 'number',
                  placeholder: '100000',
                  value: planningData.value.budget || '',
                  onInput: (e) => planningData.value.budget = Number(e.target.value)
                })
              ]),
              h('div', { class: 'col-md-6' }, [
                h('label', { class: 'v-label text-body-2 font-weight-medium mb-2 d-block' }, 'Целевая аудитория'),
                h('input', {
                  class: 'v-field__input',
                  style: 'width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px;',
                  placeholder: 'Опишите ЦА',
                  value: planningData.value.targetAudience,
                  onInput: (e) => planningData.value.targetAudience = e.target.value
                })
              ])
            ]),
            h('div', { class: 'mb-4' }, [
              h('label', { class: 'v-label text-body-2 font-weight-medium mb-2 d-block' }, 'Каналы размещения'),
              h('div', { class: 'd-flex flex-wrap ga-2' }, [
                ...availableChannels.map(channel =>
                  h('label', { key: channel.value, class: 'd-flex align-center' }, [
                    h('input', {
                      type: 'checkbox',
                      class: 'mr-2',
                      checked: planningData.value.channels.includes(channel.value),
                      onChange: (e) => {
                        if (e.target.checked) {
                          planningData.value.channels.push(channel.value)
                        } else {
                          const index = planningData.value.channels.indexOf(channel.value)
                          if (index > -1) planningData.value.channels.splice(index, 1)
                        }
                      }
                    }),
                    h('span', { class: 'text-body-2' }, channel.title)
                  ])
                )
              ])
            ])
          ]),
          h('div', { class: 'v-card-actions pa-4 d-flex justify-end ga-2' }, [
            h('button', {
              class: 'v-btn v-btn--density-default v-btn--size-default v-btn--variant-text',
              onClick: () => planningDialog.value = false
            }, 'Отмена'),
            h('button', {
              class: 'v-btn v-btn--density-default v-btn--size-default v-btn--variant-elevated text-white',
              style: 'background-color: rgb(var(--v-theme-primary));',
              onClick: createCampaignPlan
            }, 'Создать план')
          ])
        ])
      ]) : null
    ])
  }
}

// Campaign Hierarchy Component
const CampaignHierarchy = {
  name: 'CampaignHierarchy',
  setup() {
    const selectedLevel = ref('all')
    const expandedNodes = ref(new Set(['program_1', 'campaign_1_1']))
    const showCreateDialog = ref(false)
    const newNodeData = ref({ name: '', level: 'Campaign', parent: null })

    // Simulate hierarchy data
    const hierarchyData = ref([
      {
        id: 'program_1',
        name: 'Программа новогодние продажи 2025',
        level: 'Program',
        status: 'active',
        budget: 2000000,
        startDate: '2024-12-01',
        endDate: '2025-01-31',
        children: [
          {
            id: 'campaign_1_1',
            name: 'Кампания мебель',
            level: 'Campaign',
            status: 'active',
            budget: 800000,
            channel: 'meta',
            children: [
              {
                id: 'flight_1_1_1',
                name: 'Флайт 1: Предновогодние скидки',
                level: 'Flight',
                status: 'completed',
                budget: 300000,
                startDate: '2024-12-01',
                endDate: '2024-12-20',
                children: [
                  {
                    id: 'tactic_1_1_1_1',
                    name: 'Карусель с мебелью',
                    level: 'Tactic',
                    status: 'completed',
                    budget: 150000,
                    creativeFormat: 'carousel'
                  },
                  {
                    id: 'tactic_1_1_1_2',
                    name: 'Видео обзоры',
                    level: 'Tactic',
                    status: 'completed',
                    budget: 150000,
                    creativeFormat: 'video'
                  }
                ]
              },
              {
                id: 'flight_1_1_2',
                name: 'Флайт 2: Новогодняя распродажа',
                level: 'Flight',
                status: 'active',
                budget: 500000,
                startDate: '2024-12-21',
                endDate: '2025-01-15'
              }
            ]
          },
          {
            id: 'campaign_1_2',
            name: 'Кампания товары для творчества',
            level: 'Campaign',
            status: 'active',
            budget: 600000,
            channel: 'google'
          },
          {
            id: 'campaign_1_3',
            name: 'Ретаргетинг кампания',
            level: 'Campaign',
            status: 'active',
            budget: 400000,
            channel: 'yandex'
          }
        ]
      },
      {
        id: 'program_2',
        name: 'Программа весенний сезон 2025',
        level: 'Program',
        status: 'draft',
        budget: 1500000,
        startDate: '2025-03-01',
        endDate: '2025-05-31'
      }
    ])

    const levelOptions = [
      { title: 'Все уровни', value: 'all' },
      { title: 'Программы', value: 'Program' },
      { title: 'Кампании', value: 'Campaign' },
      { title: 'Флайты', value: 'Flight' },
      { title: 'Тактики', value: 'Tactic' },
      { title: 'Размещения', value: 'Placement' }
    ]

    const toggleNode = (nodeId) => {
      if (expandedNodes.value.has(nodeId)) {
        expandedNodes.value.delete(nodeId)
      } else {
        expandedNodes.value.add(nodeId)
      }
      expandedNodes.value = new Set(expandedNodes.value)
    }

    const getStatusColor = (status) => {
      const colors = {
        'active': 'success',
        'completed': 'info',
        'paused': 'warning',
        'draft': 'default'
      }
      return colors[status] || 'default'
    }

    const getLevelIcon = (level) => {
      const icons = {
        'Program': 'mdi-folder-multiple',
        'Campaign': 'mdi-bullhorn',
        'Flight': 'mdi-airplane',
        'Tactic': 'mdi-strategy',
        'Placement': 'mdi-web'
      }
      return icons[level] || 'mdi-circle'
    }

    const formatBudget = (budget) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(budget)
    }

    const renderNode = (node, depth = 0) => {
      const isExpanded = expandedNodes.value.has(node.id)
      const hasChildren = node.children && node.children.length > 0
      const shouldShow = selectedLevel.value === 'all' || selectedLevel.value === node.level

      if (!shouldShow) return null

      return h('div', { key: node.id, class: 'hierarchy-node' }, [
        h('div', {
          class: 'node-content d-flex align-center pa-3 mb-2',
          style: `margin-left: ${depth * 24}px; border: 1px solid #e0e0e0; border-radius: 8px; background: white; cursor: pointer;`,
          onClick: () => hasChildren && toggleNode(node.id)
        }, [
          hasChildren ? h('button', {
            class: 'v-btn v-btn--icon v-btn--density-comfortable v-btn--size-small v-btn--variant-text mr-2',
            onClick: (e) => {
              e.stopPropagation()
              toggleNode(node.id)
            }
          }, [
            h('i', {
              class: `mdi ${isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'}`,
              style: 'transition: transform 0.2s;'
            })
          ]) : h('div', { style: 'width: 40px;' }),

          h('div', { class: 'mr-3' }, [
            h('i', {
              class: `${getLevelIcon(node.level)} text-h6`,
              style: `color: ${node.level === 'Program' ? '#1976d2' : node.level === 'Campaign' ? '#388e3c' : node.level === 'Flight' ? '#f57c00' : node.level === 'Tactic' ? '#7b1fa2' : '#424242'};`
            })
          ]),

          h('div', { class: 'flex-grow-1' }, [
            h('div', { class: 'd-flex align-center mb-1' }, [
              h('h3', { class: 'text-subtitle-1 font-weight-medium mr-3' }, node.name),
              h('span', {
                class: `v-chip v-chip--density-default v-chip--size-small v-chip--variant-flat bg-${getStatusColor(node.status)}`
              }, node.status),
              node.channel ? h('span', {
                class: 'v-chip v-chip--density-default v-chip--size-small v-chip--variant-tonal ml-2'
              }, node.channel.toUpperCase()) : null
            ]),
            h('div', { class: 'd-flex align-center text-caption text-medium-emphasis' }, [
              h('span', { class: 'mr-4' }, `Уровень: ${node.level}`),
              h('span', { class: 'mr-4' }, `Бюджет: ${formatBudget(node.budget)}`),
              node.startDate ? h('span', {}, `${new Date(node.startDate).toLocaleDateString('ru-RU')} - ${node.endDate ? new Date(node.endDate).toLocaleDateString('ru-RU') : 'Не ограничено'}`) : null
            ])
          ]),

          h('div', { class: 'd-flex ga-1' }, [
            h('button', {
              class: 'v-btn v-btn--density-comfortable v-btn--size-small v-btn--variant-text',
              onClick: (e) => {
                e.stopPropagation()
                // Edit node logic
              }
            }, 'Редактировать'),
            h('button', {
              class: 'v-btn v-btn--density-comfortable v-btn--size-small v-btn--variant-text text-success',
              onClick: (e) => {
                e.stopPropagation()
                newNodeData.value.parent = node.id
                showCreateDialog.value = true
              }
            }, 'Добавить')
          ])
        ]),

        hasChildren && isExpanded ? h('div', { class: 'node-children' }, [
          ...node.children.map(child => renderNode(child, depth + 1))
        ]) : null
      ])
    }

    return () => h('div', { class: 'campaign-hierarchy' }, [
      h('div', { class: 'mb-6' }, [
        h('div', { class: 'd-flex align-center justify-space-between mb-4' }, [
          h('div', {}, [
            h('h2', { class: 'text-h5 font-weight-bold mb-2' }, 'Иерархия кампаний'),
            h('p', { class: 'text-body-2 text-medium-emphasis' },
              'Многоуровневая структура: Программа → Кампания → Флайт → Тактика → Размещение')
          ]),
          h('button', {
            class: 'v-btn v-btn--density-default v-btn--size-default v-btn--variant-elevated text-white',
            style: 'background-color: rgb(var(--v-theme-primary));',
            onClick: () => {
              newNodeData.value.parent = null
              showCreateDialog.value = true
            }
          }, 'Создать программу')
        ]),

        // Filter by level
        h('div', { class: 'mb-4' }, [
          h('select', {
            class: 'v-select__selection',
            style: 'width: 200px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;',
            value: selectedLevel.value,
            onChange: (e) => selectedLevel.value = e.target.value
          }, [
            ...levelOptions.map(opt => h('option', { value: opt.value }, opt.title))
          ])
        ])
      ]),

      // Hierarchy tree
      h('div', { class: 'hierarchy-tree' }, [
        ...hierarchyData.value.map(node => renderNode(node))
      ]),

      // Create new node dialog
      showCreateDialog.value ? h('div', {
        class: 'v-overlay v-overlay--active',
        style: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;'
      }, [
        h('div', {
          class: 'v-card v-card--density-default v-card--variant-elevated',
          style: 'width: 90%; max-width: 500px;'
        }, [
          h('div', { class: 'v-card-title d-flex align-center pa-4' }, [
            h('h2', { class: 'text-h6' }, 'Создание нового узла'),
            h('div', { class: 'ml-auto' }, [
              h('button', {
                class: 'v-btn v-btn--icon v-btn--density-comfortable v-btn--size-default v-btn--variant-text',
                onClick: () => showCreateDialog.value = false
              }, [
                h('i', { class: 'mdi mdi-close' })
              ])
            ])
          ]),
          h('div', { class: 'v-card-text pa-4' }, [
            h('div', { class: 'mb-4' }, [
              h('label', { class: 'v-label text-body-2 font-weight-medium mb-2 d-block' }, 'Название'),
              h('input', {
                class: 'v-field__input',
                style: 'width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px;',
                placeholder: 'Введите название',
                value: newNodeData.value.name,
                onInput: (e) => newNodeData.value.name = e.target.value
              })
            ]),
            h('div', { class: 'mb-4' }, [
              h('label', { class: 'v-label text-body-2 font-weight-medium mb-2 d-block' }, 'Уровень'),
              h('select', {
                class: 'v-select__selection',
                style: 'width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px;',
                value: newNodeData.value.level,
                onChange: (e) => newNodeData.value.level = e.target.value
              }, [
                h('option', { value: 'Program' }, 'Программа'),
                h('option', { value: 'Campaign' }, 'Кампания'),
                h('option', { value: 'Flight' }, 'Флайт'),
                h('option', { value: 'Tactic' }, 'Тактика'),
                h('option', { value: 'Placement' }, 'Размещение')
              ])
            ])
          ]),
          h('div', { class: 'v-card-actions pa-4 d-flex justify-end ga-2' }, [
            h('button', {
              class: 'v-btn v-btn--density-default v-btn--size-default v-btn--variant-text',
              onClick: () => showCreateDialog.value = false
            }, 'Отмена'),
            h('button', {
              class: 'v-btn v-btn--density-default v-btn--size-default v-btn--variant-elevated text-white',
              style: 'background-color: rgb(var(--v-theme-primary));',
              onClick: () => {
                showSnackbar(`Узел "${newNodeData.value.name}" создан`, 'success')
                showCreateDialog.value = false
                newNodeData.value = { name: '', level: 'Campaign', parent: null }
              }
            }, 'Создать')
          ])
        ])
      ]) : null
    ])
  }
}

// Campaign Budgets Component
const CampaignBudgets = {
  name: 'CampaignBudgets',
  setup() {
    const budgetView = ref('overview')
    const selectedPeriod = ref('current')
    const showBudgetDialog = ref(false)
    const newBudgetData = ref({ name: '', amount: null, campaign_id: '' })

    // Mock budget data combining campaigns with budget info
    const budgetData = ref([
      {
        campaign_id: 'camp_2025_001',
        campaign_name: 'Новогодняя распродажа 2025 - Мебель',
        channel: 'meta',
        budget_allocated: 500000,
        budget_spent: 175000,
        budget_remaining: 325000,
        spend_rate: 35,
        daily_spend: 8750,
        avg_cpc: 12.5,
        avg_cpm: 120,
        status: 'active',
        start_date: '2024-12-15',
        end_date: '2025-01-15',
        performance: {
          impressions: 1450000,
          clicks: 14500,
          conversions: 290,
          revenue: 580000
        }
      },
      {
        campaign_id: 'camp_2025_003',
        campaign_name: 'Поисковая реклама - Товары для творчества',
        channel: 'google',
        budget_allocated: 450000,
        budget_spent: 315000,
        budget_remaining: 135000,
        spend_rate: 70,
        daily_spend: 15000,
        avg_cpc: 18.5,
        avg_cpm: 0,
        status: 'active',
        start_date: '2024-12-01',
        end_date: null,
        performance: {
          impressions: 0,
          clicks: 17000,
          conversions: 425,
          revenue: 765000
        }
      },
      {
        campaign_id: 'camp_2025_004',
        campaign_name: 'Ретаргетинг - Просмотрели товары',
        channel: 'yandex',
        budget_allocated: 240000,
        budget_spent: 89000,
        budget_remaining: 151000,
        spend_rate: 37,
        daily_spend: 8000,
        avg_cpc: 15.2,
        avg_cpm: 95,
        status: 'active',
        start_date: '2024-12-10',
        end_date: '2025-02-28',
        performance: {
          impressions: 937000,
          clicks: 5850,
          conversions: 178,
          revenue: 356000
        }
      },
      {
        campaign_id: 'camp_2025_005',
        campaign_name: 'Lookalike - Похожие на покупателей',
        channel: 'meta',
        budget_allocated: 360000,
        budget_spent: 0,
        budget_remaining: 360000,
        spend_rate: 0,
        daily_spend: 0,
        avg_cpc: 0,
        avg_cpm: 0,
        status: 'paused',
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        performance: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0
        }
      }
    ])

    const periodOptions = [
      { title: 'Текущий месяц', value: 'current' },
      { title: 'Последние 30 дней', value: '30d' },
      { title: 'Последние 90 дней', value: '90d' },
      { title: 'Весь год', value: 'year' }
    ]

    const totalBudgetAllocated = computed(() => {
      return budgetData.value.reduce((sum, item) => sum + item.budget_allocated, 0)
    })

    const totalBudgetSpent = computed(() => {
      return budgetData.value.reduce((sum, item) => sum + item.budget_spent, 0)
    })

    const totalBudgetRemaining = computed(() => {
      return budgetData.value.reduce((sum, item) => sum + item.budget_remaining, 0)
    })

    const avgSpendRate = computed(() => {
      const activeCampaigns = budgetData.value.filter(item => item.status === 'active')
      if (activeCampaigns.length === 0) return 0
      return Math.round(activeCampaigns.reduce((sum, item) => sum + item.spend_rate, 0) / activeCampaigns.length)
    })

    const totalRevenue = computed(() => {
      return budgetData.value.reduce((sum, item) => sum + item.performance.revenue, 0)
    })

    const totalROAS = computed(() => {
      return totalBudgetSpent.value > 0 ? (totalRevenue.value / totalBudgetSpent.value).toFixed(2) : 0
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const formatNumber = (num) => {
      return new Intl.NumberFormat('ru-RU').format(num)
    }

    const getStatusColor = (status) => {
      return status === 'active' ? 'success' : status === 'paused' ? 'warning' : 'default'
    }

    const getChannelColor = (channel) => {
      const colors = {
        'meta': 'blue',
        'google': 'green',
        'yandex': 'red',
        'tiktok': 'purple'
      }
      return colors[channel] || 'grey'
    }

    const getSpendRateColor = (rate) => {
      if (rate < 30) return 'success'
      if (rate < 70) return 'warning'
      return 'error'
    }

    const calculateProgressWidth = (spent, allocated) => {
      return allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0
    }

    return () => h('div', { class: 'campaign-budgets' }, [
      h('div', { class: 'mb-6' }, [
        h('div', { class: 'd-flex align-center justify-space-between mb-4' }, [
          h('div', {}, [
            h('h2', { class: 'text-h5 font-weight-bold mb-2' }, 'Бюджеты кампаний'),
            h('p', { class: 'text-body-2 text-medium-emphasis' },
              'Мониторинг расходов, эффективности и ROAS по всем кампаниям')
          ]),
          h('div', { class: 'd-flex ga-2' }, [
            h('select', {
              class: 'v-select__selection',
              style: 'padding: 8px; border: 1px solid #ccc; border-radius: 4px;',
              value: selectedPeriod.value,
              onChange: (e) => selectedPeriod.value = e.target.value
            }, [
              ...periodOptions.map(opt => h('option', { value: opt.value }, opt.title))
            ]),
            h('button', {
              class: 'v-btn v-btn--density-default v-btn--size-default v-btn--variant-elevated text-white',
              style: 'background-color: rgb(var(--v-theme-primary));',
              onClick: () => showBudgetDialog.value = true
            }, 'Новый бюджет')
          ])
        ])
      ]),

      // Summary cards
      h('div', { class: 'row mb-6' }, [
        h('div', { class: 'col-md-3 mb-4' }, [
          h('div', { class: 'v-card h-100' }, [
            h('div', { class: 'v-card-text pa-4' }, [
              h('div', { class: 'd-flex align-center mb-2' }, [
                h('div', {
                  class: 'v-avatar v-avatar--density-default v-avatar--size-default mr-3 bg-primary'
                }, [
                  h('i', { class: 'mdi mdi-wallet text-white' })
                ]),
                h('div', {}, [
                  h('div', { class: 'text-caption text-medium-emphasis' }, 'Общий бюджет'),
                  h('div', { class: 'text-h6 font-weight-bold' }, formatCurrency(totalBudgetAllocated.value))
                ])
              ])
            ])
          ])
        ]),
        h('div', { class: 'col-md-3 mb-4' }, [
          h('div', { class: 'v-card h-100' }, [
            h('div', { class: 'v-card-text pa-4' }, [
              h('div', { class: 'd-flex align-center mb-2' }, [
                h('div', {
                  class: 'v-avatar v-avatar--density-default v-avatar--size-default mr-3 bg-error'
                }, [
                  h('i', { class: 'mdi mdi-cash-minus text-white' })
                ]),
                h('div', {}, [
                  h('div', { class: 'text-caption text-medium-emphasis' }, 'Потрачено'),
                  h('div', { class: 'text-h6 font-weight-bold text-error' }, formatCurrency(totalBudgetSpent.value))
                ])
              ])
            ])
          ])
        ]),
        h('div', { class: 'col-md-3 mb-4' }, [
          h('div', { class: 'v-card h-100' }, [
            h('div', { class: 'v-card-text pa-4' }, [
              h('div', { class: 'd-flex align-center mb-2' }, [
                h('div', {
                  class: 'v-avatar v-avatar--density-default v-avatar--size-default mr-3 bg-success'
                }, [
                  h('i', { class: 'mdi mdi-cash-plus text-white' })
                ]),
                h('div', {}, [
                  h('div', { class: 'text-caption text-medium-emphasis' }, 'Осталось'),
                  h('div', { class: 'text-h6 font-weight-bold text-success' }, formatCurrency(totalBudgetRemaining.value))
                ])
              ])
            ])
          ])
        ]),
        h('div', { class: 'col-md-3 mb-4' }, [
          h('div', { class: 'v-card h-100' }, [
            h('div', { class: 'v-card-text pa-4' }, [
              h('div', { class: 'd-flex align-center mb-2' }, [
                h('div', {
                  class: 'v-avatar v-avatar--density-default v-avatar--size-default mr-3 bg-info'
                }, [
                  h('i', { class: 'mdi mdi-chart-line text-white' })
                ]),
                h('div', {}, [
                  h('div', { class: 'text-caption text-medium-emphasis' }, 'ROAS'),
                  h('div', { class: 'text-h6 font-weight-bold text-info' }, `${totalROAS.value}x`)
                ])
              ])
            ])
          ])
        ])
      ]),

      // Budget table
      h('div', { class: 'v-card' }, [
        h('div', { class: 'v-card-title pa-4' }, [
          h('h3', { class: 'text-h6' }, 'Детальная информация по кампаниям')
        ]),
        h('div', { class: 'v-table v-theme--light' }, [
          h('div', { class: 'v-table__wrapper' }, [
            h('table', {}, [
              h('thead', {}, [
                h('tr', {}, [
                  h('th', { class: 'text-left font-weight-medium' }, 'Кампания'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Бюджет'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Потрачено'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Осталось'),
                  h('th', { class: 'text-left font-weight-medium' }, 'ROAS'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Статус'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Действия')
                ])
              ]),
              h('tbody', {}, [
                ...budgetData.value.map(campaign => {
                  const roas = campaign.budget_spent > 0 ? (campaign.performance.revenue / campaign.budget_spent).toFixed(2) : '0.00'
                  const progressWidth = calculateProgressWidth(campaign.budget_spent, campaign.budget_allocated)

                  return h('tr', {
                    key: campaign.campaign_id,
                    style: 'border-bottom: 1px solid #e0e0e0;'
                  }, [
                    h('td', { class: 'py-4' }, [
                      h('div', {}, [
                        h('div', { class: 'font-weight-medium text-body-2 mb-1' }, campaign.campaign_name),
                        h('div', { class: 'd-flex align-center ga-2' }, [
                          h('span', {
                            class: `v-chip v-chip--density-default v-chip--size-small v-chip--variant-tonal text-${getChannelColor(campaign.channel)}`
                          }, campaign.channel.toUpperCase()),
                          h('span', { class: 'text-caption text-medium-emphasis' },
                            `Ср. CPC: ${formatCurrency(campaign.avg_cpc)}`)
                        ])
                      ])
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', {}, [
                        h('div', { class: 'font-weight-medium mb-1' }, formatCurrency(campaign.budget_allocated)),
                        h('div', { class: 'text-caption text-medium-emphasis' },
                          `Тратится: ${formatCurrency(campaign.daily_spend)}/день`),
                        h('div', {
                          class: 'mt-2',
                          style: 'width: 100px; height: 4px; background-color: #e0e0e0; border-radius: 2px; overflow: hidden;'
                        }, [
                          h('div', {
                            class: `bg-${getSpendRateColor(campaign.spend_rate)}`,
                            style: `width: ${progressWidth}%; height: 100%; transition: width 0.3s;`
                          })
                        ])
                      ])
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: `font-weight-medium text-${getSpendRateColor(campaign.spend_rate)}` },
                        formatCurrency(campaign.budget_spent)),
                      h('div', { class: 'text-caption text-medium-emphasis' },
                        `${campaign.spend_rate}% от бюджета`)
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'font-weight-medium text-success' }, formatCurrency(campaign.budget_remaining))
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'font-weight-medium' }, `${roas}x`),
                      h('div', { class: 'text-caption text-medium-emphasis' },
                        `Доход: ${formatCurrency(campaign.performance.revenue)}`)
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('span', {
                        class: `v-chip v-chip--density-default v-chip--size-small v-chip--variant-flat bg-${getStatusColor(campaign.status)}`
                      }, campaign.status === 'active' ? 'Активна' : 'Пауза')
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'd-flex ga-1' }, [
                        h('button', {
                          class: 'v-btn v-btn--density-comfortable v-btn--size-small v-btn--variant-text',
                          onClick: () => {
                            // Edit budget logic
                          }
                        }, 'Редактировать'),
                        h('button', {
                          class: 'v-btn v-btn--density-comfortable v-btn--size-small v-btn--variant-text text-info',
                          onClick: () => {
                            // View details logic
                          }
                        }, 'Подробно')
                      ])
                    ])
                  ])
                })
              ])
            ])
          ])
        ])
      ])
    ])
  }
}

// Campaign Performance Component
const CampaignPerformance = {
  name: 'CampaignPerformance',
  setup() {
    const selectedMetric = ref('revenue')
    const selectedPeriod = ref('30d')
    const comparisonEnabled = ref(false)

    // Mock performance data
    const performanceData = ref([
      {
        campaign_id: 'camp_2025_001',
        campaign_name: 'Новогодняя распродажа - Мебель',
        channel: 'meta',
        status: 'active',
        metrics: {
          impressions: 1450000,
          clicks: 14500,
          conversions: 290,
          revenue: 580000,
          spend: 175000,
          ctr: 1.0,
          cpc: 12.07,
          cpm: 120.69,
          cpa: 603.45,
          roas: 3.31,
          cvr: 2.0
        },
        kpi_targets: {
          conversions: 350,
          roas: 3.2,
          cpa: 590
        },
        trend: {
          revenue: '+15%',
          conversions: '+8%',
          roas: '+5%'
        }
      },
      {
        campaign_id: 'camp_2025_003',
        campaign_name: 'Поисковая реклама - Товары для творчества',
        channel: 'google',
        status: 'active',
        metrics: {
          impressions: 0,
          clicks: 17000,
          conversions: 425,
          revenue: 765000,
          spend: 315000,
          ctr: 0,
          cpc: 18.53,
          cpm: 0,
          cpa: 741.18,
          roas: 2.43,
          cvr: 2.5
        },
        kpi_targets: {
          clicks: 1200,
          ctr: 4.5,
          cpc: 12.5
        },
        trend: {
          revenue: '+22%',
          conversions: '+12%',
          clicks: '+18%'
        }
      },
      {
        campaign_id: 'camp_2025_004',
        campaign_name: 'Ретаргетинг - Просмотрели товары',
        channel: 'yandex',
        status: 'active',
        metrics: {
          impressions: 937000,
          clicks: 5850,
          conversions: 178,
          revenue: 356000,
          spend: 89000,
          ctr: 0.62,
          cpc: 15.21,
          cpm: 95.0,
          cpa: 500.0,
          roas: 4.0,
          cvr: 3.04
        },
        kpi_targets: {
          conversions: 120,
          roas: 4.8,
          cpa: 400
        },
        trend: {
          revenue: '+35%',
          conversions: '+28%',
          roas: '+12%'
        }
      }
    ])

    const metricOptions = [
      { title: 'Доход', value: 'revenue', icon: 'mdi-currency-rub' },
      { title: 'Конверсии', value: 'conversions', icon: 'mdi-target' },
      { title: 'ROAS', value: 'roas', icon: 'mdi-chart-line' },
      { title: 'Клики', value: 'clicks', icon: 'mdi-cursor-default-click' },
      { title: 'Показы', value: 'impressions', icon: 'mdi-eye' }
    ]

    const periodOptions = [
      { title: 'Последние 7 дней', value: '7d' },
      { title: 'Последние 30 дней', value: '30d' },
      { title: 'Последние 90 дней', value: '90d' },
      { title: 'Весь год', value: 'year' }
    ]

    // Calculate totals
    const totalMetrics = computed(() => {
      return performanceData.value.reduce((acc, campaign) => {
        Object.keys(campaign.metrics).forEach(key => {
          acc[key] = (acc[key] || 0) + campaign.metrics[key]
        })
        return acc
      }, {})
    })

    const avgMetrics = computed(() => {
      const activeCampaigns = performanceData.value.filter(c => c.status === 'active')
      const count = activeCampaigns.length
      if (count === 0) return {}

      return {
        ctr: (activeCampaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / count).toFixed(2),
        cpc: (activeCampaigns.reduce((sum, c) => sum + c.metrics.cpc, 0) / count).toFixed(2),
        cpa: (activeCampaigns.reduce((sum, c) => sum + c.metrics.cpa, 0) / count).toFixed(2),
        roas: (activeCampaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / count).toFixed(2),
        cvr: (activeCampaigns.reduce((sum, c) => sum + c.metrics.cvr, 0) / count).toFixed(2)
      }
    })

    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toLocaleString('ru-RU')
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const formatPercent = (value) => {
      return `${value.toFixed(2)}%`
    }

    const getKPIStatus = (actual, target, type = 'higher_better') => {
      if (!target) return 'neutral'
      const ratio = actual / target
      if (type === 'lower_better') {
        return ratio <= 1 ? 'success' : ratio <= 1.1 ? 'warning' : 'error'
      } else {
        return ratio >= 1 ? 'success' : ratio >= 0.9 ? 'warning' : 'error'
      }
    }

    const getKPIIcon = (status) => {
      const icons = {
        'success': 'mdi-check-circle',
        'warning': 'mdi-alert-circle',
        'error': 'mdi-close-circle',
        'neutral': 'mdi-minus-circle'
      }
      return icons[status] || 'mdi-minus-circle'
    }

    const getTrendColor = (trend) => {
      if (trend.startsWith('+')) return 'success'
      if (trend.startsWith('-')) return 'error'
      return 'default'
    }

    const getChannelColor = (channel) => {
      const colors = {
        'meta': 'blue',
        'google': 'green',
        'yandex': 'red',
        'tiktok': 'purple'
      }
      return colors[channel] || 'grey'
    }

    return () => h('div', { class: 'campaign-performance' }, [
      h('div', { class: 'mb-6' }, [
        h('div', { class: 'd-flex align-center justify-space-between mb-4' }, [
          h('div', {}, [
            h('h2', { class: 'text-h5 font-weight-bold mb-2' }, 'Эффективность кампаний'),
            h('p', { class: 'text-body-2 text-medium-emphasis' },
              'Комплексный анализ ключевых метрик и KPI по всем кампаниям')
          ]),
          h('div', { class: 'd-flex ga-2' }, [
            h('select', {
              class: 'v-select__selection',
              style: 'padding: 8px; border: 1px solid #ccc; border-radius: 4px;',
              value: selectedPeriod.value,
              onChange: (e) => selectedPeriod.value = e.target.value
            }, [
              ...periodOptions.map(opt => h('option', { value: opt.value }, opt.title))
            ]),
            h('label', { class: 'd-flex align-center ga-2' }, [
              h('input', {
                type: 'checkbox',
                checked: comparisonEnabled.value,
                onChange: (e) => comparisonEnabled.value = e.target.checked
              }),
              h('span', { class: 'text-body-2' }, 'Сравнение периодов')
            ])
          ])
        ])
      ]),

      // Summary metrics cards
      h('div', { class: 'row mb-6' }, [
        h('div', { class: 'col-md-3 mb-4' }, [
          h('div', { class: 'v-card h-100' }, [
            h('div', { class: 'v-card-text pa-4' }, [
              h('div', { class: 'd-flex align-center justify-space-between mb-2' }, [
                h('div', {}, [
                  h('div', { class: 'text-caption text-medium-emphasis' }, 'Общий доход'),
                  h('div', { class: 'text-h6 font-weight-bold' }, formatCurrency(totalMetrics.value.revenue))
                ]),
                h('div', {
                  class: 'v-avatar v-avatar--density-default v-avatar--size-default bg-success'
                }, [
                  h('i', { class: 'mdi mdi-currency-rub text-white' })
                ])
              ]),
              h('div', { class: 'text-caption text-success font-weight-medium' }, '+18% к прошлому периоду')
            ])
          ])
        ]),
        h('div', { class: 'col-md-3 mb-4' }, [
          h('div', { class: 'v-card h-100' }, [
            h('div', { class: 'v-card-text pa-4' }, [
              h('div', { class: 'd-flex align-center justify-space-between mb-2' }, [
                h('div', {}, [
                  h('div', { class: 'text-caption text-medium-emphasis' }, 'Конверсии'),
                  h('div', { class: 'text-h6 font-weight-bold' }, formatNumber(totalMetrics.value.conversions))
                ]),
                h('div', {
                  class: 'v-avatar v-avatar--density-default v-avatar--size-default bg-primary'
                }, [
                  h('i', { class: 'mdi mdi-target text-white' })
                ])
              ]),
              h('div', { class: 'text-caption text-success font-weight-medium' }, '+12% к прошлому периоду')
            ])
          ])
        ]),
        h('div', { class: 'col-md-3 mb-4' }, [
          h('div', { class: 'v-card h-100' }, [
            h('div', { class: 'v-card-text pa-4' }, [
              h('div', { class: 'd-flex align-center justify-space-between mb-2' }, [
                h('div', {}, [
                  h('div', { class: 'text-caption text-medium-emphasis' }, 'Средний ROAS'),
                  h('div', { class: 'text-h6 font-weight-bold' }, `${avgMetrics.value.roas}x`)
                ]),
                h('div', {
                  class: 'v-avatar v-avatar--density-default v-avatar--size-default bg-info'
                }, [
                  h('i', { class: 'mdi mdi-chart-line text-white' })
                ])
              ]),
              h('div', { class: 'text-caption text-success font-weight-medium' }, '+8% к прошлому периоду')
            ])
          ])
        ]),
        h('div', { class: 'col-md-3 mb-4' }, [
          h('div', { class: 'v-card h-100' }, [
            h('div', { class: 'v-card-text pa-4' }, [
              h('div', { class: 'd-flex align-center justify-space-between mb-2' }, [
                h('div', {}, [
                  h('div', { class: 'text-caption text-medium-emphasis' }, 'Клики'),
                  h('div', { class: 'text-h6 font-weight-bold' }, formatNumber(totalMetrics.value.clicks))
                ]),
                h('div', {
                  class: 'v-avatar v-avatar--density-default v-avatar--size-default bg-warning'
                }, [
                  h('i', { class: 'mdi mdi-cursor-default-click text-white' })
                ])
              ]),
              h('div', { class: 'text-caption text-success font-weight-medium' }, '+15% к прошлому периоду')
            ])
          ])
        ])
      ]),

      // Performance table
      h('div', { class: 'v-card' }, [
        h('div', { class: 'v-card-title pa-4' }, [
          h('h3', { class: 'text-h6' }, 'Подробная статистика по кампаниям')
        ]),
        h('div', { class: 'v-table v-theme--light' }, [
          h('div', { class: 'v-table__wrapper' }, [
            h('table', {}, [
              h('thead', {}, [
                h('tr', {}, [
                  h('th', { class: 'text-left font-weight-medium' }, 'Кампания'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Показы'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Клики'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Конверсии'),
                  h('th', { class: 'text-left font-weight-medium' }, 'CPC/CPM'),
                  h('th', { class: 'text-left font-weight-medium' }, 'ROAS'),
                  h('th', { class: 'text-left font-weight-medium' }, 'KPI'),
                  h('th', { class: 'text-left font-weight-medium' }, 'Тренд')
                ])
              ]),
              h('tbody', {}, [
                ...performanceData.value.map(campaign => {
                  const kpiStatus = getKPIStatus(campaign.metrics.roas, campaign.kpi_targets.roas)

                  return h('tr', {
                    key: campaign.campaign_id,
                    style: 'border-bottom: 1px solid #e0e0e0;'
                  }, [
                    h('td', { class: 'py-4' }, [
                      h('div', {}, [
                        h('div', { class: 'font-weight-medium text-body-2 mb-1' }, campaign.campaign_name),
                        h('div', { class: 'd-flex align-center ga-2' }, [
                          h('span', {
                            class: `v-chip v-chip--density-default v-chip--size-small v-chip--variant-tonal text-${getChannelColor(campaign.channel)}`
                          }, campaign.channel.toUpperCase()),
                          h('span', { class: 'text-caption text-medium-emphasis' }, 'Активна')
                        ])
                      ])
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'font-weight-medium' }, formatNumber(campaign.metrics.impressions)),
                      campaign.metrics.cpm > 0 ? h('div', { class: 'text-caption text-medium-emphasis' },
                        `CPM: ${formatCurrency(campaign.metrics.cpm)}`) : null
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'font-weight-medium' }, formatNumber(campaign.metrics.clicks)),
                      h('div', { class: 'text-caption text-medium-emphasis' },
                        `CTR: ${formatPercent(campaign.metrics.ctr)}`)
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'font-weight-medium' }, formatNumber(campaign.metrics.conversions)),
                      h('div', { class: 'text-caption text-medium-emphasis' },
                        `CVR: ${formatPercent(campaign.metrics.cvr)}`)
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'font-weight-medium' }, formatCurrency(campaign.metrics.cpc)),
                      h('div', { class: 'text-caption text-medium-emphasis' },
                        `CPA: ${formatCurrency(campaign.metrics.cpa)}`)
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'font-weight-medium text-success' }, `${campaign.metrics.roas.toFixed(2)}x`),
                      h('div', { class: 'text-caption text-medium-emphasis' },
                        `Доход: ${formatCurrency(campaign.metrics.revenue)}`)
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'd-flex align-center ga-1' }, [
                        h('i', {
                          class: `${getKPIIcon(kpiStatus)} text-${kpiStatus}`
                        }),
                        h('span', { class: `text-${kpiStatus} text-caption font-weight-medium` },
                          campaign.kpi_targets.roas ?
                            `${Math.round((campaign.metrics.roas / campaign.kpi_targets.roas) * 100)}%` :
                            'Нет цели')
                      ])
                    ]),
                    h('td', { class: 'py-4' }, [
                      h('div', { class: 'd-flex flex-column ga-1' }, [
                        h('span', {
                          class: `text-caption font-weight-medium text-${getTrendColor(campaign.trend.revenue)}`
                        }, `Доход: ${campaign.trend.revenue}`),
                        h('span', {
                          class: `text-caption font-weight-medium text-${getTrendColor(campaign.trend.conversions)}`
                        }, `Конв.: ${campaign.trend.conversions}`)
                      ])
                    ])
                  ])
                })
              ])
            ])
          ])
        ])
      ])
    ])
  }
}

const router = useRouter()
const appStore = useAppStore()
const campaignsStore = useCampaignsExtendedStore()
const { showSnackbar } = useSnackbar()

// New campaign management variables
const currentTab = ref('management')
const createCampaignDialog = ref(false)
const quickFormValid = ref(false)
const quickForm = ref(null)

const quickFormData = ref({
  name: '',
  template: '',
  hierarchy_level: 'Campaign',
  start_date: '',
  budget: null
})

// AI campaigns variables (existing)
const isLoading = ref(false)
const searchQuery = ref('')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newCampaign = ref({
  name: '',
  description: '',
  objective: '',
  campaign_category: ''
})

const filters = ref({
  status: null,
  category: null,
  owner: null
})

// Mock data - в реальном приложении будет из API
const campaigns = ref([
  {
    ai_campaign_id: '1',
    name: 'Кампания "Живи на своём" Q1 2025',
    description: 'Продвижение банковских услуг для молодежи',
    objective: 'Увеличить количество лидов на 30%',
    campaign_category: 'performance',
    status: 'approved',
    version: 'v1',
    created_by: 'Иван Петров',
    budget_limit: {
      online: 8000000,
      offline: 1500000
    },
    created_at: '2025-01-15',
    linked_activity_id: null
  },
  {
    ai_campaign_id: '2',
    name: 'Ребрендинг продукта A',
    description: 'Информирование о новом бренде продукта',
    objective: 'Повысить узнаваемость бренда на 25%',
    campaign_category: 'branding',
    status: 'review',
    version: 'v2',
    created_by: 'Мария Сидорова',
    budget_limit: {
      online: 5000000,
      offline: 2000000
    },
    created_at: '2025-01-20',
    linked_activity_id: null
  },
  {
    ai_campaign_id: '3',
    name: 'Удержание клиентов сегмента Premium',
    description: 'Кампания по сохранению VIP-клиентов',
    objective: 'Снизить отток премиум-клиентов на 15%',
    campaign_category: 'retention',
    status: 'draft',
    version: 'v1',
    created_by: 'Алексей Козлов',
    budget_limit: {
      online: 3000000,
      offline: 500000
    },
    created_at: '2025-01-22',
    linked_activity_id: null
  }
])

const headers = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Категория', key: 'campaign_category', sortable: true },
  { title: 'Версия', key: 'version', sortable: true },
  { title: 'Ответственный', key: 'created_by', sortable: true },
  { title: 'Бюджет', key: 'budget_limit', sortable: false },
  { title: 'Создана', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

const statusOptions = [
  { title: 'Черновик', value: 'draft' },
  { title: 'Обрабатывается', value: 'processing' },
  { title: 'На рассмотрении', value: 'review' },
  { title: 'Утверждена', value: 'approved' },
  { title: 'Отклонена', value: 'rejected' }
]

const categoryOptions = [
  { title: 'Брендинг', value: 'branding' },
  { title: 'Перформанс', value: 'performance' },
  { title: 'Удержание', value: 'retention' }
]

const ownerOptions = [
  { title: 'Иван Петров', value: 'Иван Петров' },
  { title: 'Мария Сидорова', value: 'Мария Сидорова' },
  { title: 'Алексей Козлов', value: 'Алексей Козлов' }
]

const filteredCampaigns = computed(() => {
  let result = campaigns.value

  if (filters.value.status) {
    result = result.filter(c => c.status === filters.value.status)
  }
  if (filters.value.category) {
    result = result.filter(c => c.campaign_category === filters.value.category)
  }
  if (filters.value.owner) {
    result = result.filter(c => c.created_by === filters.value.owner)
  }

  return result
})

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    'draft': 'grey',
    'processing': 'blue',
    'review': 'orange',
    'approved': 'green',
    'rejected': 'red'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'draft': 'Черновик',
    'processing': 'Обрабатывается',
    'review': 'На рассмотрении',
    'approved': 'Утверждена',
    'rejected': 'Отклонена'
  }
  return texts[status] || status
}

const getCategoryColor = (category) => {
  const colors = {
    'branding': 'purple',
    'performance': 'blue',
    'retention': 'teal'
  }
  return colors[category] || 'grey'
}

const getCategoryText = (category) => {
  const texts = {
    'branding': 'Брендинг',
    'performance': 'Перформанс',
    'retention': 'Удержание'
  }
  return texts[category] || category
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

// New campaign management data
const campaignTemplatesOptions = [
  { title: 'Стандартная кампания', value: 'standard' },
  { title: 'Запуск продукта', value: 'product_launch' },
  { title: 'Сезонная акция', value: 'seasonal' },
  { title: 'Брендинговая кампания', value: 'branding' },
  { title: 'Цифровая кампания', value: 'digital' }
]

const hierarchyLevels = [
  { title: 'Программа', value: 'Program' },
  { title: 'Кампания', value: 'Campaign' },
  { title: 'Флайт', value: 'Flight' },
  { title: 'Тактика', value: 'Tactic' },
  { title: 'Размещение', value: 'Placement' }
]

const rules = {
  required: value => !!value || 'Поле обязательно для заполнения'
}

// New campaign management methods
const createQuickCampaign = async () => {
  try {
    // Map the quick form data to the extended store format
    const campaignData = {
      name: quickFormData.value.name,
      campaign_category: 'Performance', // Default category
      campaign_type: quickFormData.value.template || 'standard',
      hierarchy_level: quickFormData.value.hierarchy_level,
      start_date: quickFormData.value.start_date,
      budget: quickFormData.value.budget,
      status: 'draft'
    }

    await campaignsStore.createCampaign(campaignData)
    showSnackbar('Кампания успешно создана', 'success')
    createCampaignDialog.value = false
    currentTab.value = 'management'

    // Reset form
    quickFormData.value = {
      name: '',
      template: '',
      hierarchy_level: 'Campaign',
      start_date: '',
      budget: null
    }
    if (quickForm.value) {
      quickForm.value.reset()
    }
  } catch (error) {
    showSnackbar('Ошибка при создании кампании', 'error')
  }
}

const exportCampaigns = () => {
  showSnackbar('Экспорт данных начат', 'info')
}

const importCampaigns = () => {
  showSnackbar('Открыт диалог импорта', 'info')
}

const campaignTemplates = () => {
  showSnackbar('Открыт менеджер шаблонов', 'info')
}

const bulkOperations = () => {
  showSnackbar('Открыты массовые операции', 'info')
}

// AI campaign methods (existing)
const createCampaign = () => {
  showCreateDialog.value = true
}

const saveCampaign = async () => {
  try {
    isSaving.value = true

    // TODO: Реализовать API вызов createCampaign(newCampaign.value)
    const newId = Date.now().toString()
    const campaign = {
      ai_campaign_id: newId,
      ...newCampaign.value,
      status: 'draft',
      version: 'v1',
      created_by: 'Текущий пользователь',
      created_at: new Date().toISOString().split('T')[0],
      budget_limit: null,
      linked_activity_id: null
    }

    campaigns.value.unshift(campaign)

    appStore.showSuccess('Кампания создана успешно')
    showCreateDialog.value = false

    // Переходим к рабочему пространству новой кампании
    router.push(`/campaigns/${newId}`)

    // Сбрасываем форму
    newCampaign.value = {
      name: '',
      description: '',
      objective: '',
      campaign_category: ''
    }

  } catch (error) {
    console.error('Error creating campaign:', error)
    appStore.showError('Ошибка создания кампании')
  } finally {
    isSaving.value = false
  }
}

const openCampaign = (event, { item }) => {
  router.push(`/campaigns/${item.ai_campaign_id}`)
}

const createVersion = async (campaign) => {
  try {
    // TODO: Реализовать API вызов createCampaignVersion(campaign.ai_campaign_id)
    appStore.showSuccess('Версия кампании создана')
  } catch (error) {
    console.error('Error creating campaign version:', error)
    appStore.showError('Ошибка создания версии кампании')
  }
}

const deleteCampaign = async (campaign) => {
  if (confirm(`Удалить кампанию "${campaign.name}"?`)) {
    try {
      // TODO: Реализовать API вызов deleteCampaign(campaign.ai_campaign_id)
      const index = campaigns.value.findIndex(c => c.ai_campaign_id === campaign.ai_campaign_id)
      if (index > -1) {
        campaigns.value.splice(index, 1)
      }
      appStore.showSuccess('Кампания удалена')
    } catch (error) {
      console.error('Error deleting campaign:', error)
      appStore.showError('Ошибка удаления кампании')
    }
  }
}

const applyFilters = () => {
  // Фильтрация происходит автоматически через computed
}

const clearFilters = () => {
  filters.value = {
    status: null,
    category: null,
    owner: null
  }
}

onMounted(async () => {
  try {
    await campaignsStore.loadCampaigns()
  } catch (error) {
    console.error('Error loading campaigns:', error)
  }
  // TODO: Загрузка ИИ кампаний с сервера
  // campaigns.value = await getCampaigns()
})
</script>

<style scoped>
.campaigns-view {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}

:deep(.v-tabs) {
  margin-bottom: 24px;
}

:deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
}

:deep(.v-tabs-window) {
  background: transparent;
}

.v-data-table tbody tr:hover {
  cursor: pointer;
}

.ai-campaigns-content {
  padding: 0;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}
</style>