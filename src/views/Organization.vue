<template>
  <div class="organization-view">
    <!-- Заголовок -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Настройки организации</h1>
        <p class="text-body-1 text-medium-emphasis">
          Управление настройками и пользователями организации
        </p>
      </div>
      <v-spacer />

      <v-btn
        color="primary"
        @click="saveOrganization"
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
              v-for="item in organizationSections"
              :key="item.id"
              :value="item.id"
              :active="selectedSection === item.id"
              @click="selectedSection = item.id"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon" />
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <template v-slot:append v-if="item.badge">
                <v-chip size="small" color="primary">{{ item.badge }}</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Основной контент -->
      <v-col cols="12" md="9">
        <!-- Основная информация -->
        <template v-if="selectedSection === 'general'">
          <OrganizationProfile />
        </template>

        <!-- Пользователи -->
        <template v-if="selectedSection === 'users'">
          <v-alert type="info" variant="tonal">
            Управление пользователями будет добавлено позже
          </v-alert>
        </template>

        <!-- Биллинг -->
        <template v-if="selectedSection === 'billing'">
          <v-alert type="info" variant="tonal">
            Биллинг и подписки будут добавлены позже
          </v-alert>
        </template>

        <!-- Безопасность -->
        <template v-if="selectedSection === 'security'">
          <v-alert type="info" variant="tonal">
            Настройки безопасности будут добавлены позже
          </v-alert>
        </template>

        <!-- Интеграции -->
        <template v-if="selectedSection === 'integrations'">
          <v-alert type="info" variant="tonal">
            Интеграции организации будут добавлены позже
          </v-alert>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'
import OrganizationProfile from '@/components/organization/OrganizationProfile.vue'
// import OrganizationUsers from '@/components/organization/OrganizationUsers.vue'
// import OrganizationBilling from '@/components/organization/OrganizationBilling.vue'
// import OrganizationSecurity from '@/components/organization/OrganizationSecurity.vue'
// import OrganizationIntegrations from '@/components/organization/OrganizationIntegrations.vue'

export default {
  name: 'OrganizationView',
  components: {
    OrganizationProfile
    // OrganizationUsers,
    // OrganizationBilling,
    // OrganizationSecurity,
    // OrganizationIntegrations
  },
  setup() {
    const appStore = useAppStore()

    const selectedSection = ref('general')
    const isSaving = ref(false)

    const organizationSections = ref([
      {
        id: 'general',
        title: 'Основная информация',
        icon: 'mdi-office-building'
      },
      {
        id: 'users',
        title: 'Пользователи',
        icon: 'mdi-account-group',
        badge: '12'
      },
      {
        id: 'billing',
        title: 'Биллинг и подписки',
        icon: 'mdi-credit-card'
      },
      {
        id: 'security',
        title: 'Безопасность',
        icon: 'mdi-shield'
      },
      {
        id: 'integrations',
        title: 'Интеграции',
        icon: 'mdi-connection',
        badge: '3'
      }
    ])

    const saveOrganization = async () => {
      try {
        isSaving.value = true
        // Здесь будет логика сохранения настроек организации
        await new Promise(resolve => setTimeout(resolve, 1000))
        appStore.showSuccess('Настройки организации сохранены успешно')
      } catch (error) {
        console.error('Error saving organization:', error)
        appStore.showError('Ошибка сохранения настроек организации')
      } finally {
        isSaving.value = false
      }
    }

    return {
      selectedSection,
      organizationSections,
      isSaving,
      saveOrganization
    }
  }
}
</script>

<style scoped>
.organization-view {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}

@media (max-width: 768px) {
  .organization-view {
    padding: 16px;
  }
}
</style>