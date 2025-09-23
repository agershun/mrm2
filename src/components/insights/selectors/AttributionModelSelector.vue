<template>
  <v-card variant="outlined">
    <v-card-title class="text-subtitle-1">Модель атрибуции</v-card-title>
    <v-card-text>
      <v-select
        v-model="selectedModel"
        :items="attributionModels"
        item-title="name"
        item-value="value"
        label="Выберите модель"
        variant="outlined"
        density="compact"
        @update:model-value="handleModelChange"
      >
        <template #item="{ props: itemProps, item }">
          <v-list-item v-bind="itemProps">
            <template #append>
              <v-icon>{{ item.raw.icon }}</v-icon>
            </template>
            <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
          </v-list-item>
        </template>
      </v-select>

      <div v-if="selectedModelInfo" class="mt-3">
        <v-alert
          :icon="selectedModelInfo.icon"
          :color="selectedModelInfo.color"
          variant="tonal"
          density="compact"
        >
          <div class="text-subtitle-2">{{ selectedModelInfo.name }}</div>
          <div class="text-body-2">{{ selectedModelInfo.description }}</div>
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'last_click' }
})

const emit = defineEmits(['update:modelValue', 'model-changed'])

const selectedModel = ref(props.modelValue)

const attributionModels = [
  {
    name: 'Последний клик',
    value: 'last_click',
    description: '100% атрибуции последнему касанию',
    icon: 'mdi-cursor-pointer',
    color: 'primary'
  },
  {
    name: 'Первый клик',
    value: 'first_click',
    description: '100% атрибуции первому касанию',
    icon: 'mdi-play',
    color: 'success'
  },
  {
    name: 'Линейная',
    value: 'linear',
    description: 'Равномерное распределение между всеми касаниями',
    icon: 'mdi-chart-line',
    color: 'info'
  },
  {
    name: 'По убыванию времени',
    value: 'time_decay',
    description: 'Больший вес последним касаниям',
    icon: 'mdi-trending-down',
    color: 'warning'
  },
  {
    name: 'По позиции',
    value: 'position_based',
    description: '40% первому, 40% последнему, 20% остальным',
    icon: 'mdi-weight',
    color: 'purple'
  }
]

const selectedModelInfo = computed(() => {
  return attributionModels.find(model => model.value === selectedModel.value)
})

watch(selectedModel, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleModelChange = (model) => {
  emit('model-changed', model)
}
</script>