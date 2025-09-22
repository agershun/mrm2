<template>
  <div class="profile-view">
    <!-- Заголовок -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Профиль пользователя</h1>
        <p class="text-body-1 text-medium-emphasis">
          Управление личным профилем и настройками аккаунта
        </p>
      </div>
      <v-spacer />

      <v-btn
        color="primary"
        @click="saveProfile"
        :loading="isSaving"
      >
        <v-icon class="me-2">mdi-content-save</v-icon>
        Сохранить изменения
      </v-btn>
    </div>

    <v-row>
      <!-- Боковое меню -->
      <v-col cols="12" md="3">
        <v-card>
          <v-list nav>
            <v-list-item
              v-for="item in profileSections"
              :key="item.id"
              :value="item.id"
              :active="selectedSection === item.id"
              @click="selectedSection = item.id"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon" />
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Основной контент -->
      <v-col cols="12" md="9">
        <!-- Основная информация -->
        <template v-if="selectedSection === 'general'">
          <UserProfile />
        </template>

        <!-- Настройки -->
        <template v-if="selectedSection === 'preferences'">
          <v-alert type="info" variant="tonal">
            Пользовательские настройки будут добавлены позже
          </v-alert>
        </template>

        <!-- Уведомления -->
        <template v-if="selectedSection === 'notifications'">
          <v-alert type="info" variant="tonal">
            Настройки уведомлений будут добавлены позже
          </v-alert>
        </template>

        <!-- Безопасность -->
        <template v-if="selectedSection === 'security'">
          <v-alert type="info" variant="tonal">
            Настройки безопасности будут добавлены позже
          </v-alert>
        </template>

        <!-- История активности -->
        <template v-if="selectedSection === 'activity'">
          <v-alert type="info" variant="tonal">
            История активности будет добавлена позже
          </v-alert>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'
import UserProfile from '@/components/profile/UserProfile.vue'
// import UserPreferences from '@/components/profile/UserPreferences.vue'
// import UserNotifications from '@/components/profile/UserNotifications.vue'
// import UserSecurity from '@/components/profile/UserSecurity.vue'
// import UserActivity from '@/components/profile/UserActivity.vue'

export default {
  name: 'ProfileView',
  components: {
    UserProfile
    // UserPreferences,
    // UserNotifications,
    // UserSecurity,
    // UserActivity
  },
  setup() {
    const appStore = useAppStore()

    const selectedSection = ref('general')
    const isSaving = ref(false)

    const profileSections = ref([
      {
        id: 'general',
        title: 'Основная информация',
        icon: 'mdi-account'
      },
      {
        id: 'preferences',
        title: 'Настройки',
        icon: 'mdi-cog'
      },
      {
        id: 'notifications',
        title: 'Уведомления',
        icon: 'mdi-bell'
      },
      {
        id: 'security',
        title: 'Безопасность',
        icon: 'mdi-shield'
      },
      {
        id: 'activity',
        title: 'История активности',
        icon: 'mdi-history'
      }
    ])

    const saveProfile = async () => {
      try {
        isSaving.value = true
        // Здесь будет логика сохранения профиля
        await new Promise(resolve => setTimeout(resolve, 1000))
        appStore.showSuccess('Профиль сохранен успешно')
      } catch (error) {
        console.error('Error saving profile:', error)
        appStore.showError('Ошибка сохранения профиля')
      } finally {
        isSaving.value = false
      }
    }

    return {
      selectedSection,
      profileSections,
      isSaving,
      saveProfile
    }
  }
}
</script>

<style scoped>
.profile-view {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 16px;
  }
}
</style>