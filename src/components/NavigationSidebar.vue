<template>
  <v-navigation-drawer
    v-model="sidebarVisible"
    :rail="sidebarCollapsed"
    permanent
    :width="280"
    :rail-width="60"
    color="grey-lighten-5"
    border="0"
    class="navigation-sidebar"
  >
    <!-- Логотип -->
    <div class="pa-4 d-flex align-center">
      <v-avatar
        :size="sidebarCollapsed ? 32 : 40"
        color="primary"
        class="me-3"
      >
        <v-icon color="white" :size="sidebarCollapsed ? 20 : 24">
          mdi-chart-donut
        </v-icon>
      </v-avatar>

      <div
        v-show="!sidebarCollapsed"
        class="d-flex flex-column"
      >
        <span class="text-h6 font-weight-bold primary--text">
          Креола MRM
        </span>
        <span class="text-caption text-grey-darken-1">
          Управление маркетингом
        </span>
      </div>
    </div>

    <v-divider class="mx-3" />

    <!-- Навигационное меню -->
    <v-list
      nav
      density="compact"
      class="pa-2"
    >
      <v-list-item
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        :prepend-icon="item.icon"
        :title="item.title"
        color="primary"
        class="mb-1 rounded-lg"
        :class="{ 'v-list-item--active': isCurrentRoute(item.name) }"
        @click="navigateToModule(item.name)"
      >
        <template v-if="sidebarCollapsed" v-slot:append>
          <v-tooltip
            activator="parent"
            location="end"
            :text="item.title"
          />
        </template>
      </v-list-item>
    </v-list>

    <!-- Кнопка сворачивания -->
    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          icon
          variant="text"
          size="small"
          @click="toggleSidebar"
          class="rounded-lg"
        >
          <v-icon>
            {{ sidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
          </v-icon>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// Computed
const sidebarVisible = computed({
  get: () => true, // Всегда видимый
  set: (value) => appStore.setSidebarCollapsed(!value)
})

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)

// Пункты навигационного меню
const navigationItems = computed(() => [
  {
    name: 'Strategy',
    path: '/strategy',
    title: 'Стратегия',
    icon: 'mdi-target'
  },
  {
    name: 'Campaigns',
    path: '/campaigns',
    title: 'Кампании',
    icon: 'mdi-robot'
  },
  {
    name: 'CampaignsView',
    path: '/campaigns-view',
    title: 'Просмотр кампаний',
    icon: 'mdi-eye'
  },
  {
    name: 'Activities',
    path: '/activities',
    title: 'Планы',
    icon: 'mdi-calendar-multiple'
  },
  {
    name: 'Budgets',
    path: '/budgets',
    title: 'Бюджеты',
    icon: 'mdi-wallet'
  },
  {
    name: 'Investments',
    path: '/investments',
    title: 'Расходы',
    icon: 'mdi-chart-line'
  },
  {
    name: 'Insights',
    path: '/insights',
    title: 'Аналитика',
    icon: 'mdi-chart-bar'
  },
  {
    name: 'InsightsView',
    path: '/insights-view',
    title: 'Просмотр аналитики',
    icon: 'mdi-chart-donut'
  },
  {
    name: 'KnowledgeBase',
    path: '/knowledge-base',
    title: 'База знаний',
    icon: 'mdi-brain'
  },
  {
    name: 'Configuration',
    path: '/configuration',
    title: 'Конфигурация',
    icon: 'mdi-tune'
  }
])

// Methods
const isCurrentRoute = (routeName) => {
  return route.name === routeName
}

const navigateToModule = (moduleName) => {
  const item = navigationItems.value.find(item => item.name === moduleName)
  if (item) {
    router.push(item.path)
  }
}

const toggleSidebar = () => {
  appStore.toggleSidebar()
}
</script>

<style scoped>
.navigation-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.v-list-item {
  margin-bottom: 4px;
}

.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.08);
  color: #1976D2;
}

.primary--text {
  color: #1976D2 !important;
}
</style>