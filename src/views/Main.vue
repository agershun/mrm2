<template>
  <v-layout class="full-height">
    <!-- Боковая навигация -->
    <NavigationSidebar />

    <!-- Основная область контента -->
    <v-main>
      <!-- Верхняя панель -->
      <TopBar />

      <!-- Основной контент -->
      <v-container fluid class="pa-0 content-area">
        <router-view />
      </v-container>

      <!-- Глобальные уведомления -->
      <NotificationContainer />

      <!-- Глобальный индикатор загрузки -->
      <LoadingOverlay />
    </v-main>
  </v-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import NavigationSidebar from '@/components/NavigationSidebar.vue'
import TopBar from '@/components/TopBar.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

onMounted(() => {
  // Основной лейаут уже загружен, можно выполнить дополнительную инициализацию
  console.log('Main layout mounted')
})
</script>

<style scoped>
.content-area {
  min-height: calc(100vh - 64px);
  background-color: #fafafa;
}

.full-height {
  height: 100vh;
}
</style>