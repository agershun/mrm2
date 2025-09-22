<template>
  <v-dialog v-model="dialog" max-width="1200px" persistent>
    <v-card v-if="execution">
      <v-card-title>
        <v-icon class="me-2">mdi-cogs</v-icon>
        Выполнение #{{ execution.execution_id }}
        <v-spacer />
        <v-chip :color="getStatusColor(execution.status)">
          {{ getStatusText(execution.status) }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-card variant="outlined">
              <v-card-title>Информация</v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>Начато</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(execution.started_at) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="execution.completed_at">
                    <v-list-item-title>Завершено</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(execution.completed_at) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Шаг</v-list-item-title>
                    <v-list-item-subtitle>{{ execution.current_step }} / {{ execution.total_steps }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Прогресс</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-progress-linear
                        :model-value="(execution.current_step / execution.total_steps) * 100"
                        color="primary"
                        height="8"
                        rounded
                      />
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-card variant="outlined" class="mt-4">
              <v-card-title>Входные данные</v-card-title>
              <v-card-text>
                <pre class="text-wrap">{{ execution.input_data }}</pre>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="8">
            <v-tabs v-model="activeTab">
              <v-tab value="steps">Шаги</v-tab>
              <v-tab value="output">Результат</v-tab>
              <v-tab value="logs">Логи</v-tab>
            </v-tabs>

            <v-tabs-window v-model="activeTab">
              <v-tabs-window-item value="steps">
                <v-stepper v-model="execution.current_step" alt-labels flat>
                  <v-stepper-item
                    v-for="(step, index) in executionSteps"
                    :key="step.step"
                    :value="index + 1"
                    :title="step.step_name"
                    :subtitle="getStepStatus(step)"
                    :color="getStepItemColor(step, index + 1)"
                    :complete="step.status === 'completed'"
                    :error="step.status === 'failed'"
                  >
                    <v-card v-if="step.output" variant="outlined" class="ma-2">
                      <v-card-text>
                        <div class="text-caption text-grey mb-2">Результат шага:</div>
                        <pre class="text-wrap">{{ step.output.substring(0, 200) }}{{ step.output.length > 200 ? '...' : '' }}</pre>
                        <v-btn
                          v-if="step.output.length > 200"
                          size="small"
                          variant="text"
                          @click="showFullOutput(step)"
                        >
                          Показать полностью
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-stepper-item>
                </v-stepper>
              </v-tabs-window-item>

              <v-tabs-window-item value="output">
                <v-card variant="outlined" class="mt-4">
                  <v-card-text>
                    <div v-if="execution.output">
                      <pre class="text-wrap">{{ execution.output }}</pre>
                    </div>
                    <div v-else class="text-center pa-8">
                      <v-icon size="48" color="grey-lighten-1">mdi-file-outline</v-icon>
                      <p class="text-grey mt-2">Результат будет доступен после завершения</p>
                    </div>
                  </v-card-text>
                </v-card>
              </v-tabs-window-item>

              <v-tabs-window-item value="logs">
                <v-card variant="outlined" class="mt-4">
                  <v-card-text>
                    <div v-if="execution.logs && execution.logs.length > 0">
                      <v-timeline density="compact">
                        <v-timeline-item
                          v-for="(log, index) in execution.logs"
                          :key="index"
                          :dot-color="getLogColor(log.level)"
                          size="small"
                        >
                          <template #opposite>
                            <span class="text-caption">{{ formatTime(log.timestamp) }}</span>
                          </template>
                          <div>
                            <div class="text-caption text-grey">{{ log.level.toUpperCase() }}</div>
                            <div class="text-body-2">{{ log.message }}</div>
                          </div>
                        </v-timeline-item>
                      </v-timeline>
                    </div>
                    <div v-else class="text-center pa-8">
                      <v-icon size="48" color="grey-lighten-1">mdi-format-list-bulleted</v-icon>
                      <p class="text-grey mt-2">Логи отсутствуют</p>
                    </div>
                  </v-card-text>
                </v-card>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="execution.status === 'running'"
          color="warning"
          @click="pauseExecution"
        >
          <v-icon>mdi-pause</v-icon>
          Приостановить
        </v-btn>
        <v-btn
          v-if="execution.status === 'paused'"
          color="primary"
          @click="resumeExecution"
        >
          <v-icon>mdi-play</v-icon>
          Продолжить
        </v-btn>
        <v-btn
          v-if="execution.status === 'running' || execution.status === 'paused'"
          color="error"
          @click="stopExecution"
        >
          <v-icon>mdi-stop</v-icon>
          Остановить
        </v-btn>
        <v-spacer />
        <v-btn @click="dialog = false">Закрыть</v-btn>
        <v-btn
          v-if="execution.output"
          color="secondary"
          @click="downloadResult"
        >
          <v-icon>mdi-download</v-icon>
          Скачать результат
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Диалог полного вывода шага -->
    <v-dialog v-model="showFullOutputDialog" max-width="800px">
      <v-card>
        <v-card-title>Полный результат шага</v-card-title>
        <v-card-text>
          <pre class="text-wrap">{{ fullOutputText }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showFullOutputDialog = false">Закрыть</v-btn>
          <v-btn color="secondary" @click="copyFullOutput">
            <v-icon>mdi-content-copy</v-icon>
            Копировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePromptsStore } from '@/stores/promptsStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  execution: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const promptsStore = usePromptsStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('steps')
const showFullOutputDialog = ref(false)
const fullOutputText = ref('')

const executionSteps = computed(() => props.execution?.steps || [])

const getStatusColor = (status) => {
  const colors = {
    running: 'primary',
    completed: 'success',
    failed: 'error',
    paused: 'warning'
  }
  return colors[status] || 'grey'
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

const getStepStatus = (step) => {
  if (step.status === 'completed') return 'Завершен'
  if (step.status === 'failed') return 'Ошибка'
  if (step.status === 'running') return 'Выполняется'
  return 'Ожидание'
}

const getStepItemColor = (step, index) => {
  if (step.status === 'completed') return 'success'
  if (step.status === 'failed') return 'error'
  if (step.status === 'running') return 'primary'
  return 'grey-lighten-1'
}

const getLogColor = (level) => {
  const colors = {
    error: 'error',
    warning: 'warning',
    info: 'info',
    debug: 'grey'
  }
  return colors[level] || 'grey'
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

const formatTime = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(dateString))
}

const showFullOutput = (step) => {
  fullOutputText.value = step.output
  showFullOutputDialog.value = true
}

const copyFullOutput = async () => {
  try {
    await navigator.clipboard.writeText(fullOutputText.value)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const pauseExecution = async () => {
  await promptsStore.pauseExecution(props.execution.execution_id)
}

const resumeExecution = async () => {
  await promptsStore.resumeExecution(props.execution.execution_id)
}

const stopExecution = async () => {
  if (confirm('Вы уверены, что хотите остановить выполнение?')) {
    await promptsStore.stopExecution(props.execution.execution_id)
  }
}

const downloadResult = () => {
  const blob = new Blob([props.execution.output], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `execution_${props.execution.execution_id}_result.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
}
</style>