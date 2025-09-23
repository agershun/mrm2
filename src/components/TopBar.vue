<template>
  <v-app-bar
    :height="64"
    color="white"
    elevation="1"
    density="compact"
  >
    <!-- Кнопка сворачивания сайдбара -->
    <v-app-bar-nav-icon
      @click="toggleSidebar"
      class="ml-1"
    >
      <v-icon>mdi-menu</v-icon>
    </v-app-bar-nav-icon>

    <!-- Селектор организации -->
    <OrganizationSelector class="me-4" />

    <!-- Заголовок текущего экрана -->
    <v-app-bar-title class="text-h6 font-weight-medium">
      {{ currentPageTitle }}
    </v-app-bar-title>

    <v-spacer />

    <!-- Правая часть с кнопками действий -->
    <div class="d-flex align-center">
      <!-- Кнопка поиска -->
      <v-btn
        v-if="showSearchButton"
        icon
        variant="text"
        color="grey-darken-1"
        @click="openSearch"
      >
        <v-icon>mdi-magnify</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Поиск
        </v-tooltip>
      </v-btn>

      <!-- Кнопка календаря -->
      <v-btn
        v-if="showCalendarButton"
        icon
        variant="text"
        color="grey-darken-1"
        @click="openCalendar"
      >
        <v-icon>mdi-calendar</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Календарь
        </v-tooltip>
      </v-btn>

      <!-- Кнопка настроек -->
      <v-btn
        icon
        variant="text"
        color="grey-darken-1"
        @click="openSettings"
      >
        <v-icon>mdi-cog</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Настройки
        </v-tooltip>
      </v-btn>

      <!-- Кнопка помощи -->
      <v-btn
        icon
        variant="text"
        color="grey-darken-1"
        @click="openHelp"
      >
        <v-icon>mdi-help-circle-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Помощь
        </v-tooltip>
      </v-btn>

      <!-- Пользовательское меню -->
      <UserMenu />
    </div>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import UserMenu from '@/components/UserMenu.vue'
import OrganizationSelector from '@/components/organization/OrganizationSelector.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// Computed
const currentPageTitle = computed(() => {
  return route.meta.title || 'Kreola MRM'
})

const showSearchButton = computed(() => {
  // Показываем кнопку поиска только на экране Activities
  return route.name === 'Activities'
})

const showCalendarButton = computed(() => {
  // Показываем кнопку календаря только на экране Activities
  return route.name === 'Activities'
})

// Methods
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const openSearch = () => {
  // TODO: Реализовать поиск
  appStore.showInfo('Функция поиска будет реализована в следующих версиях')
}

const openCalendar = () => {
  // TODO: Реализовать календарь
  appStore.showInfo('Функция календаря будет реализована в следующих версиях')
}

const openSettings = () => {
  router.push('/settings')
}

const openHelp = () => {
  // TODO: Реализовать справку
  appStore.showInfo('Справочная система будет реализована в следующих версиях')
}
</script>

<style scoped>
.v-app-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>