<template>
  <v-card
    :class="[
      'campaign-card',
      { 'campaign-card--selected': selected }
    ]"
    hover
    @click="$emit('select', campaign, $event)"
  >
    <!-- Header -->
    <v-card-text class="pa-4 pb-2">
      <div class="d-flex align-center justify-space-between mb-2">
        <v-avatar
          :color="getChannelColor(campaign.channel)"
          size="32"
        >
          <v-icon color="white" size="18">
            {{ getChannelIcon(campaign.channel) }}
          </v-icon>
        </v-avatar>
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              v-bind="props"
              @click.stop
            />
          </template>
          <v-list density="compact">
            <v-list-item @click="$emit('edit', campaign)">
              <v-list-item-title>
                <v-icon class="me-2" size="16">mdi-pencil</v-icon>
                Редактировать
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('duplicate', campaign)">
              <v-list-item-title>
                <v-icon class="me-2" size="16">mdi-content-copy</v-icon>
                Дублировать
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('view-details', campaign)">
              <v-list-item-title>
                <v-icon class="me-2" size="16">mdi-eye</v-icon>
                Подробнее
              </v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="$emit('delete', campaign)" class="text-error">
              <v-list-item-title>
                <v-icon class="me-2" size="16">mdi-delete</v-icon>
                Удалить
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <h3 class="text-subtitle-1 font-weight-medium mb-1">
        {{ campaign.name }}
      </h3>

      <div class="text-body-2 text-medium-emphasis mb-3">
        ID: {{ campaign.campaign_id }}
      </div>

      <!-- Status and Phase -->
      <div class="d-flex gap-2 mb-3">
        <v-chip
          :color="getStatusColor(campaign.status)"
          size="small"
          variant="flat"
        >
          <v-icon
            :icon="getStatusIcon(campaign.status)"
            size="12"
            class="me-1"
          />
          {{ getStatusText(campaign.status) }}
        </v-chip>
        <v-chip
          :color="getPhaseColor(campaign.phase)"
          size="small"
          variant="tonal"
        >
          {{ getPhaseText(campaign.phase) }}
        </v-chip>
      </div>

      <!-- Objective -->
      <div class="mb-3">
        <div class="text-body-2 text-medium-emphasis mb-1">Цель</div>
        <div class="font-weight-medium">
          {{ getObjectiveText(campaign.objective) }}
        </div>
      </div>

      <!-- Budget -->
      <div class="mb-3">
        <div class="text-body-2 text-medium-emphasis mb-1">Бюджет</div>
        <div class="font-weight-medium">
          {{ formatCurrency(campaign.budget_value) }}
          <span class="text-body-2 text-medium-emphasis">
            / {{ getBudgetTypeText(campaign.budget_type) }}
          </span>
        </div>
      </div>

      <!-- Dates -->
      <div class="mb-3">
        <div class="text-body-2 text-medium-emphasis mb-1">Период</div>
        <div class="text-body-2">
          {{ formatDate(campaign.start_date) }}
          <span v-if="campaign.end_date">
            — {{ formatDate(campaign.end_date) }}
          </span>
          <span v-else class="text-medium-emphasis">
            — без ограничений
          </span>
        </div>
      </div>

      <!-- Performance metrics -->
      <div v-if="campaign.performance" class="performance-section">
        <v-divider class="mb-3" />
        <div class="text-body-2 text-medium-emphasis mb-2">Показатели</div>
        <v-row dense>
          <v-col cols="6">
            <div class="text-caption text-medium-emphasis">CTR</div>
            <div class="font-weight-medium">{{ campaign.performance.ctr }}%</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-medium-emphasis">CPC</div>
            <div class="font-weight-medium">{{ formatCurrency(campaign.performance.cpc) }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-medium-emphasis">Показы</div>
            <div class="font-weight-medium">{{ formatNumber(campaign.performance.impressions) }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-medium-emphasis">Клики</div>
            <div class="font-weight-medium">{{ formatNumber(campaign.performance.clicks) }}</div>
          </v-col>
        </v-row>
      </div>

      <!-- Manager -->
      <div v-if="campaign.responsible_manager" class="mt-3">
        <v-divider class="mb-3" />
        <div class="d-flex align-center">
          <v-avatar size="24" class="me-2">
            <v-icon size="14">mdi-account</v-icon>
          </v-avatar>
          <div class="text-body-2">
            {{ getManagerName(campaign.responsible_manager) }}
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Footer Actions -->
    <v-card-actions class="pa-3 pt-0">
      <v-btn
        size="small"
        variant="outlined"
        block
        @click.stop="$emit('view-details', campaign)"
      >
        Подробнее
      </v-btn>
    </v-card-actions>

    <!-- Selection indicator -->
    <div v-if="selected" class="selection-indicator" />
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'edit', 'duplicate', 'delete', 'view-details'])

// Utility methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const getChannelColor = (channel) => {
  const colors = {
    meta: 'blue',
    google: 'green',
    yandex: 'red',
    tiktok: 'pink',
    vk: 'indigo'
  }
  return colors[channel] || 'grey'
}

const getChannelIcon = (channel) => {
  const icons = {
    meta: 'mdi-facebook',
    google: 'mdi-google',
    yandex: 'mdi-yandex',
    tiktok: 'mdi-music-note',
    vk: 'mdi-vk'
  }
  return icons[channel] || 'mdi-web'
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    draft: 'grey',
    completed: 'info',
    archived: 'grey-darken-2'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    active: 'mdi-play',
    paused: 'mdi-pause',
    draft: 'mdi-file-document-outline',
    completed: 'mdi-check',
    archived: 'mdi-archive'
  }
  return icons[status] || 'mdi-help'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Активна',
    paused: 'На паузе',
    draft: 'Черновик',
    completed: 'Завершена',
    archived: 'Архив'
  }
  return texts[status] || status
}

const getPhaseColor = (phase) => {
  const colors = {
    pre_launch: 'grey',
    ab_testing: 'orange',
    active_launch: 'success',
    optimization: 'info',
    retargeting: 'purple',
    wrap_up: 'warning',
    post_analysis: 'secondary'
  }
  return colors[phase] || 'grey'
}

const getPhaseText = (phase) => {
  const texts = {
    pre_launch: 'Подготовка',
    ab_testing: 'A/B тест',
    active_launch: 'Запуск',
    optimization: 'Оптимизация',
    retargeting: 'Ретаргетинг',
    wrap_up: 'Завершение',
    post_analysis: 'Анализ'
  }
  return texts[phase] || phase
}

const getObjectiveText = (objective) => {
  const texts = {
    brand_awareness: 'Узнаваемость бренда',
    traffic: 'Трафик',
    leads: 'Лиды',
    conversions: 'Конверсии',
    app_installs: 'Установки приложения',
    reach: 'Охват',
    engagement: 'Вовлечение'
  }
  return texts[objective] || objective
}

const getBudgetTypeText = (budgetType) => {
  const texts = {
    daily: 'день',
    lifetime: 'период',
    unlimited: 'без лимита'
  }
  return texts[budgetType] || budgetType
}

const getManagerName = (email) => {
  return email.split('@')[0].replace('.', ' ')
}
</script>

<style scoped>
.campaign-card {
  height: 100%;
  position: relative;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.campaign-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.campaign-card--selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.performance-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  margin: 0 -16px;
  padding: 12px 16px;
  border-radius: 8px;
}

.selection-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: rgb(var(--v-theme-primary));
  border-radius: 50%;
}
</style>