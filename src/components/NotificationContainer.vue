<template>
  <div class="notification-container">
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      v-model="notification.visible"
      :timeout="notification.timeout"
      :color="getNotificationColor(notification.type)"
      location="top right"
      class="notification-snackbar"
      :class="`notification-${notification.type}`"
      @click:close="removeNotification(notification.id)"
    >
      <div class="d-flex align-center">
        <v-icon
          v-if="notification.icon"
          :icon="notification.icon"
          class="me-2"
        />
        <span>{{ notification.message }}</span>
      </div>

      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="removeNotification(notification.id)"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

// Computed
const notifications = computed(() => {
  return appStore.notifications.map(notification => ({
    ...notification,
    visible: true
  }))
})

// Methods
const getNotificationColor = (type) => {
  const colors = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }
  return colors[type] || 'info'
}

const removeNotification = (id) => {
  appStore.removeNotification(id)
}

// Автоматическое удаление уведомлений по таймауту
watch(notifications, (newNotifications) => {
  newNotifications.forEach(notification => {
    if (notification.timeout > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.timeout)
    }
  })
}, { immediate: true })
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 9999;
  pointer-events: none;
}

.notification-snackbar {
  position: relative !important;
  margin-bottom: 8px;
  pointer-events: auto;
  max-width: 400px;
}

.notification-success {
  background-color: #4CAF50 !important;
}

.notification-error {
  background-color: #FF5252 !important;
}

.notification-warning {
  background-color: #FFC107 !important;
  color: #000 !important;
}

.notification-info {
  background-color: #2196F3 !important;
}
</style>