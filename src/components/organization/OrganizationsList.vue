<template>
  <div class="organizations-list">
    <!-- Заголовок с действиями -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Управление бизнес-заказчиками</h2>
        <p class="text-body-2 text-medium-emphasis">
          {{ organizationsCount }} {{ getOrganizationsText() }}
        </p>
      </div>

      <div class="d-flex align-center gap-3">
        <!-- Поиск -->
        <v-text-field
          v-model="searchQuery"
          placeholder="Поиск организаций..."
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          hide-details
          style="width: 250px"
          clearable
        />

        <!-- Фильтр по статусу -->
        <v-select
          v-model="statusFilter"
          :items="statusFilterOptions"
          variant="outlined"
          density="compact"
          hide-details
          style="width: 150px"
        />

        <!-- Создать организацию -->
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="createOrganizationDialog = true"
        >
          Создать
        </v-btn>
      </div>
    </div>

    <!-- Список организаций -->
    <div v-if="isLoading && organizations.length === 0" class="text-center py-12">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
        class="mb-4"
      />
      <p class="text-body-1">Загрузка организаций...</p>
    </div>

    <div v-else-if="filteredOrganizations.length === 0" class="text-center py-12">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">
        mdi-office-building-outline
      </v-icon>
      <h3 class="text-h6 mb-2">
        {{ searchQuery ? 'Организации не найдены' : 'Нет организаций' }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ searchQuery
          ? 'Попробуйте изменить параметры поиска'
          : 'Создайте первую организацию для начала работы'
        }}
      </p>
      <v-btn
        v-if="!searchQuery"
        color="primary"
        prepend-icon="mdi-plus"
        @click="createOrganizationDialog = true"
      >
        Создать организацию
      </v-btn>
    </div>

    <v-row v-else>
      <v-col
        v-for="organization in filteredOrganizations"
        :key="organization.organization_id"
        cols="12"
        md="6"
        lg="4"
      >
        <OrganizationCard
          :organization="organization"
          :is-current="isCurrentOrganization(organization.organization_id)"
          @select="selectOrganization"
          @edit="editOrganization"
          @delete="deleteOrganization"
          @set-current="setCurrentOrganization"
          @settings="goToOrganizationSettings"
        />
      </v-col>
    </v-row>

    <!-- Диалоги -->
    <OrganizationCreateDialog
      v-model="createOrganizationDialog"
      @created="onOrganizationCreated"
    />

    <OrganizationEditDialog
      v-model="editOrganizationDialog"
      :organization="selectedOrganization"
      @updated="onOrganizationUpdated"
    />

    <v-dialog
      v-model="deleteConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h6">
          Удалить организацию?
        </v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить организацию
          <strong>{{ organizationToDelete?.name }}</strong>?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="deleteConfirmDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="isDeleting"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrganizationsStore } from '@/stores/organizationsStore'
import { useAppStore } from '@/stores/appStore'
import OrganizationCard from './OrganizationCard.vue'
import OrganizationCreateDialog from './OrganizationCreateDialog.vue'
import OrganizationEditDialog from './OrganizationEditDialog.vue'

const router = useRouter()
const organizationsStore = useOrganizationsStore()
const appStore = useAppStore()

// Локальное состояние
const searchQuery = ref('')
const statusFilter = ref('all')
const createOrganizationDialog = ref(false)
const editOrganizationDialog = ref(false)
const deleteConfirmDialog = ref(false)
const selectedOrganization = ref(null)
const organizationToDelete = ref(null)
const isDeleting = ref(false)

// Опции фильтра статуса
const statusFilterOptions = ref([
  { title: 'Все', value: 'all' },
  { title: 'Активные', value: 'active' },
  { title: 'Неактивные', value: 'inactive' }
])

// Вычисляемые свойства
const organizations = computed(() => organizationsStore.allOrganizations)
const isLoading = computed(() => organizationsStore.isLoading)

const filteredOrganizations = computed(() => {
  let result = organizations.value

  // Фильтр по статусу
  if (statusFilter.value === 'active') {
    result = result.filter(org => org.isActive)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(org => !org.isActive)
  }

  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(org =>
      org.name.toLowerCase().includes(query) ||
      org.legal_name?.toLowerCase().includes(query) ||
      org.email?.toLowerCase().includes(query) ||
      getIndustryLabel(org.industry).toLowerCase().includes(query)
    )
  }

  // Сортировка: сначала текущая, потом активные, потом по имени
  result.sort((a, b) => {
    // Текущая организация всегда первая
    const aIsCurrent = isCurrentOrganization(a.organization_id)
    const bIsCurrent = isCurrentOrganization(b.organization_id)

    if (aIsCurrent && !bIsCurrent) return -1
    if (!aIsCurrent && bIsCurrent) return 1

    // Активные перед неактивными
    if (a.isActive && !b.isActive) return -1
    if (!a.isActive && b.isActive) return 1

    // По алфавиту
    return a.name.localeCompare(b.name)
  })

  return result
})

const organizationsCount = computed(() => organizations.value.length)

// Методы
const getOrganizationsText = () => {
  const count = organizationsCount.value
  if (count === 1) return 'организация'
  if (count >= 2 && count <= 4) return 'организации'
  return 'организаций'
}

const getIndustryLabel = (industry) => {
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

const selectOrganization = (organization) => {
  // Переход к детальной странице организации
  router.push(`/organizations/${organization.organization_id}`)
}

const editOrganization = (organization) => {
  selectedOrganization.value = organization
  editOrganizationDialog.value = true
}

const goToOrganizationSettings = (organization) => {
  // Переход к настройкам организации
  router.push(`/organizations/${organization.organization_id}`)
}

const deleteOrganization = (organization) => {
  organizationToDelete.value = organization
  deleteConfirmDialog.value = true
}

const setCurrentOrganization = async (organization) => {
  try {
    await organizationsStore.setCurrentOrganization(organization.organization_id)
    appStore.showSuccess(`Выбрана организация: ${organization.name}`)
  } catch (error) {
    appStore.showError('Ошибка выбора организации')
  }
}

const confirmDelete = async () => {
  if (!organizationToDelete.value) return

  try {
    isDeleting.value = true
    await organizationsStore.deleteOrganization(organizationToDelete.value.organization_id)

    appStore.showSuccess(`Организация "${organizationToDelete.value.name}" удалена`)
    deleteConfirmDialog.value = false
    organizationToDelete.value = null
  } catch (error) {
    appStore.showError('Ошибка удаления организации')
  } finally {
    isDeleting.value = false
  }
}

const onOrganizationCreated = (organization) => {
  appStore.showSuccess(`Организация "${organization.name}" создана`)
}

const onOrganizationUpdated = (organization) => {
  appStore.showSuccess(`Организация "${organization.name}" обновлена`)
}

// Хуки жизненного цикла
onMounted(async () => {
  if (organizations.value.length === 0) {
    try {
      await organizationsStore.loadOrganizations()
    } catch (error) {
      appStore.showError('Ошибка загрузки организаций')
    }
  }
})
</script>

<style scoped>
.organizations-list {
  padding: 24px;
}

.gap-3 {
  gap: 12px;
}
</style>