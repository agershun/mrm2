<template>
  <v-dialog v-model="dialog" max-width="1000px">
    <v-card>
      <v-card-title>Аналитика кампаний</v-card-title>
      <v-card-text>
        <div class="text-center pa-4">
          <v-icon size="64" color="grey-lighten-2">mdi-chart-bar</v-icon>
          <h3 class="text-h6 mt-2">Аналитика</h3>
          <p>Здесь будет отображаться аналитика по кампаниям</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  campaigns: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>