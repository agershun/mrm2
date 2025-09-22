<template>
  <div class="campaigns-cards">
    <v-row>
      <v-col v-for="campaign in campaigns" :key="campaign.campaign_id" cols="12" sm="6" md="4">
        <v-card>
          <v-card-title>{{ campaign.name }}</v-card-title>
          <v-card-subtitle>{{ campaign.channel }}</v-card-subtitle>
          <v-card-actions>
            <v-btn variant="text" @click="$emit('view-details', campaign)">Подробнее</v-btn>
            <v-btn variant="text" @click="$emit('edit', campaign)">Редактировать</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
defineProps({
  campaigns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  groupBy: { type: String, default: null }
})

defineEmits(['select', 'edit', 'duplicate', 'delete', 'view-details'])
</script>