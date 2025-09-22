<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        {{ isEdit ? 'Редактирование промпта' : 'Создание промпта' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.name"
                label="Название промпта"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.step"
                :items="stepOptions"
                label="Шаг"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.status"
                :items="statusOptions"
                label="Статус"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.version"
                label="Версия"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-textarea
            v-model="form.content"
            label="Содержание промпта"
            :rules="[rules.required]"
            variant="outlined"
            rows="8"
            auto-grow
          />

          <v-textarea
            v-model="form.system_message"
            label="Системное сообщение"
            variant="outlined"
            rows="3"
            auto-grow
          />

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.max_tokens"
                label="Максимум токенов"
                type="number"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.temperature"
                label="Температура"
                type="number"
                step="0.1"
                min="0"
                max="2"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-textarea
            v-model="form.example_input"
            label="Пример входных данных"
            variant="outlined"
            rows="3"
            auto-grow
          />

          <v-textarea
            v-model="form.example_output"
            label="Пример выходных данных"
            variant="outlined"
            rows="3"
            auto-grow
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn
          color="primary"
          :disabled="!valid"
          :loading="saving"
          @click="savePrompt"
        >
          {{ isEdit ? 'Сохранить' : 'Создать' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePromptsStore } from '@/stores/promptsStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  prompt: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const promptsStore = usePromptsStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.prompt)
const valid = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  step: '',
  content: '',
  system_message: '',
  max_tokens: 2000,
  temperature: 0.7,
  version: '1.0',
  status: 'active',
  example_input: '',
  example_output: ''
})

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения'
}

const stepOptions = [
  { title: 'Карточка кампании', value: 'campaign_card' },
  { title: 'Извлечение параметров', value: 'parameters_extraction' },
  { title: 'Генерация медиа-микса', value: 'media_mix_generation' },
  { title: 'Оптимизация', value: 'optimization' },
  { title: 'Генерация медиа-плана', value: 'media_plan_generation' },
  { title: 'Документация', value: 'documentation' },
  { title: 'Анализ KPI', value: 'kpi_analysis' },
  { title: 'Исторический анализ', value: 'historical_analysis' },
  { title: 'Анализ файлов', value: 'file_analysis' },
  { title: 'Итоговый отчет', value: 'final_report' }
]

const statusOptions = [
  { title: 'Активный', value: 'active' },
  { title: 'Неактивный', value: 'inactive' }
]

const savePrompt = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await promptsStore.updatePrompt(props.prompt.prompt_id, form.value)
    } else {
      await promptsStore.createPrompt(form.value)
    }
    emit('saved')
  } finally {
    saving.value = false
  }
}

watch(() => props.prompt, (prompt) => {
  if (prompt) {
    form.value = { ...prompt }
  } else {
    form.value = {
      name: '',
      step: '',
      content: '',
      system_message: '',
      max_tokens: 2000,
      temperature: 0.7,
      version: '1.0',
      status: 'active',
      example_input: '',
      example_output: ''
    }
  }
}, { immediate: true })
</script>