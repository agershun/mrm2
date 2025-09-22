<template>
  <v-card flat>
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon :icon="currentTab === 'notes' ? 'mdi-note-text' : 'mdi-history'" color="primary" class="me-2"/>
        <span class="text-h6">{{ currentTab === 'notes' ? 'Заметки' : 'Журнал аудита' }}</span>
      </div>
      <v-chip
        :color="currentTab === 'notes' ? 'primary' : 'info'"
        variant="flat"
        size="small"
      >
        {{ currentTab === 'notes' ? `${notes.length} заметок` : `${auditTrail.length} записей` }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-0">
      <v-row class="ma-0 h-100">
        <!-- Левая панель: Табы -->
        <v-col cols="2" class="pa-0 border-end">
          <v-list nav density="compact" class="py-0">
            <v-list-item
              value="notes"
              :active="currentTab === 'notes'"
              @click="currentTab = 'notes'"
              class="border-bottom"
            >
              <template #prepend>
                <v-icon icon="mdi-note-text" class="me-2"/>
              </template>
              <v-list-item-title class="text-body-2">Заметки</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ notes.length }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item
              value="audit"
              :active="currentTab === 'audit'"
              @click="currentTab = 'audit'"
              class="border-bottom"
            >
              <template #prepend>
                <v-icon icon="mdi-history" class="me-2"/>
              </template>
              <v-list-item-title class="text-body-2">Аудит</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ auditTrail.length }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Правая панель: Содержимое -->
        <v-col cols="10" class="pa-0">
          <!-- Заметки -->
          <div v-if="currentTab === 'notes'" class="notes-panel h-100">
            <!-- Заголовок с действиями -->
            <div class="pa-4 border-bottom bg-surface-variant">
              <v-row align="center">
                <v-col>
                  <h3 class="text-h6 mb-1">Заметки по бюджету</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Личные и общие заметки о бюджете
                  </p>
                </v-col>
                <v-col cols="auto">
                  <v-btn
                    color="primary"
                    variant="flat"
                    size="small"
                    prepend-icon="mdi-plus"
                    @click="showCreateNoteDialog = true"
                    :disabled="!canCreateNote"
                  >
                    Новая заметка
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Фильтры -->
              <v-row class="mt-2">
                <v-col cols="4">
                  <v-text-field
                    v-model="noteSearch"
                    prepend-inner-icon="mdi-magnify"
                    label="Поиск заметок"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="3">
                  <v-select
                    v-model="noteTypeFilter"
                    :items="noteTypeOptions"
                    label="Тип заметки"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="3">
                  <v-select
                    v-model="noteAuthorFilter"
                    :items="noteAuthorOptions"
                    label="Автор"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="2">
                  <v-switch
                    v-model="showOnlyMyNotes"
                    label="Только мои"
                    color="primary"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Список заметок -->
            <div class="notes-list pa-4" style="overflow-y: auto;">
              <div v-if="filteredNotes.length === 0" class="text-center py-8">
                <v-icon icon="mdi-note-text" size="64" color="grey-lighten-2" class="mb-4"/>
                <h4 class="text-h6 text-medium-emphasis mb-2">Заметок не найдено</h4>
                <p class="text-body-2 text-medium-emphasis">
                  {{ noteSearch || noteTypeFilter || noteAuthorFilter
                     ? 'Попробуйте изменить критерии поиска'
                     : 'Создайте первую заметку' }}
                </p>
              </div>

              <v-card
                v-for="note in filteredNotes"
                :key="note.note_id"
                class="mb-3"
                :class="{ 'border-primary': note.is_pinned }"
                variant="outlined"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div class="d-flex align-center">
                      <v-chip
                        :color="getNoteTypeColor(note.note_type)"
                        size="small"
                        variant="flat"
                        class="me-2"
                      >
                        {{ getNoteTypeText(note.note_type) }}
                      </v-chip>
                      <v-chip
                        v-if="note.is_pinned"
                        color="warning"
                        size="x-small"
                        variant="flat"
                        class="me-2"
                      >
                        Закреплено
                      </v-chip>
                      <v-chip
                        v-if="note.is_private"
                        color="info"
                        size="x-small"
                        variant="flat"
                      >
                        Личная
                      </v-chip>
                    </div>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          size="small"
                          variant="text"
                          v-bind="props"
                        />
                      </template>
                      <v-list density="compact">
                        <v-list-item @click="editNote(note)" :disabled="!canEditNote(note)">
                          <template #prepend>
                            <v-icon icon="mdi-pencil"/>
                          </template>
                          <v-list-item-title>Редактировать</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="togglePinNote(note)">
                          <template #prepend>
                            <v-icon :icon="note.is_pinned ? 'mdi-pin-off' : 'mdi-pin'"/>
                          </template>
                          <v-list-item-title>{{ note.is_pinned ? 'Открепить' : 'Закрепить' }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteNote(note)" :disabled="!canDeleteNote(note)">
                          <template #prepend>
                            <v-icon icon="mdi-delete" color="error"/>
                          </template>
                          <v-list-item-title>Удалить</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>

                  <h4 class="text-body-1 font-weight-medium mb-2">{{ note.title }}</h4>
                  <p class="text-body-2 mb-3">{{ note.content }}</p>

                  <div class="d-flex justify-space-between align-center text-caption text-medium-emphasis">
                    <span>{{ note.author_name }} • {{ formatDateTime(note.created_at) }}</span>
                    <span v-if="note.updated_at !== note.created_at">
                      Изменено: {{ formatDateTime(note.updated_at) }}
                    </span>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <!-- Журнал аудита -->
          <div v-if="currentTab === 'audit'" class="audit-panel h-100">
            <!-- Заголовок с фильтрами -->
            <div class="pa-4 border-bottom bg-surface-variant">
              <h3 class="text-h6 mb-3">Журнал аудита</h3>

              <v-row>
                <v-col cols="3">
                  <v-text-field
                    v-model="auditSearch"
                    prepend-inner-icon="mdi-magnify"
                    label="Поиск в журнале"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="3">
                  <v-select
                    v-model="auditActionFilter"
                    :items="auditActionOptions"
                    label="Тип действия"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="3">
                  <v-select
                    v-model="auditUserFilter"
                    :items="auditUserOptions"
                    label="Пользователь"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="3">
                  <v-menu v-model="dateMenu" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field
                        :model-value="auditDateRange"
                        label="Период"
                        variant="outlined"
                        density="compact"
                        hide-details
                        readonly
                        v-bind="props"
                        append-inner-icon="mdi-calendar"
                      />
                    </template>
                    <v-date-picker
                      v-model="auditDateRangeValue"
                      range
                      @update:model-value="dateMenu = false"
                    />
                  </v-menu>
                </v-col>
              </v-row>
            </div>

            <!-- Таймлайн аудита -->
            <div class="audit-timeline pa-4" style="overflow-y: auto;">
              <v-timeline density="compact" class="pt-0">
                <v-timeline-item
                  v-for="(entry, index) in filteredAuditTrail"
                  :key="entry.audit_id"
                  :dot-color="getAuditActionColor(entry.action_type)"
                  size="small"
                >
                  <template #icon>
                    <v-icon size="16">{{ getAuditActionIcon(entry.action_type) }}</v-icon>
                  </template>

                  <v-card variant="outlined" class="mb-2">
                    <v-card-text class="pa-3">
                      <div class="d-flex justify-space-between align-start mb-2">
                        <div>
                          <h4 class="text-body-1 font-weight-medium">{{ entry.action_description }}</h4>
                          <p class="text-body-2 text-medium-emphasis mb-0">
                            {{ entry.user_name }} • {{ formatDateTime(entry.timestamp) }}
                          </p>
                        </div>
                        <v-chip
                          :color="getAuditActionColor(entry.action_type)"
                          size="small"
                          variant="flat"
                        >
                          {{ getAuditActionText(entry.action_type) }}
                        </v-chip>
                      </div>

                      <div v-if="entry.details" class="text-caption text-medium-emphasis">
                        <strong>Детали:</strong> {{ entry.details }}
                      </div>

                      <div v-if="entry.changes" class="mt-2">
                        <v-expansion-panels variant="accordion" density="compact">
                          <v-expansion-panel>
                            <v-expansion-panel-title class="text-caption">
                              <v-icon icon="mdi-file-document-edit" size="16" class="me-1"/>
                              Изменения
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                              <v-table density="compact">
                                <tbody>
                                  <tr v-for="(change, field) in entry.changes" :key="field">
                                    <td class="text-caption font-weight-medium">{{ field }}</td>
                                    <td class="text-caption">
                                      <span class="text-error">{{ change.old_value || 'Не задано' }}</span>
                                      →
                                      <span class="text-success">{{ change.new_value || 'Не задано' }}</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </v-table>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>

              <div v-if="filteredAuditTrail.length === 0" class="text-center py-8">
                <v-icon icon="mdi-history" size="64" color="grey-lighten-2" class="mb-4"/>
                <h4 class="text-h6 text-medium-emphasis mb-2">Записи не найдены</h4>
                <p class="text-body-2 text-medium-emphasis">
                  Попробуйте изменить критерии поиска
                </p>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог создания заметки -->
    <v-dialog v-model="showCreateNoteDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-note-plus" class="me-2"/>
          {{ editingNote ? 'Редактировать заметку' : 'Новая заметка' }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="noteForm" v-model="noteFormValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newNote.title"
                  label="Заголовок заметки"
                  variant="outlined"
                  :rules="[v => !!v || 'Заголовок обязателен']"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="newNote.note_type"
                  :items="noteTypeOptions"
                  label="Тип заметки"
                  variant="outlined"
                  :rules="[v => !!v || 'Тип обязателен']"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-switch
                  v-model="newNote.is_private"
                  label="Личная заметка"
                  color="primary"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newNote.content"
                  label="Содержание заметки"
                  variant="outlined"
                  rows="6"
                  :rules="[v => !!v || 'Содержание обязательно']"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer/>
          <v-btn @click="cancelNoteEdit">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="saveNote"
            :disabled="!noteFormValid"
            :loading="isSavingNote"
          >
            {{ editingNote ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  budgetId: {
    type: String,
    required: true
  },
  currentUser: {
    type: Object,
    default: () => ({})
  }
})

// Reactive data
const currentTab = ref('notes')
const showCreateNoteDialog = ref(false)
const noteFormValid = ref(false)
const isSavingNote = ref(false)
const editingNote = ref(null)
const dateMenu = ref(false)

// Фильтры заметок
const noteSearch = ref('')
const noteTypeFilter = ref('')
const noteAuthorFilter = ref('')
const showOnlyMyNotes = ref(false)

// Фильтры аудита
const auditSearch = ref('')
const auditActionFilter = ref('')
const auditUserFilter = ref('')
const auditDateRangeValue = ref([])

// Новая заметка
const newNote = ref({
  title: '',
  content: '',
  note_type: '',
  is_private: false
})

// Mock данные заметок
const notes = ref([
  {
    note_id: 'note_001',
    title: 'Обоснование увеличения бюджета YouTube',
    content: 'Анализ показал, что YouTube интеграции демонстрируют лучший ROI среди всех digital каналов. Предлагается увеличить бюджет на 20% за счет перераспределения средств с менее эффективных каналов.',
    note_type: 'analysis',
    is_private: false,
    is_pinned: true,
    author_id: 'user_005',
    author_name: 'Дмитрий Иванов',
    created_at: '2025-09-20T14:30:00Z',
    updated_at: '2025-09-21T09:15:00Z'
  },
  {
    note_id: 'note_002',
    title: 'Личные заметки по медиапланированию',
    content: 'Проанализировать возможность перехода на programmatic закупки для повышения эффективности медиазакупок. Рассмотреть интеграцию с DMP платформами.',
    note_type: 'idea',
    is_private: true,
    is_pinned: false,
    author_id: 'user_010',
    author_name: 'Анна Петрова',
    created_at: '2025-09-19T16:45:00Z',
    updated_at: '2025-09-19T16:45:00Z'
  },
  {
    note_id: 'note_003',
    title: 'Важное замечание по билбордам',
    content: 'Поставщик предлагает скидку 15% при продлении контракта до конца года. Срок принятия решения до 30 сентября.',
    note_type: 'important',
    is_private: false,
    is_pinned: true,
    author_id: 'user_016',
    author_name: 'Сергей Николаев',
    created_at: '2025-09-18T11:20:00Z',
    updated_at: '2025-09-18T11:20:00Z'
  }
])

// Mock данные аудита
const auditTrail = ref([
  {
    audit_id: 'audit_001',
    action_type: 'create',
    action_description: 'Создан бюджет "Google Ads кампании"',
    user_id: 'user_010',
    user_name: 'Анна Петрова',
    timestamp: '2025-09-22T10:30:00Z',
    details: 'Создан план инвестиций с начальным бюджетом 850,000 рублей',
    changes: null
  },
  {
    audit_id: 'audit_002',
    action_type: 'update',
    action_description: 'Обновлен бюджет YouTube интеграций',
    user_id: 'user_005',
    user_name: 'Дмитрий Иванов',
    timestamp: '2025-09-21T15:45:00Z',
    details: 'Изменение суммы бюджета и описания',
    changes: {
      'Сумма бюджета': { old_value: '1,200,000', new_value: '1,300,000' },
      'Описание': { old_value: 'Интеграции с топ-блогерами', new_value: 'Интеграции с топ-блогерами YouTube (расширенная программа)' }
    }
  },
  {
    audit_id: 'audit_003',
    action_type: 'approve',
    action_description: 'Утвержден трансфер средств',
    user_id: 'user_001',
    user_name: 'Михаил Сидоров',
    timestamp: '2025-09-20T12:15:00Z',
    details: 'Утвержден перевод 50,000 рублей с Google Ads на Яндекс.Директ',
    changes: null
  },
  {
    audit_id: 'audit_004',
    action_type: 'delete',
    action_description: 'Удален план "Тестовая кампания"',
    user_id: 'user_001',
    user_name: 'Михаил Сидоров',
    timestamp: '2025-09-19T09:30:00Z',
    details: 'Удален тестовый план инвестиций, созданный по ошибке',
    changes: null
  }
])

// Опции для селектов
const noteTypeOptions = [
  { title: 'Анализ', value: 'analysis' },
  { title: 'Идея', value: 'idea' },
  { title: 'Важное', value: 'important' },
  { title: 'Вопрос', value: 'question' },
  { title: 'Напоминание', value: 'reminder' }
]

const auditActionOptions = [
  { title: 'Создание', value: 'create' },
  { title: 'Обновление', value: 'update' },
  { title: 'Удаление', value: 'delete' },
  { title: 'Утверждение', value: 'approve' },
  { title: 'Отклонение', value: 'reject' }
]

// Computed properties
const filteredNotes = computed(() => {
  let filtered = notes.value

  if (showOnlyMyNotes.value) {
    filtered = filtered.filter(note => note.author_id === props.currentUser.user_id)
  }

  if (noteSearch.value) {
    const search = noteSearch.value.toLowerCase()
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(search) ||
      note.content.toLowerCase().includes(search)
    )
  }

  if (noteTypeFilter.value) {
    filtered = filtered.filter(note => note.note_type === noteTypeFilter.value)
  }

  if (noteAuthorFilter.value) {
    filtered = filtered.filter(note => note.author_id === noteAuthorFilter.value)
  }

  // Сортировка: закрепленные сверху, затем по дате создания
  return filtered.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

const filteredAuditTrail = computed(() => {
  let filtered = auditTrail.value

  if (auditSearch.value) {
    const search = auditSearch.value.toLowerCase()
    filtered = filtered.filter(entry =>
      entry.action_description.toLowerCase().includes(search) ||
      entry.details?.toLowerCase().includes(search)
    )
  }

  if (auditActionFilter.value) {
    filtered = filtered.filter(entry => entry.action_type === auditActionFilter.value)
  }

  if (auditUserFilter.value) {
    filtered = filtered.filter(entry => entry.user_id === auditUserFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

const noteAuthorOptions = computed(() => {
  const authors = [...new Set(notes.value.map(note => note.author_id))]
  return authors.map(authorId => {
    const note = notes.value.find(n => n.author_id === authorId)
    return {
      title: note.author_name,
      value: authorId
    }
  })
})

const auditUserOptions = computed(() => {
  const users = [...new Set(auditTrail.value.map(entry => entry.user_id))]
  return users.map(userId => {
    const entry = auditTrail.value.find(e => e.user_id === userId)
    return {
      title: entry.user_name,
      value: userId
    }
  })
})

const auditDateRange = computed(() => {
  if (auditDateRangeValue.value.length === 2) {
    const start = new Date(auditDateRangeValue.value[0]).toLocaleDateString('ru-RU')
    const end = new Date(auditDateRangeValue.value[1]).toLocaleDateString('ru-RU')
    return `${start} - ${end}`
  }
  return ''
})

const canCreateNote = computed(() => {
  return ['Owner', 'Administrator', 'Editor', 'Editor - Data Entry Only'].includes(props.currentUser.role)
})

// Methods
const canEditNote = (note) => {
  return note.author_id === props.currentUser.user_id ||
         ['Owner', 'Administrator'].includes(props.currentUser.role)
}

const canDeleteNote = (note) => {
  return note.author_id === props.currentUser.user_id ||
         ['Owner', 'Administrator'].includes(props.currentUser.role)
}

const editNote = (note) => {
  editingNote.value = note
  newNote.value = {
    title: note.title,
    content: note.content,
    note_type: note.note_type,
    is_private: note.is_private
  }
  showCreateNoteDialog.value = true
}

const togglePinNote = (note) => {
  note.is_pinned = !note.is_pinned
  // Добавляем запись в аудит
  auditTrail.value.unshift({
    audit_id: `audit_${Date.now()}`,
    action_type: 'update',
    action_description: `${note.is_pinned ? 'Закреплена' : 'Откреплена'} заметка "${note.title}"`,
    user_id: props.currentUser.user_id,
    user_name: props.currentUser.name,
    timestamp: new Date().toISOString(),
    details: `Изменен статус закрепления заметки`,
    changes: null
  })
}

const deleteNote = (note) => {
  const index = notes.value.indexOf(note)
  if (index > -1) {
    notes.value.splice(index, 1)
    // Добавляем запись в аудит
    auditTrail.value.unshift({
      audit_id: `audit_${Date.now()}`,
      action_type: 'delete',
      action_description: `Удалена заметка "${note.title}"`,
      user_id: props.currentUser.user_id,
      user_name: props.currentUser.name,
      timestamp: new Date().toISOString(),
      details: `Заметка была удалена пользователем`,
      changes: null
    })
  }
}

const saveNote = async () => {
  try {
    isSavingNote.value = true

    if (editingNote.value) {
      // Редактирование существующей заметки
      const oldNote = { ...editingNote.value }
      Object.assign(editingNote.value, newNote.value)
      editingNote.value.updated_at = new Date().toISOString()

      // Добавляем запись в аудит
      auditTrail.value.unshift({
        audit_id: `audit_${Date.now()}`,
        action_type: 'update',
        action_description: `Обновлена заметка "${editingNote.value.title}"`,
        user_id: props.currentUser.user_id,
        user_name: props.currentUser.name,
        timestamp: new Date().toISOString(),
        details: `Заметка была изменена`,
        changes: {
          'Заголовок': { old_value: oldNote.title, new_value: editingNote.value.title },
          'Содержание': { old_value: oldNote.content, new_value: editingNote.value.content }
        }
      })
    } else {
      // Создание новой заметки
      const note = {
        note_id: `note_${String(notes.value.length + 1).padStart(3, '0')}`,
        ...newNote.value,
        is_pinned: false,
        author_id: props.currentUser.user_id,
        author_name: props.currentUser.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      notes.value.unshift(note)

      // Добавляем запись в аудит
      auditTrail.value.unshift({
        audit_id: `audit_${Date.now()}`,
        action_type: 'create',
        action_description: `Создана заметка "${note.title}"`,
        user_id: props.currentUser.user_id,
        user_name: props.currentUser.name,
        timestamp: new Date().toISOString(),
        details: `Новая заметка добавлена к бюджету`,
        changes: null
      })
    }

    cancelNoteEdit()
  } catch (error) {
    console.error('Error saving note:', error)
  } finally {
    isSavingNote.value = false
  }
}

const cancelNoteEdit = () => {
  showCreateNoteDialog.value = false
  editingNote.value = null
  newNote.value = {
    title: '',
    content: '',
    note_type: '',
    is_private: false
  }
}

// Utility methods
const getNoteTypeColor = (type) => {
  const colors = {
    analysis: 'info',
    idea: 'success',
    important: 'error',
    question: 'warning',
    reminder: 'purple'
  }
  return colors[type] || 'grey'
}

const getNoteTypeText = (type) => {
  const texts = {
    analysis: 'Анализ',
    idea: 'Идея',
    important: 'Важное',
    question: 'Вопрос',
    reminder: 'Напоминание'
  }
  return texts[type] || type
}

const getAuditActionColor = (action) => {
  const colors = {
    create: 'success',
    update: 'info',
    delete: 'error',
    approve: 'success',
    reject: 'error'
  }
  return colors[action] || 'grey'
}

const getAuditActionIcon = (action) => {
  const icons = {
    create: 'mdi-plus',
    update: 'mdi-pencil',
    delete: 'mdi-delete',
    approve: 'mdi-check',
    reject: 'mdi-close'
  }
  return icons[action] || 'mdi-help'
}

const getAuditActionText = (action) => {
  const texts = {
    create: 'Создание',
    update: 'Обновление',
    delete: 'Удаление',
    approve: 'Утверждение',
    reject: 'Отклонение'
  }
  return texts[action] || action
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('ru-RU')
}

onMounted(() => {
  // Инициализация при необходимости
})
</script>

<style scoped>
.notes-panel, .audit-panel {
  overflow: hidden;
}

.notes-list, .audit-timeline {
  max-height: calc(80vh - 200px);
}

.h-100 {
  height: 100vh;
  max-height: 80vh;
}
</style>