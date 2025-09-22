<template>
  <div class="settings-view">
    <!-- Заголовок -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Настройки системы</h1>
        <p class="text-body-1 text-medium-emphasis">
          Системные настройки, управление пользователями и администрирование
        </p>
      </div>
      <v-spacer />

      <!-- Поиск настроек -->
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Поиск настроек"
        variant="outlined"
        density="compact"
        style="width: 300px"
        clearable
      />
    </div>

    <v-row>
      <!-- Боковое меню -->
      <v-col cols="12" md="3">
        <v-card>
          <v-list nav>
            <v-list-subheader>Системные настройки</v-list-subheader>

            <v-list-item
              v-for="item in filteredMenuItems"
              :key="item.id"
              :value="item.id"
              :active="selectedSection === item.id"
              @click="selectedSection = item.id"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon" />
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <template v-slot:append v-if="item.badge">
                <v-chip size="small" color="primary">{{ item.badge }}</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Основной контент -->
      <v-col cols="12" md="9">
        <!-- Системные настройки -->
        <template v-if="selectedSection === 'system'">
          <SystemSettings />
        </template>

        <!-- User Management -->
        <template v-if="selectedSection === 'users'">
          <v-alert type="info" variant="tonal">
            Управление пользователями будет добавлено позже
          </v-alert>
        </template>

        <!-- Roles & Permissions -->
        <template v-if="selectedSection === 'roles'">
          <v-alert type="info" variant="tonal">
            Роли и права будут добавлены позже
          </v-alert>
        </template>

        <!-- Organization Settings -->
        <template v-if="selectedSection === 'organization'">
          <v-alert type="info" variant="tonal">
            Настройки организации будут добавлены позже
          </v-alert>
        </template>

        <!-- Profile Settings -->
        <template v-if="selectedSection === 'profile'">
          <v-alert type="info" variant="tonal">
            Настройки профиля будут добавлены позже
          </v-alert>
        </template>

        <!-- Security Settings -->
        <template v-if="selectedSection === 'security'">
          <v-alert type="info" variant="tonal">
            Настройки безопасности будут добавлены позже
          </v-alert>
        </template>

        <!-- Audit Logs -->
        <template v-if="selectedSection === 'audit'">
          <v-alert type="info" variant="tonal">
            Журнал аудита будет добавлен позже
          </v-alert>
        </template>

        <!-- Backup & Restore -->
        <template v-if="selectedSection === 'backup'">
          <v-alert type="info" variant="tonal">
            Резервное копирование будет добавлено позже
          </v-alert>
        </template>

        <!-- Integration Settings -->
        <template v-if="selectedSection === 'integrations'">
          <IntegrationSettings />
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import SystemSettings from '@/components/settings/SystemSettings.vue'
import IntegrationSettings from '@/components/settings/IntegrationSettings.vue'
// import DataSettings from '@/components/settings/DataSettings.vue'
// import BackupSettings from '@/components/settings/BackupSettings.vue'
// import SystemLogs from '@/components/settings/SystemLogs.vue'
// import SecuritySettings from '@/components/settings/SecuritySettings.vue'

export default {
  name: 'SettingsView',
  components: {
    SystemSettings,
    IntegrationSettings
    // DataSettings,
    // BackupSettings,
    // SystemLogs,
    // SecuritySettings
  },
  setup() {
    const selectedSection = ref('system')
    const searchQuery = ref('')

    const menuItems = ref([
      {
        id: 'system',
        title: 'Системные настройки',
        icon: 'mdi-cog',
        description: 'Общие настройки системы, производительность, уведомления'
      },
      {
        id: 'users',
        title: 'Управление пользователями',
        icon: 'mdi-account-multiple',
        description: 'Пользователи, команды и их права доступа',
        badge: 'Soon'
      },
      {
        id: 'roles',
        title: 'Роли и права',
        icon: 'mdi-shield-account',
        description: 'Настройка ролей и разрешений в системе',
        badge: 'Soon'
      },
      {
        id: 'organization',
        title: 'Настройки организации',
        icon: 'mdi-office-building',
        description: 'Корпоративные настройки и брендинг',
        badge: 'Soon'
      },
      {
        id: 'profile',
        title: 'Профиль пользователя',
        icon: 'mdi-account-circle',
        description: 'Персональные настройки и предпочтения',
        badge: 'Soon'
      },
      {
        id: 'security',
        title: 'Безопасность',
        icon: 'mdi-security',
        description: 'Настройки безопасности и аутентификации',
        badge: 'Soon'
      },
      {
        id: 'audit',
        title: 'Журнал аудита',
        icon: 'mdi-file-document-outline',
        description: 'Логи действий пользователей и системных событий',
        badge: 'Soon'
      },
      {
        id: 'backup',
        title: 'Резервное копирование',
        icon: 'mdi-backup-restore',
        description: 'Создание и восстановление резервных копий',
        badge: 'Soon'
      },
      {
        id: 'integrations',
        title: 'Интеграции',
        icon: 'mdi-connection',
        description: 'Настройки внешних интеграций'
      }
    ])

    const filteredMenuItems = computed(() => {
      if (!searchQuery.value) return menuItems.value

      const query = searchQuery.value.toLowerCase()
      return menuItems.value.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    })

    return {
      selectedSection,
      searchQuery,
      menuItems,
      filteredMenuItems
    }
  }
}
</script>

<style scoped>
.settings-view {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}

@media (max-width: 768px) {
  .settings-view {
    padding: 16px;
  }
}
</style>