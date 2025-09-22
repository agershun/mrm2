<template>
  <div class="prompt-pipeline">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5">Конвейер промптов</h2>
      <v-btn color="primary" @click="showCreateDialog = true">
        <v-icon>mdi-plus</v-icon>
        Запустить конвейер
      </v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Активные выполнения</v-card-title>
          <v-card-text>
            <v-list v-if="executions.length > 0">
              <v-list-item
                v-for="execution in executions"
                :key="execution.execution_id"
                @click="viewExecution(execution)"
              >
                <template #prepend>
                  <v-avatar :color="getStatusColor(execution.status)">
                    <v-icon>{{ getStatusIcon(execution.status) }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>
                  Выполнение #{{ execution.execution_id }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Начато: {{ formatDate(execution.started_at) }}
                  <br>
                  Шаг: {{ execution.current_step }} / {{ execution.total_steps }}
                </v-list-item-subtitle>

                <template #append>
                  <v-progress-circular
                    v-if="execution.status === 'running'"
                    :model-value="(execution.current_step / execution.total_steps) * 100"
                    size="40"
                    width="4"
                    color="primary"
                  >
                    {{ execution.current_step }}
                  </v-progress-circular>
                  <v-chip
                    v-else
                    :color="getStatusColor(execution.status)"
                    size="small"
                  >
                    {{ getStatusText(execution.status) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>

            <div v-else class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2">mdi-cogs</v-icon>
              <h3 class="text-h6 mt-2">Нет активных выполнений</h3>
              <p class="text-grey">Запустите новый конвейер для начала работы</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Шаги конвейера</v-card-title>
          <v-card-text>
            <v-stepper
              v-model="currentStep"
              alt-labels
              vertical
              flat
            >
              <v-stepper-item
                v-for="(step, index) in pipelineSteps"
                :key="step.value"
                :value="index + 1"
                :title="step.title"
                :subtitle="step.description"
                :color="getStepColor(index + 1)"
                :complete="index + 1 < currentStep"
              >
                <template #icon>
                  <v-icon>{{ step.icon }}</v-icon>
                </template>
              </v-stepper-item>
            </v-stepper>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог запуска конвейера -->
    <v-dialog v-model="showCreateDialog" max-width="600px">
      <v-card>
        <v-card-title>Запуск конвейера промптов</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="inputData"
            label="Входные данные"
            placeholder="Введите маркетинговый кейс или стратегию кампании..."
            variant="outlined"
            rows="8"
            auto-grow
          />

          <v-select
            v-model="selectedTemplate"
            :items="templates"
            item-title="name"
            item-value="template_id"
            label="Шаблон кампании"
            variant="outlined"
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!inputData.trim()"
            :loading="starting"
            @click="startPipeline"
          >
            Запустить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог просмотра выполнения -->
    <ExecutionViewDialog
      v-model="showExecutionDialog"
      :execution="selectedExecution"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePromptsStore } from '@/stores/promptsStore'
import ExecutionViewDialog from './ExecutionViewDialog.vue'

const promptsStore = usePromptsStore()

const showCreateDialog = ref(false)
const showExecutionDialog = ref(false)
const inputData = ref('')
const selectedTemplate = ref(null)
const selectedExecution = ref(null)
const starting = ref(false)
const currentStep = ref(1)

const executions = computed(() => promptsStore.executions)
const templates = computed(() => promptsStore.templates)

const pipelineSteps = [
  { value: 'campaign_card', title: 'Карточка кампании', description: 'Создание базовой карточки', icon: 'mdi-card-text' },
  { value: 'parameters_extraction', title: 'Параметры', description: 'Извлечение параметров', icon: 'mdi-cog' },
  { value: 'media_mix_generation', title: 'Медиа-микс', description: 'Генерация медиа-микса', icon: 'mdi-chart-pie' },
  { value: 'optimization', title: 'Оптимизация', description: 'Оптимизация стратегии', icon: 'mdi-tune' },
  { value: 'media_plan_generation', title: 'Медиа-план', description: 'Создание медиа-плана', icon: 'mdi-calendar' },
  { value: 'documentation', title: 'Документация', description: 'Создание документов', icon: 'mdi-file-document' },
  { value: 'kpi_analysis', title: 'KPI анализ', description: 'Анализ показателей', icon: 'mdi-chart-line' },
  { value: 'historical_analysis', title: 'История', description: 'Исторический анализ', icon: 'mdi-history' },
  { value: 'file_analysis', title: 'Файлы', description: 'Анализ файлов', icon: 'mdi-file-search' },
  { value: 'final_report', title: 'Отчет', description: 'Итоговый отчет', icon: 'mdi-file-chart' }
]

const getStatusColor = (status) => {
  const colors = {
    running: 'primary',
    completed: 'success',
    failed: 'error',
    paused: 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    running: 'mdi-play',
    completed: 'mdi-check',
    failed: 'mdi-alert',
    paused: 'mdi-pause'
  }
  return icons[status] || 'mdi-help'
}

const getStatusText = (status) => {
  const texts = {
    running: 'Выполняется',
    completed: 'Завершено',
    failed: 'Ошибка',
    paused: 'Приостановлено'
  }
  return texts[status] || 'Неизвестно'
}

const getStepColor = (step) => {
  if (step < currentStep) return 'success'
  if (step === currentStep) return 'primary'
  return 'grey-lighten-1'
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

const startPipeline = async () => {
  starting.value = true
  try {
    await promptsStore.executePipeline({
      input_data: inputData.value,
      template_id: selectedTemplate.value
    })
    showCreateDialog.value = false
    inputData.value = ''
    selectedTemplate.value = null
  } finally {
    starting.value = false
  }
}

const viewExecution = (execution) => {
  selectedExecution.value = execution
  showExecutionDialog.value = true
}

onMounted(async () => {
  await Promise.all([
    promptsStore.fetchExecutions(),
    promptsStore.fetchTemplates()
  ])
})
</script>