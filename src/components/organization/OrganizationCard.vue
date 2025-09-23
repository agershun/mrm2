<template>
  <v-card
    :class="cardClasses"
    hover
    @click="$emit('select', organization)"
  >
    <!-- Заголовок карточки -->
    <v-card-title class="d-flex align-center pa-4 pb-2">
      <v-avatar
        :size="40"
        :color="organization.logo_url ? 'transparent' : 'primary'"
        class="me-3"
      >
        <v-img
          v-if="organization.logo_url"
          :src="organization.logo_url"
        />
        <v-icon
          v-else
          color="white"
          size="20"
        >
          mdi-office-building
        </v-icon>
      </v-avatar>

      <div class="flex-1-1">
        <div class="d-flex align-center">
          <span class="text-subtitle-1 font-weight-medium me-2">
            {{ organization.name }}
          </span>

          <!-- Бейджи статуса -->
          <v-chip
            v-if="isCurrent"
            size="x-small"
            color="success"
            variant="flat"
            class="me-1"
          >
            Текущая
          </v-chip>

          <v-chip
            v-if="!organization.isActive"
            size="x-small"
            color="error"
            variant="outlined"
          >
            Неактивна
          </v-chip>
        </div>

        <div class="text-caption text-medium-emphasis">
          {{ getIndustryLabel(organization.industry) }}
        </div>
      </div>

      <!-- Меню действий -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            variant="text"
            size="small"
            @click.stop
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list density="compact">
          <v-list-item
            v-if="!isCurrent"
            @click="$emit('set-current', organization)"
          >
            <template v-slot:prepend>
              <v-icon>mdi-check-circle</v-icon>
            </template>
            <v-list-item-title>Сделать текущей</v-list-item-title>
          </v-list-item>

          <v-list-item
            @click="$emit('settings', organization)"
          >
            <template v-slot:prepend>
              <v-icon>mdi-cog</v-icon>
            </template>
            <v-list-item-title>Настройки</v-list-item-title>
          </v-list-item>

          <v-list-item
            @click="$emit('edit', organization)"
          >
            <template v-slot:prepend>
              <v-icon>mdi-pencil</v-icon>
            </template>
            <v-list-item-title>Редактировать</v-list-item-title>
          </v-list-item>

          <v-list-item
            @click="$emit('delete', organization)"
            :disabled="isCurrent"
          >
            <template v-slot:prepend>
              <v-icon>mdi-delete</v-icon>
            </template>
            <v-list-item-title>Удалить</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <!-- Основная информация -->
    <v-card-text class="pa-4 pt-2">
      <!-- Описание -->
      <p
        v-if="organization.description"
        class="text-body-2 text-medium-emphasis mb-3"
        style="
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        "
      >
        {{ organization.description }}
      </p>

      <!-- Контактная информация -->
      <div class="contact-info">
        <div
          v-if="organization.email"
          class="d-flex align-center mb-1"
        >
          <v-icon size="14" color="grey" class="me-2">mdi-email</v-icon>
          <span class="text-caption">{{ organization.email }}</span>
        </div>

        <div
          v-if="organization.phone"
          class="d-flex align-center mb-1"
        >
          <v-icon size="14" color="grey" class="me-2">mdi-phone</v-icon>
          <span class="text-caption">{{ organization.phone }}</span>
        </div>

        <div
          v-if="organization.website"
          class="d-flex align-center mb-1"
        >
          <v-icon size="14" color="grey" class="me-2">mdi-web</v-icon>
          <a
            :href="organization.website"
            target="_blank"
            class="text-caption text-primary text-decoration-none"
            @click.stop
          >
            {{ formatWebsite(organization.website) }}
          </a>
        </div>

        <div
          v-if="organization.address?.city"
          class="d-flex align-center"
        >
          <v-icon size="14" color="grey" class="me-2">mdi-map-marker</v-icon>
          <span class="text-caption">
            {{ formatAddress(organization.address) }}
          </span>
        </div>
      </div>
    </v-card-text>

    <!-- Статистика -->
    <v-card-text class="pa-4 pt-0" v-if="showStats">
      <v-divider class="mb-3" />

      <div class="d-flex justify-space-between">
        <div class="text-center">
          <div class="text-caption text-medium-emphasis">Проекты</div>
          <div class="text-body-2 font-weight-medium">
            {{ organizationStats.activeProjects || '—' }}
          </div>
        </div>

        <div class="text-center">
          <div class="text-caption text-medium-emphasis">Бюджет</div>
          <div class="text-body-2 font-weight-medium">
            {{ organizationStats.totalBudget || '—' }}
          </div>
        </div>

        <div class="text-center">
          <div class="text-caption text-medium-emphasis">Пользователи</div>
          <div class="text-body-2 font-weight-medium">
            {{ organizationStats.totalUsers || '—' }}
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Дата создания -->
    <v-card-text class="pa-4 pt-0">
      <div class="text-caption text-medium-emphasis">
        Создана: {{ formatDate(organization.created_at) }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  organization: {
    type: Object,
    required: true
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  showStats: {
    type: Boolean,
    default: false
  },
  organizationStats: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['select', 'edit', 'delete', 'set-current', 'settings'])

// Вычисляемые свойства
const cardClasses = computed(() => {
  const classes = ['organization-card']

  if (props.isCurrent) {
    classes.push('organization-card--current')
  }

  if (!props.organization.isActive) {
    classes.push('organization-card--inactive')
  }

  return classes
})

// Методы
const getIndustryLabel = (industry) => {
  const labels = {
    cosmetics: 'Косметика и красота',
    technology: 'Технологии',
    finance: 'Финансы',
    education: 'Образование',
    healthcare: 'Здравоохранение',
    retail: 'Розничная торговля',
    restaurant: 'Ресторанный бизнес',
    manufacturing: 'Производство',
    other: 'Другое'
  }
  return labels[industry] || 'Другое'
}

const formatWebsite = (website) => {
  if (!website) return ''
  return website.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

const formatAddress = (address) => {
  if (!address) return ''

  const parts = []
  if (address.city) parts.push(address.city)
  if (address.region && address.region !== address.city) parts.push(address.region)

  return parts.join(', ')
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}
</script>

<style scoped>
.organization-card {
  transition: all 0.2s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.organization-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.organization-card--current {
  border-color: rgb(var(--v-theme-success));
  background-color: rgba(var(--v-theme-success), 0.02);
}

.organization-card--inactive {
  opacity: 0.7;
}

.organization-card--inactive:hover {
  opacity: 0.9;
}

.contact-info {
  min-height: 60px;
}

.flex-1-1 {
  flex: 1 1 auto;
  min-width: 0;
}
</style>