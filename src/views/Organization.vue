<template>
  <div class="organization-view">
    <!-- Список организаций (главная страница модуля) -->
    <OrganizationsList v-if="!selectedOrganizationId" />

    <!-- Детальный вид организации -->
    <div v-else>
      <!-- Заголовок -->
      <div class="d-flex align-center mb-6">
        <v-btn
          icon
          variant="text"
          @click="goBackToList"
          class="me-3"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <div>
          <h1 class="text-h4 font-weight-bold mb-1">
            {{ currentOrganization?.name || 'Организация' }}
          </h1>
          <p class="text-body-1 text-medium-emphasis">
            Управление настройками и данными организации
          </p>
        </div>

        <v-spacer />

        <v-btn
          color="primary"
          @click="saveOrganization"
          :loading="isSaving"
          v-if="selectedSection === 'profile'"
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
          <!-- Профиль организации -->
          <template v-if="selectedSection === 'profile'">
            <OrganizationProfile />
          </template>

          <!-- Стратегия -->
          <template v-if="selectedSection === 'strategy'">
            <OrganizationStrategy />
          </template>

          <!-- Документы -->
          <template v-if="selectedSection === 'documents'">
            <OrganizationDocuments />
          </template>

          <!-- Пользователи -->
          <template v-if="selectedSection === 'users'">
            <v-alert type="info" variant="tonal">
              Управление пользователями будет добавлено позже
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useOrganizationsStore } from '@/stores/organizationsStore'
import OrganizationsList from '@/components/organization/OrganizationsList.vue'
import OrganizationProfile from '@/components/organization/OrganizationProfile.vue'
import OrganizationStrategy from '@/components/organization/OrganizationStrategy.vue'
import OrganizationDocuments from '@/components/organization/OrganizationDocuments.vue'

export default {
  name: 'OrganizationView',
  components: {
    OrganizationsList,
    OrganizationProfile,
    OrganizationStrategy,
    OrganizationDocuments
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const appStore = useAppStore()
    const organizationsStore = useOrganizationsStore()

    const selectedSection = ref('profile')
    const isSaving = ref(false)

    // Вычисляемые свойства
    const selectedOrganizationId = computed(() => route.params.id)
    const currentOrganization = computed(() => {
      if (selectedOrganizationId.value) {
        return organizationsStore.getOrganizationById(selectedOrganizationId.value)
      }
      return null
    })

    // Разделы для детального просмотра организации
    const organizationSections = ref([
      {
        id: 'profile',
        title: 'Профиль',
        icon: 'mdi-office-building'
      },
      {
        id: 'strategy',
        title: 'Стратегия',
        icon: 'mdi-target'
      },
      {
        id: 'documents',
        title: 'Документы',
        icon: 'mdi-file-document'
      },
      {
        id: 'users',
        title: 'Пользователи',
        icon: 'mdi-account-group',
        badge: '12'
      },
      {
        id: 'integrations',
        title: 'Интеграции',
        icon: 'mdi-connection',
        badge: '3'
      }
    ])

    // Методы
    const goBackToList = () => {
      router.push('/organizations')
    }

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

    // Хуки жизненного цикла
    onMounted(async () => {
      // Инициализируем store организаций, если нужно
      if (organizationsStore.allOrganizations.length === 0) {
        try {
          await organizationsStore.initialize()
        } catch (error) {
          console.error('Error initializing organizations:', error)
        }
      }

      // Если указан ID организации, но организация не найдена, перенаправляем на список
      if (selectedOrganizationId.value && !currentOrganization.value) {
        const organization = await organizationsStore.loadOrganization(selectedOrganizationId.value)
        if (!organization) {
          appStore.showError('Организация не найдена')
          router.push('/organizations')
        }
      }
    })

    return {
      selectedSection,
      organizationSections,
      isSaving,
      selectedOrganizationId,
      currentOrganization,
      goBackToList,
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