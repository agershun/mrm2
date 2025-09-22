<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-calendar-multiple</v-icon>
      Настройки активностей
      <v-spacer />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Создать тип активности
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Вложенное меню настроек активностей -->
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-list nav density="compact">
              <v-list-subheader>Настройки активностей</v-list-subheader>

              <v-list-item
                v-for="item in activitySections"
                :key="item.id"
                :value="item.id"
                :active="selectedActivitySection === item.id"
                @click="selectedActivitySection = item.id"
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

        <!-- Контент настроек активностей -->
        <v-col cols="12" md="8">
          <!-- Типы активностей -->
          <template v-if="selectedActivitySection === 'activity-types'">
            <v-card variant="outlined">
              <v-card-title>Типы активностей</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Типы активностей определяют шаблоны для создания маркетинговых активностей
                </v-alert>

                <v-data-table
                  :headers="activityTypeHeaders"
                  :items="activityTypes"
                  class="elevation-1"
                  item-value="activity_type_id"
                >
                  <template #item.enable_impact_modeling="{ item }">
                    <v-switch
                      v-model="item.enable_impact_modeling"
                      color="primary"
                      hide-details
                      @change="updateActivityType(item)"
                    />
                  </template>

                  <template #item.enable_estimated_costs="{ item }">
                    <v-switch
                      v-model="item.enable_estimated_costs"
                      color="primary"
                      hide-details
                      @change="updateActivityType(item)"
                    />
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editActivityType(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteActivityType(item.activity_type_id)"
                    />
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </template>

          <!-- Группы типов -->
          <template v-if="selectedActivitySection === 'type-groups'">
            <v-card variant="outlined">
              <v-card-title>Группы типов активностей</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Группы используются для логической организации типов активностей
                </v-alert>
                <!-- TODO: Реализовать управление группами типов -->
                <v-alert type="info" variant="tonal">
                  Управление группами типов будет добавлено позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Правила иерархии -->
          <template v-if="selectedActivitySection === 'hierarchy-rules'">
            <v-card variant="outlined">
              <v-card-title>Правила иерархии</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Правила определяют, какие типы активностей могут быть вложены друг в друга
                </v-alert>
                <!-- TODO: Реализовать управление правилами иерархии -->
                <v-alert type="info" variant="tonal">
                  Правила иерархии будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>

          <!-- Рабочие процессы -->
          <template v-if="selectedActivitySection === 'workflows'">
            <v-card variant="outlined">
              <v-card-title>Рабочие процессы</v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                  Настройка автоматических рабочих процессов для активностей
                </v-alert>
                <!-- TODO: Реализовать управление рабочими процессами -->
                <v-alert type="info" variant="tonal">
                  Рабочие процессы будут добавлены позже
                </v-alert>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания типа активности -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>Создать новый тип активности</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="isFormValid">
            <v-text-field
              v-model="newActivityType.name"
              label="Название типа"
              variant="outlined"
              :rules="[v => !!v || 'Название обязательно']"
              required
            />
            <v-select
              v-model="newActivityType.activity_type_group_id"
              :items="groupOptions"
              label="Группа типов"
              variant="outlined"
              :rules="[v => !!v || 'Группа обязательна']"
              required
            />
            <v-switch
              v-model="newActivityType.enable_impact_modeling"
              label="Включить моделирование эффективности"
              color="primary"
            />
            <v-switch
              v-model="newActivityType.enable_estimated_costs"
              label="Включить предварительные затраты"
              color="primary"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!isFormValid"
            :loading="isSaving"
            @click="createActivityType"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const selectedActivitySection = ref('activity-types')
const showCreateDialog = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)

const newActivityType = ref({
  name: '',
  activity_type_group_id: '',
  enable_impact_modeling: false,
  enable_estimated_costs: false
})

const activitySections = ref([
  {
    id: 'activity-types',
    title: 'Типы активностей',
    icon: 'mdi-shape',
    badge: null
  },
  {
    id: 'type-groups',
    title: 'Группы типов',
    icon: 'mdi-folder-multiple',
    badge: 'Soon'
  },
  {
    id: 'hierarchy-rules',
    title: 'Правила иерархии',
    icon: 'mdi-file-tree',
    badge: 'Soon'
  },
  {
    id: 'workflows',
    title: 'Рабочие процессы',
    icon: 'mdi-workflow',
    badge: 'Soon'
  }
])

const activityTypeHeaders = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Группа', key: 'activity_type_group', sortable: true },
  { title: 'Моделирование', key: 'enable_impact_modeling', sortable: false },
  { title: 'Затраты', key: 'enable_estimated_costs', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

const activityTypes = ref([
  {
    activity_type_id: '1',
    name: 'Рекламная кампания',
    activity_type_group: 'Реклама',
    enable_impact_modeling: true,
    enable_estimated_costs: true
  },
  {
    activity_type_id: '2',
    name: 'Email-кампания',
    activity_type_group: 'Email маркетинг',
    enable_impact_modeling: true,
    enable_estimated_costs: false
  },
  {
    activity_type_id: '3',
    name: 'Мероприятие',
    activity_type_group: 'События',
    enable_impact_modeling: false,
    enable_estimated_costs: true
  }
])

const groupOptions = ref([
  { title: 'Реклама', value: 'advertising' },
  { title: 'Email маркетинг', value: 'email' },
  { title: 'События', value: 'events' },
  { title: 'Контент-маркетинг', value: 'content' }
])

const createActivityType = async () => {
  try {
    isSaving.value = true
    // TODO: Реализовать API вызов
    console.log('Создание типа активности:', newActivityType.value)
    appStore.showSuccess('Тип активности создан успешно')
    showCreateDialog.value = false
    newActivityType.value = {
      name: '',
      activity_type_group_id: '',
      enable_impact_modeling: false,
      enable_estimated_costs: false
    }
  } catch (error) {
    console.error('Error creating activity type:', error)
    appStore.showError('Ошибка создания типа активности')
  } finally {
    isSaving.value = false
  }
}

const updateActivityType = async (activityType) => {
  try {
    // TODO: Реализовать API вызов для обновления
    console.log('Обновление типа активности:', activityType)
    appStore.showSuccess('Тип активности обновлен')
  } catch (error) {
    console.error('Error updating activity type:', error)
    appStore.showError('Ошибка обновления типа активности')
  }
}

const editActivityType = (activityType) => {
  // TODO: Реализовать редактирование
  console.log('Редактирование типа активности:', activityType)
}

const deleteActivityType = async (activityTypeId) => {
  try {
    // TODO: Реализовать API вызов для удаления
    console.log('Удаление типа активности:', activityTypeId)
    appStore.showSuccess('Тип активности удален')
  } catch (error) {
    console.error('Error deleting activity type:', error)
    appStore.showError('Ошибка удаления типа активности')
  }
}
</script>