<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <div v-html="text"></div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn color="error" @click="confirm">Подтвердить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Подтверждение' },
  text: { type: String, default: 'Вы уверены?' }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const confirm = () => {
  emit('confirm')
  dialog.value = false
}
</script>