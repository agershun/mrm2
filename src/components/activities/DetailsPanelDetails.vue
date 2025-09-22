<template>
  <div class="details-panel-details">
    <v-container fluid class="pa-4">
      <!-- Основная информация -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-information</v-icon>
          Основная информация
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="activity?.name"
                label="Название активности"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="getActivityTypeName(activity?.activity_type_id)"
                label="Тип активности"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-chip
                :color="getStatusColor(activity?.status)"
                size="small"
                variant="outlined"
              >
                {{ getStatusText(activity?.status) }}
              </v-chip>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="activity?.currency_code"
                label="Валюта"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Описание -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-text</v-icon>
          Описание
        </v-card-title>
        <v-card-text class="pa-3">
          <v-textarea
            :model-value="activity?.description || 'Описание не указано'"
            label="Описание активности"
            variant="outlined"
            density="compact"
            readonly
            rows="3"
          />
        </v-card-text>
      </v-card>

      <!-- Временные рамки -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-calendar-range</v-icon>
          Временные рамки
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="formatDate(activity?.in_market_start_date)"
                label="Дата начала"
                variant="outlined"
                density="compact"
                readonly
                prepend-inner-icon="mdi-calendar-start"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="formatDate(activity?.in_market_end_date)"
                label="Дата окончания"
                variant="outlined"
                density="compact"
                readonly
                prepend-inner-icon="mdi-calendar-end"
              />
            </v-col>
            <v-col cols="12">
              <div class="duration-info">
                <v-chip color="info" size="small" variant="outlined">
                  <v-icon start>mdi-clock-outline</v-icon>
                  Длительность: {{ calculateDuration(activity?.in_market_start_date, activity?.in_market_end_date) }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Дополнительные параметры -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-cog</v-icon>
          Дополнительные параметры
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="activity?.created_by || 'Не указан'"
                label="Создал"
                variant="outlined"
                density="compact"
                readonly
                prepend-inner-icon="mdi-account"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="formatDate(activity?.created_date)"
                label="Дата создания"
                variant="outlined"
                density="compact"
                readonly
                prepend-inner-icon="mdi-calendar-plus"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="activity?.parent_activity_id || 'Корневая активность'"
                label="Родительская активность"
                variant="outlined"
                density="compact"
                readonly
                prepend-inner-icon="mdi-file-tree"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="getChildrenCount(activity?.activity_id)"
                label="Дочерних активностей"
                variant="outlined"
                density="compact"
                readonly
                prepend-inner-icon="mdi-sitemap"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Настройки уведомлений -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-bell</v-icon>
          Настройки уведомлений
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col cols="12">
              <v-checkbox
                :model-value="mockNotificationSettings.emailNotifications"
                label="Email уведомления о изменениях"
                density="compact"
                disabled
              />
            </v-col>
            <v-col cols="12">
              <v-checkbox
                :model-value="mockNotificationSettings.deadlineReminders"
                label="Напоминания о дедлайнах"
                density="compact"
                disabled
              />
            </v-col>
            <v-col cols="12">
              <v-checkbox
                :model-value="mockNotificationSettings.statusUpdates"
                label="Уведомления об изменении статуса"
                density="compact"
                disabled
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'

const props = defineProps({
  activity: {
    type: Object,
    default: () => ({})
  }
})

const activitiesStore = useActivitiesStore()

const mockNotificationSettings = ref({
  emailNotifications: true,
  deadlineReminders: true,
  statusUpdates: false
})

const getActivityTypeName = (typeId) => {
  const type = activitiesStore.activityTypes.find(t => t.activity_type_id === typeId)
  return type ? type.name : 'Неизвестный тип'
}

const getStatusColor = (status) => {
  const colors = {
    'Planning': 'blue',
    'Active': 'green',
    'Completed': 'grey',
    'Cancelled': 'red',
    'On Hold': 'orange'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'Planning': 'Планирование',
    'Active': 'Активна',
    'Completed': 'Завершена',
    'Cancelled': 'Отменена',
    'On Hold': 'Приостановлена'
  }
  return texts[status] || status
}

const formatDate = (date) => {
  if (!date) return 'Не указана'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Не определена'

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1 день'
  if (diffDays < 7) return `${diffDays} дней`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяцев`

  return `${Math.floor(diffDays / 365)} лет`
}

const getChildrenCount = (activityId) => {
  if (!activityId) return '0'
  const children = activitiesStore.activities.filter(a => a.parent_activity_id === activityId)
  return children.length.toString()
}
</script>

<style scoped>
.details-panel-details {
  height: 100%;
  overflow-y: auto;
}

.duration-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.v-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.v-card-title {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-container {
    padding: 12px;
  }

  .v-card {
    margin-bottom: 16px;
  }
}
</style>