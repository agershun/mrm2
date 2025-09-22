<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
// Основной компонент приложения Kreola MRM
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

onMounted(() => {
  // Инициализация приложения
  appStore.initialize()
})
</script>

<style scoped>
/* Стили для корневого компонента */
</style>