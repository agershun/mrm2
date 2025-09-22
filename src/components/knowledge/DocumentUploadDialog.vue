<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title>Загрузка документа</v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-file-input
            v-model="files"
            label="Выберите файлы"
            :rules="[rules.required]"
            variant="outlined"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md"
            prepend-icon="mdi-paperclip"
            show-size
          />

          <v-text-field
            v-model="form.title"
            label="Название документа"
            :rules="[rules.required]"
            variant="outlined"
          />

          <v-textarea
            v-model="form.description"
            label="Описание"
            variant="outlined"
            rows="3"
          />

          <v-select
            v-model="form.type"
            :items="documentTypes"
            label="Тип документа"
            :rules="[rules.required]"
            variant="outlined"
          />

          <v-select
            v-model="form.industry"
            :items="industries"
            label="Индустрия"
            variant="outlined"
            clearable
          />

          <v-combobox
            v-model="form.tags"
            label="Теги"
            variant="outlined"
            multiple
            chips
            closable-chips
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn
          color="primary"
          :disabled="!valid"
          :loading="uploading"
          @click="uploadDocument"
        >
          Загрузить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

const knowledgeStore = useKnowledgeBaseStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const valid = ref(false)
const uploading = ref(false)
const files = ref([])

const form = ref({
  title: '',
  description: '',
  type: '',
  industry: '',
  tags: []
})

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения'
}

const documentTypes = [
  { title: 'Стратегия', value: 'strategy' },
  { title: 'Кейс-стади', value: 'case_study' },
  { title: 'Презентация', value: 'presentation' },
  { title: 'Отчет', value: 'report' },
  { title: 'Исследование', value: 'research' }
]

const industries = [
  'E-commerce',
  'Финансы',
  'Здравоохранение',
  'Образование',
  'Технологии',
  'Автомобили',
  'Недвижимость',
  'Туризм'
]

const uploadDocument = async () => {
  uploading.value = true
  try {
    // Имитация загрузки файла
    const documentData = {
      ...form.value,
      file_name: files.value[0]?.name,
      file_size: files.value[0]?.size,
      file_url: '#', // В реальном приложении здесь будет URL загруженного файла
      uploaded_at: new Date().toISOString()
    }

    await knowledgeStore.createMarketingDocument(documentData)
    emit('uploaded')

    // Сброс формы
    form.value = {
      title: '',
      description: '',
      type: '',
      industry: '',
      tags: []
    }
    files.value = []
  } finally {
    uploading.value = false
  }
}
</script>