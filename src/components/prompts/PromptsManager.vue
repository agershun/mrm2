<template>
  <div class="prompts-manager">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5">Управление промптами</h2>
      <v-btn color="primary" @click="showCreateDialog = true">
        <v-icon>mdi-plus</v-icon>
        Создать промпт
      </v-btn>
    </div>

    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Поиск промптов"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterStep"
              :items="stepOptions"
              label="Шаг"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="Статус"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="filteredPrompts"
        :loading="loading"
        item-value="prompt_id"
      >
        <template #item.step="{ item }">
          <v-chip size="small" :color="getStepColor(item.step)">
            {{ item.step }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip
            size="small"
            :color="item.status === 'active' ? 'success' : 'grey'"
          >
            {{ item.status === 'active' ? 'Активный' : 'Неактивный' }}
          </v-chip>
        </template>

        <template #item.updated_at="{ item }">
          {{ formatDate(item.updated_at) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="editPrompt(item)"
          />
          <v-btn
            icon="mdi-play"
            size="small"
            variant="text"
            color="primary"
            @click="testPrompt(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="deletePrompt(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования промпта -->
    <PromptEditDialog
      v-model="showCreateDialog"
      :prompt="selectedPrompt"
      @saved="handlePromptSaved"
    />

    <!-- Диалог тестирования промпта -->
    <PromptTestDialog
      v-model="showTestDialog"
      :prompt="testingPrompt"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePromptsStore } from '@/stores/promptsStore'
import PromptEditDialog from './PromptEditDialog.vue'
import PromptTestDialog from './PromptTestDialog.vue'

const promptsStore = usePromptsStore()

const searchQuery = ref('')
const filterStep = ref(null)
const filterStatus = ref(null)
const showCreateDialog = ref(false)
const showTestDialog = ref(false)
const selectedPrompt = ref(null)
const testingPrompt = ref(null)
const loading = ref(false)

const headers = [
  { title: 'Название', value: 'name', width: '25%' },
  { title: 'Шаг', value: 'step', width: '10%' },
  { title: 'Статус', value: 'status', width: '10%' },
  { title: 'Обновлен', value: 'updated_at', width: '15%' },
  { title: 'Действия', value: 'actions', width: '15%', sortable: false }
]

const stepOptions = [
  'campaign_card',
  'parameters_extraction',
  'media_mix_generation',
  'optimization',
  'media_plan_generation',
  'documentation',
  'kpi_analysis',
  'historical_analysis',
  'file_analysis',
  'final_report'
]

const statusOptions = [
  { title: 'Активный', value: 'active' },
  { title: 'Неактивный', value: 'inactive' }
]

const filteredPrompts = computed(() => {
  let prompts = promptsStore.prompts

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    prompts = prompts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query)
    )
  }

  if (filterStep.value) {
    prompts = prompts.filter(p => p.step === filterStep.value)
  }

  if (filterStatus.value) {
    prompts = prompts.filter(p => p.status === filterStatus.value)
  }

  return prompts
})

const getStepColor = (step) => {
  const colors = {
    campaign_card: 'primary',
    parameters_extraction: 'secondary',
    media_mix_generation: 'success',
    optimization: 'warning',
    media_plan_generation: 'info',
    documentation: 'purple',
    kpi_analysis: 'teal',
    historical_analysis: 'orange',
    file_analysis: 'blue-grey',
    final_report: 'red'
  }
  return colors[step] || 'grey'
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const editPrompt = (prompt) => {
  selectedPrompt.value = prompt
  showCreateDialog.value = true
}

const testPrompt = (prompt) => {
  testingPrompt.value = prompt
  showTestDialog.value = true
}

const deletePrompt = async (prompt) => {
  if (confirm(`Удалить промпт "${prompt.name}"?`)) {
    await promptsStore.deletePrompt(prompt.prompt_id)
  }
}

const handlePromptSaved = () => {
  showCreateDialog.value = false
  selectedPrompt.value = null
}

onMounted(async () => {
  loading.value = true
  await promptsStore.fetchPrompts()
  loading.value = false
})
</script>