<template>
  <v-app-bar
    density="compact"
    height="64"
    color="white"
    elevation="1"
    class="main-toolbar"
  >
    <!-- Селектор организации -->
    <div class="d-flex align-center px-4">
      <v-avatar
        :size="32"
        color="primary"
        class="me-3"
        v-if="currentOrganization?.logo_url"
      >
        <v-img :src="currentOrganization.logo_url" />
      </v-avatar>
      <v-avatar
        :size="32"
        color="primary"
        class="me-3"
        v-else
      >
        <v-icon color="white" size="18">
          mdi-office-building
        </v-icon>
      </v-avatar>

      <div class="organization-selector">
        <v-menu
          v-model="organizationMenuOpen"
          :close-on-content-click="false"
          location="bottom start"
          offset="8"
        >
          <template v-slot:activator="{ props }">
            <div
              v-bind="props"
              class="organization-selector-trigger"
              :class="{ 'organization-selector-trigger--active': organizationMenuOpen }"
            >
              <div class="organization-info">
                <div class="organization-name text-subtitle-2 font-weight-medium">
                  {{ currentOrganizationName }}
                </div>
                <div class="organization-type text-caption text-medium-emphasis">
                  {{ getOrganizationTypeLabel(currentOrganization?.industry) }}
                </div>
              </div>
              <v-icon
                size="20"
                :class="{ 'rotate-180': organizationMenuOpen }"
                class="ms-2 transition-transform"
              >
                mdi-chevron-down
              </v-icon>
            </div>
          </template>

          <v-card min-width="320" max-width="400" class="organization-menu">
            <v-card-title class="text-subtitle-1 py-3">
              <v-icon class="me-2">mdi-office-building-marker</v-icon>
              Выбор организации
            </v-card-title>

            <v-divider />

            <!-- Поиск организаций -->
            <div class="pa-3">
              <v-text-field
                v-model="organizationSearch"
                placeholder="Поиск организации..."
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                hide-details
                clearable
              />
            </div>

            <!-- Список организаций -->
            <v-list
              class="py-0"
              max-height="300"
              style="overflow-y: auto"
            >
              <v-list-item
                v-for="organization in filteredOrganizations"
                :key="organization.organization_id"
                :active="isCurrentOrganization(organization.organization_id)"
                @click="selectOrganization(organization)"
                class="organization-item"
              >
                <template v-slot:prepend>
                  <v-avatar
                    size="28"
                    color="primary"
                    class="me-3"
                  >
                    <v-img
                      v-if="organization.logo_url"
                      :src="organization.logo_url"
                    />
                    <v-icon
                      v-else
                      color="white"
                      size="14"
                    >
                      mdi-office-building
                    </v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-body-2 font-weight-medium">
                  {{ organization.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ getOrganizationTypeLabel(organization.industry) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-icon
                    v-if="isCurrentOrganization(organization.organization_id)"
                    color="primary"
                    size="18"
                  >
                    mdi-check
                  </v-icon>
                </template>
              </v-list-item>

              <!-- Пустое состояние -->
              <div
                v-if="filteredOrganizations.length === 0"
                class="text-center py-6 text-medium-emphasis"
              >
                <v-icon size="32" class="mb-2">mdi-magnify</v-icon>
                <div class="text-body-2">Организации не найдены</div>
              </div>
            </v-list>

            <v-divider />

            <!-- Действия -->
            <v-card-actions class="px-3 py-2">
              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-plus"
                @click="openCreateOrganizationDialog"
              >
                Создать
              </v-btn>

              <v-spacer />

              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-cog"
                :to="'/organizations'"
                @click="organizationMenuOpen = false"
              >
                Управление
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </div>
    </div>

    <v-spacer />

    <!-- Правая часть тулбара -->
    <div class="d-flex align-center">
      <!-- Уведомления -->
      <v-btn
        icon
        variant="text"
        size="small"
        class="me-2"
      >
        <v-badge
          :content="notificationsCount"
          :model-value="notificationsCount > 0"
          color="error"
          floating
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>

      <!-- Пользователь -->
      <UserMenu />
    </div>
  </v-app-bar>

  <!-- Диалог создания организации -->
  <OrganizationCreateDialog
    v-model="createOrganizationDialog"
    @created="onOrganizationCreated"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrganizationsStore } from '@/stores/organizationsStore'
import { useAppStore } from '@/stores/appStore'
import UserMenu from '@/components/UserMenu.vue'
import OrganizationCreateDialog from '@/components/organization/OrganizationCreateDialog.vue'

const organizationsStore = useOrganizationsStore()
const appStore = useAppStore()

// Локальное состояние
const organizationMenuOpen = ref(false)
const organizationSearch = ref('')
const createOrganizationDialog = ref(false)

// Вычисляемые свойства
const currentOrganization = computed(() => organizationsStore.getCurrentOrganization)
const currentOrganizationName = computed(() => organizationsStore.getCurrentOrganizationName)
const notificationsCount = computed(() => appStore.notifications.length)

const activeOrganizations = computed(() => organizationsStore.activeOrganizations)

const filteredOrganizations = computed(() => {
  if (!organizationSearch.value) {
    return activeOrganizations.value
  }

  const search = organizationSearch.value.toLowerCase()
  return activeOrganizations.value.filter(org =>
    org.name.toLowerCase().includes(search) ||
    getOrganizationTypeLabel(org.industry).toLowerCase().includes(search)
  )
})

// Методы
const getOrganizationTypeLabel = (industry) => {
  const labels = {
    cosmetics: 'Косметика и красота',
    technology: 'Технологии',
    finance: 'Финансы',
    education: 'Образование',
    healthcare: 'Здравоохранение',
    retail: 'Розничная торговля',
    restaurant: 'Ресторанный бизнес',
    manufacturing: 'Производство',
    other: 'Другое'
  }
  return labels[industry] || 'Другое'
}

const isCurrentOrganization = (organizationId) => {
  return organizationsStore.isCurrentOrganization(organizationId)
}

const selectOrganization = async (organization) => {
  try {
    await organizationsStore.setCurrentOrganization(organization.organization_id)
    organizationMenuOpen.value = false
    organizationSearch.value = ''

    appStore.showSuccess(`Выбрана организация: ${organization.name}`)
  } catch (error) {
    appStore.showError('Ошибка выбора организации')
  }
}

const openCreateOrganizationDialog = () => {
  organizationMenuOpen.value = false
  createOrganizationDialog.value = true
}

const onOrganizationCreated = async (organization) => {
  try {
    // Организация уже добавлена в store через диалог
    await organizationsStore.setCurrentOrganization(organization.organization_id)
    appStore.showSuccess(`Организация "${organization.name}" создана и выбрана`)
  } catch (error) {
    appStore.showError('Ошибка выбора созданной организации')
  }
}

// Хуки жизненного цикла
onMounted(async () => {
  // Инициализируем store организаций, если еще не инициализирован
  if (organizationsStore.allOrganizations.length === 0) {
    try {
      await organizationsStore.initialize()
    } catch (error) {
      console.error('Error initializing organizations:', error)
    }
  }
})
</script>

<style scoped>
.main-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.organization-selector {
  position: relative;
}

.organization-selector-trigger {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 200px;
}

.organization-selector-trigger:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.organization-selector-trigger--active {
  background-color: rgba(25, 118, 210, 0.08);
}

.organization-info {
  flex: 1;
  min-width: 0;
}

.organization-name {
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization-type {
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.organization-menu {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.organization-item {
  border-radius: 0;
}

.organization-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.rotate-180 {
  transform: rotate(180deg);
}

.transition-transform {
  transition: transform 0.2s ease;
}
</style>