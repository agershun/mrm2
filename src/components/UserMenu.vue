<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        class="ml-2 text-none"
        prepend-icon="mdi-account-circle"
      >
        {{ userInitials }}
      </v-btn>
    </template>

    <v-list min-width="280">
      <!-- Информация о пользователе -->
      <v-list-item class="pa-4">
        <template v-slot:prepend>
          <v-avatar color="primary" size="40">
            <span class="text-white font-weight-medium">{{ userInitials }}</span>
          </v-avatar>
        </template>
        <v-list-item-title class="font-weight-medium">
          {{ userDisplayName }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ currentUser?.email }}
        </v-list-item-subtitle>
      </v-list-item>

      <v-divider />

      <!-- Пункты меню -->
      <v-list-item
        prepend-icon="mdi-account-cog"
        title="Настройки профиля"
        @click="openProfileSettings"
      />

      <v-list-item
        prepend-icon="mdi-office-building-cog"
        title="Настройки организации"
        @click="openOrganizationSettings"
      />

      <v-divider />

      <v-list-item
        prepend-icon="mdi-logout"
        title="Выйти"
        @click="logout"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'

const router = useRouter()
const appStore = useAppStore()

// Computed
const currentUser = computed(() => appStore.currentUser)

const userDisplayName = computed(() => appStore.userDisplayName)

const userInitials = computed(() => {
  if (!currentUser.value) return 'U'
  const firstName = currentUser.value.firstName || ''
  const lastName = currentUser.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})

// Methods
const openProfileSettings = () => {
  router.push('/profile')
}

const openOrganizationSettings = () => {
  router.push('/organization')
}

const logout = () => {
  appStore.logout()
  appStore.showSuccess('Вы успешно вышли из системы')
  // В реальном приложении здесь будет редирект на страницу входа
  // router.push('/login')
}
</script>

<style scoped>
.v-list-item__prepend > .v-avatar {
  margin-inline-end: 12px;
}
</style>