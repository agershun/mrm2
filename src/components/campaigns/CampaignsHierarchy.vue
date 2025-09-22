<template>
  <div class="campaigns-hierarchy">
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <div v-else-if="campaigns.length === 0" class="text-center py-8">
      <v-icon size="64" color="grey-lighten-2" class="mb-4">
        mdi-file-tree-outline
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">Нет кампаний для отображения</h3>
      <p class="text-body-2 text-grey-darken-1">
        Создайте новую кампанию или измените фильтры поиска
      </p>
    </div>

    <v-treeview
      v-else
      :items="hierarchyItems"
      item-key="id"
      item-title="name"
      item-children="children"
      density="compact"
      open-strategy="multiple"
      class="campaigns-tree"
    >
      <template #prepend="{ item }">
        <v-icon
          :color="getItemColor(item)"
          size="20"
        >
          {{ getItemIcon(item) }}
        </v-icon>
      </template>

      <template #title="{ item }">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <span class="font-weight-medium mr-2">{{ item.name }}</span>
            <v-chip
              v-if="item.type === 'campaign'"
              :color="getStatusColor(item.raw.status)"
              size="x-small"
              variant="flat"
            >
              {{ item.raw.status }}
            </v-chip>
          </div>

          <div class="d-flex align-center">
            <span v-if="item.type === 'campaign'" class="text-caption text-grey-darken-1 mr-2">
              {{ formatCurrency(item.raw.budget_value) }}
            </span>

            <v-btn-group variant="text" density="compact">
              <v-btn
                v-if="item.type === 'campaign'"
                icon="mdi-eye"
                size="x-small"
                @click.stop="$emit('view-details', item.raw)"
              />
              <v-btn
                icon="mdi-pencil"
                size="x-small"
                @click.stop="$emit('edit', item.raw)"
              />
              <v-btn
                v-if="item.type === 'campaign'"
                icon="mdi-content-copy"
                size="x-small"
                @click.stop="$emit('duplicate', item.raw)"
              />
            </v-btn-group>
          </div>
        </div>
      </template>

      <template #append="{ item }">
        <div v-if="item.type === 'campaign'" class="text-caption text-grey-darken-1">
          {{ item.raw.channel }} • {{ formatDate(item.raw.start_date) }}
        </div>
      </template>
    </v-treeview>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'edit', 'view-details', 'duplicate'])

// Computed
const hierarchyItems = computed(() => {
  const grouped = {}

  // Группируем кампании по каналам
  props.campaigns.forEach(campaign => {
    const channel = campaign.channel || 'unknown'
    if (!grouped[channel]) {
      grouped[channel] = {
        id: `channel_${channel}`,
        name: `${channel.charAt(0).toUpperCase() + channel.slice(1)}`,
        type: 'channel',
        children: []
      }
    }

    // Группируем по объявлениям (ad groups)
    const adGroups = campaign.ad_groups || []
    if (adGroups.length > 0) {
      adGroups.forEach(adGroup => {
        const campaignNode = {
          id: `campaign_${campaign.campaign_id}`,
          name: campaign.name,
          type: 'campaign',
          raw: campaign,
          children: []
        }

        const adGroupNode = {
          id: `adgroup_${adGroup.ad_group_id}`,
          name: adGroup.name,
          type: 'ad_group',
          raw: adGroup,
          children: []
        }

        // Добавляем креативы
        const creatives = adGroup.ad_creatives || []
        creatives.forEach(creative => {
          adGroupNode.children.push({
            id: `creative_${creative.creative_id}`,
            name: creative.name,
            type: 'creative',
            raw: creative
          })
        })

        campaignNode.children.push(adGroupNode)
        grouped[channel].children.push(campaignNode)
      })
    } else {
      // Если нет групп объявлений, добавляем кампанию напрямую
      grouped[channel].children.push({
        id: `campaign_${campaign.campaign_id}`,
        name: campaign.name,
        type: 'campaign',
        raw: campaign
      })
    }
  })

  return Object.values(grouped)
})

// Methods
const getItemIcon = (item) => {
  switch (item.type) {
    case 'channel': return 'mdi-folder-outline'
    case 'campaign': return 'mdi-rocket-launch-outline'
    case 'ad_group': return 'mdi-folder-multiple-outline'
    case 'creative': return 'mdi-image-outline'
    default: return 'mdi-circle-small'
  }
}

const getItemColor = (item) => {
  switch (item.type) {
    case 'channel': return 'primary'
    case 'campaign': return 'secondary'
    case 'ad_group': return 'info'
    case 'creative': return 'success'
    default: return 'grey'
  }
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'error',
    draft: 'grey'
  }
  return colors[status] || 'grey'
}

const formatCurrency = (value) => {
  if (!value) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU')
}
</script>

<style scoped>
.campaigns-hierarchy {
  height: 100%;
}

.campaigns-tree {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

:deep(.v-treeview-item) {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.05);
}

:deep(.v-treeview-item--selected) {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

:deep(.v-treeview-item__content) {
  padding: 8px 0;
}
</style>