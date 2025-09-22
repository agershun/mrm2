<template>
  <v-dialog v-model="dialog" max-width="1000px" persistent>
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-play-circle</v-icon>
        Тестирование промпта: {{ prompt?.name }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <h4 class="mb-3">Входные данные</h4>
            <v-textarea
              v-model="testInput"
              label="Введите данные для тестирования"
              variant="outlined"
              rows="10"
              auto-grow
              :placeholder="prompt?.example_input || 'Введите тестовые данные...'"
            />

            <v-btn
              color="primary"
              :loading="testing"
              :disabled="!testInput.trim()"
              @click="runTest"
              block
              class="mt-2"
            >
              <v-icon>mdi-play</v-icon>
              Выполнить тест
            </v-btn>
          </v-col>

          <v-col cols="12" md="6">
            <h4 class="mb-3">Результат</h4>
            <v-card v-if="testResult" variant="outlined">
              <v-card-text>
                <pre class="text-wrap">{{ testResult }}</pre>
              </v-card-text>
            </v-card>
            <v-card v-else-if="testing" variant="outlined">
              <v-card-text class="text-center">
                <v-progress-circular indeterminate color="primary" />
                <p class="mt-2">Выполняется тестирование...</p>
              </v-card-text>
            </v-card>
            <v-card v-else variant="outlined" class="text-center pa-8">
              <v-icon size="48" color="grey-lighten-1">mdi-test-tube</v-icon>
              <p class="text-grey mt-2">Результат появится здесь</p>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-expansion-panels>
          <v-expansion-panel title="Детали промпта">
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title>Шаг</v-list-item-title>
                      <v-list-item-subtitle>{{ prompt?.step }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Версия</v-list-item-title>
                      <v-list-item-subtitle>{{ prompt?.version }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Макс. токенов</v-list-item-title>
                      <v-list-item-subtitle>{{ prompt?.max_tokens }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Температура</v-list-item-title>
                      <v-list-item-subtitle>{{ prompt?.temperature }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <h5>Системное сообщение:</h5>
                  <p class="text-body-2 mt-1">{{ prompt?.system_message || 'Не задано' }}</p>
                </v-col>
              </v-row>

              <v-divider class="my-3" />

              <h5>Содержание промпта:</h5>
              <pre class="text-wrap text-body-2 mt-1">{{ prompt?.content }}</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel v-if="testHistory.length > 0" title="История тестирования">
            <v-expansion-panel-text>
              <v-timeline density="compact">
                <v-timeline-item
                  v-for="(test, index) in testHistory"
                  :key="index"
                  dot-color="primary"
                  size="small"
                >
                  <template #opposite>
                    <span class="text-caption">{{ formatTime(test.timestamp) }}</span>
                  </template>
                  <v-card variant="outlined" density="compact">
                    <v-card-text>
                      <div class="text-caption text-grey mb-1">Входные данные:</div>
                      <div class="text-body-2 mb-2">{{ test.input.substring(0, 100) }}...</div>
                      <div class="text-caption text-grey mb-1">Результат:</div>
                      <div class="text-body-2">{{ test.output.substring(0, 100) }}...</div>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Закрыть</v-btn>
        <v-btn
          color="secondary"
          :disabled="!testResult"
          @click="copyResult"
        >
          <v-icon>mdi-content-copy</v-icon>
          Копировать результат
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePromptsStore } from '@/stores/promptsStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  prompt: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const promptsStore = usePromptsStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const testInput = ref('')
const testResult = ref('')
const testing = ref(false)
const testHistory = ref([])

const runTest = async () => {
  if (!testInput.value.trim()) return

  testing.value = true
  try {
    const result = await promptsStore.executePrompt(props.prompt.prompt_id, testInput.value)
    testResult.value = result.output

    testHistory.value.unshift({
      timestamp: new Date(),
      input: testInput.value,
      output: result.output
    })

    if (testHistory.value.length > 10) {
      testHistory.value = testHistory.value.slice(0, 10)
    }
  } catch (error) {
    testResult.value = `Ошибка: ${error.message}`
  } finally {
    testing.value = false
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(testResult.value)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const formatTime = (date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Roboto Mono', monospace;
}
</style>