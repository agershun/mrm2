<template>
  <div class="organization-selector">
    <v-menu v-model="isMenuOpen" location="bottom start" offset="4">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="outlined"
          color="primary"
          class="organization-selector-btn"
          append-icon="mdi-chevron-down"
        >
          <div class="d-flex align-center">
            <v-avatar size="24" class="me-2">
              <v-icon v-if="!currentOrganization" size="16">mdi-office-building-marker</v-icon>
              <span v-else class="text-caption font-weight-bold">
                {{ currentOrganization.name.charAt(0) }}
              </span>
            </v-avatar>
            <div class="text-left">
              <div class="text-body-2 font-weight-medium">
                {{ currentOrganization?.name || 'Выберите организацию' }}
              </div>
              <div v-if="currentOrganization" class="text-caption text-medium-emphasis">
                {{ getIndustryLabel(currentOrganization.industry) }}
              </div>
            </div>
          </div>
        </v-btn>
      </template>

      <v-card min-width="320" max-width="400">
        <v-card-title class="text-subtitle-1 pb-2">
          Выбор организации
        </v-card-title>

        <v-divider />

        <!-- Поиск -->
        <v-card-text class="pb-0">
          <v-text-field
            v-model="searchQuery"
            placeholder="Поиск организации..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
          />
        </v-card-text>

        <!-- Список организаций -->
        <v-list density="compact" class="py-0" max-height="300" style="overflow-y: auto;">
          <template v-if="isLoading">
            <v-list-item>
              <div class="text-center py-4">
                <v-progress-circular indeterminate size="24" color="primary" />
                <p class="mt-2 mb-0">Загрузка...</p>
              </div>
            </v-list-item>
          </template>

          <template v-else-if="filteredOrganizations.length === 0">
            <v-list-item>
              <div class="text-center py-4">
                <v-icon size="32" color="grey-lighten-1" class="mb-2">
                  mdi-office-building-outline
                </v-icon>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ searchQuery ? 'Организации не найдены' : 'Нет доступных организаций' }}
                </p>
              </div>
            </v-list-item>
          </template>

          <template v-else>
            <v-list-item
              v-for="organization in filteredOrganizations"
              :key="organization.organization_id"
              :value="organization.organization_id"
              :active="currentOrganization?.organization_id === organization.organization_id"
              @click="selectOrganization(organization)"
              class="organization-item"
            >
              <template v-slot:prepend>
                <v-avatar size="32" class="me-3">
                  <span class="text-caption font-weight-bold">
                    {{ organization.name.charAt(0) }}
                  </span>
                </v-avatar>
              </template>

              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ organization.name }}
              </v-list-item-title>

              <v-list-item-subtitle class="text-caption">
                {{ getIndustryLabel(organization.industry) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-icon
                  v-if="currentOrganization?.organization_id === organization.organization_id"
                  color="primary"
                  size="16"
                >
                  mdi-check-circle
                </v-icon>
              </template>
            </v-list-item>
          </template>
        </v-list>

        <v-divider />

        <!-- Действия -->
        <v-card-actions class="px-4 py-3">
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-plus"
            @click="goToOrganizations"
          >
            Управление организациями
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrganizationsStore } from '@/stores/organizationsStore'
import { useAppStore } from '@/stores/appStore'

const router = useRouter()
const organizationsStore = useOrganizationsStore()
const appStore = useAppStore()

// Локальное состояние
const isMenuOpen = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)

// Вычисляемые свойства
const currentOrganization = computed(() => organizationsStore.getCurrentOrganization)
const organizations = computed(() => organizationsStore.getOrganizations)

const filteredOrganizations = computed(() => {
  if (!organizations.value) {
    return []
  }

  if (!searchQuery.value) {
    return organizations.value
  }

  const query = searchQuery.value.toLowerCase()
  return organizations.value.filter(org =>
    org.name.toLowerCase().includes(query) ||
    getIndustryLabel(org.industry).toLowerCase().includes(query)
  )
})

// Методы
const selectOrganization = async (organization) => {
  if (currentOrganization.value?.organization_id === organization.organization_id) {
    isMenuOpen.value = false
    return
  }

  try {
    await organizationsStore.setCurrentOrganization(organization.organization_id)
    isMenuOpen.value = false
    searchQuery.value = ''

    appStore.showSuccess(`Выбрана организация: ${organization.name}`)
  } catch (error) {
    console.error('Error selecting organization:', error)
    appStore.showError('Ошибка при выборе организации')
  }
}

const goToOrganizations = () => {
  isMenuOpen.value = false
  router.push('/organizations')
}

const getIndustryLabel = (industry) => {
  const labels = {
    'retail': 'Розничная торговля',
    'technology': 'Технологии',
    'cosmetics': 'Косметика',
    'restaurant': 'Ресторанный бизнес',
    'healthcare': 'Здравоохранение',
    'education': 'Образование',
    'finance': 'Финансы',
    'real_estate': 'Недвижимость',
    'automotive': 'Автомобили',
    'travel': 'Туризм',
    'entertainment': 'Развлечения',
    'manufacturing': 'Производство',
    'consulting': 'Консалтинг',
    'logistics': 'Логистика',
    'agriculture': 'Сельское хозяйство',
    'other': 'Другое'
  }
  return labels[industry] || 'Другое'
}

const loadOrganizations = async () => {
  if (organizations.value && organizations.value.length > 0) return

  try {
    isLoading.value = true
    await organizationsStore.loadOrganizations()
  } catch (error) {
    console.error('Error loading organizations:', error)
    appStore.showError('Ошибка загрузки организаций')
  } finally {
    isLoading.value = false
  }
}

// Хуки жизненного цикла
onMounted(() => {
  loadOrganizations()
})
</script>

<style scoped>
.organization-selector {
  min-width: 200px;
}

.organization-selector-btn {
  min-width: 220px;
  height: 40px !important;
  padding: 0 12px;
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.organization-selector-btn:hover {
  border-color: rgba(var(--v-theme-primary), 0.6) !important;
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.organization-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.organization-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.v-list-item--active .v-list-item-title {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>