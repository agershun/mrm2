<template>
  <div class="user-profile">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-account</v-icon>
        Основная информация
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveProfile">
          <!-- Аватар -->
          <div class="d-flex align-center mb-6">
            <v-avatar size="120" class="me-6">
              <v-img
                v-if="profile.avatar"
                :src="profile.avatar"
                alt="Аватар"
              />
              <v-icon
                v-else
                size="60"
                color="grey-lighten-1"
              >
                mdi-account
              </v-icon>
            </v-avatar>
            <div>
              <v-btn
                color="primary"
                variant="outlined"
                @click="uploadAvatar"
                class="mb-2"
              >
                <v-icon class="me-2">mdi-camera</v-icon>
                Загрузить фото
              </v-btn>
              <div class="text-caption text-medium-emphasis">
                Рекомендуемый размер: 200x200 пикселей
              </div>
            </div>
          </div>

          <!-- Личная информация -->
          <div class="profile-section">
            <h3 class="text-h6 mb-4">Личная информация</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.firstName"
                  label="Имя"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.lastName"
                  label="Фамилия"
                  variant="outlined"
                  required
                  :rules="[rules.required]"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.email"
                  label="Email"
                  variant="outlined"
                  type="email"
                  required
                  :rules="[rules.required, rules.email]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.phone"
                  label="Телефон"
                  variant="outlined"
                  type="tel"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.position"
                  label="Должность"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.department"
                  label="Отдел"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="profile.bio"
                  label="О себе"
                  variant="outlined"
                  rows="3"
                  counter="500"
                  :rules="[rules.maxLength(500)]"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Контактная информация -->
          <div class="profile-section">
            <h3 class="text-h6 mb-4">Контактная информация</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.workPhone"
                  label="Рабочий телефон"
                  variant="outlined"
                  type="tel"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.extension"
                  label="Добавочный номер"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.skype"
                  label="Skype"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.telegram"
                  label="Telegram"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Местоположение -->
          <div class="profile-section">
            <h3 class="text-h6 mb-4">Местоположение</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="profile.country"
                  :items="countries"
                  label="Страна"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.city"
                  label="Город"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="profile.timezone"
                  :items="timezones"
                  label="Часовой пояс"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="profile.language"
                  :items="languages"
                  label="Язык интерфейса"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Социальные сети -->
          <div class="profile-section">
            <h3 class="text-h6 mb-4">Социальные сети</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.linkedin"
                  label="LinkedIn"
                  variant="outlined"
                  prepend-inner-icon="mdi-linkedin"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profile.twitter"
                  label="Twitter"
                  variant="outlined"
                  prepend-inner-icon="mdi-twitter"
                />
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Статистика профиля -->
    <v-card class="mt-6">
      <v-card-title>
        <v-icon class="me-2">mdi-chart-line</v-icon>
        Статистика активности
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-primary">
                  {{ profileStats.daysActive }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Дней в системе
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-success">
                  {{ profileStats.activitiesCreated }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Активностей создано
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-info">
                  {{ profileStats.lastLogin }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Последний вход
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h4 font-weight-bold text-warning">
                  {{ profileStats.totalHours }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Часов работы
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Скрытое поле для загрузки файлов -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
// import { useUserStore } from '@/stores/userStore'
import { useAppStore } from '@/stores/appStore'

export default {
  name: 'UserProfile',
  setup() {
    // const userStore = useUserStore()
    const appStore = useAppStore()

    const fileInput = ref(null)

    const profile = ref({
      firstName: 'Анна',
      lastName: 'Петрова',
      email: 'anna.petrova@kreola.ru',
      phone: '+7 (495) 123-45-67',
      position: 'Маркетинг-менеджер',
      department: 'Маркетинг',
      bio: 'Опытный маркетинг-менеджер с 5-летним стажем в digital-маркетинге и управлении проектами.',
      workPhone: '+7 (495) 123-45-67',
      extension: '1234',
      skype: 'anna.petrova.kreola',
      telegram: '@anna_petrova',
      country: 'russia',
      city: 'Москва',
      timezone: 'Europe/Moscow',
      language: 'ru',
      linkedin: 'https://linkedin.com/in/anna-petrova',
      twitter: '@anna_petrova',
      avatar: null
    })

    const profileStats = ref({
      daysActive: 127,
      activitiesCreated: 45,
      lastLogin: '2 часа назад',
      totalHours: 324
    })

    const countries = ref([
      { title: 'Россия', value: 'russia' },
      { title: 'США', value: 'usa' },
      { title: 'Германия', value: 'germany' },
      { title: 'Великобритания', value: 'uk' }
    ])

    const timezones = ref([
      { title: 'Москва (UTC+3)', value: 'Europe/Moscow' },
      { title: 'Лондон (UTC+0)', value: 'Europe/London' },
      { title: 'Нью-Йорк (UTC-5)', value: 'America/New_York' },
      { title: 'Берлин (UTC+1)', value: 'Europe/Berlin' }
    ])

    const languages = ref([
      { title: 'Русский', value: 'ru' },
      { title: 'English', value: 'en' },
      { title: 'Deutsch', value: 'de' }
    ])

    const rules = {
      required: (value) => !!value || 'Поле обязательно для заполнения',
      email: (value) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(value) || 'Введите корректный email'
      },
      maxLength: (max) => (value) =>
        !value || value.length <= max || `Максимум ${max} символов`
    }

    const uploadAvatar = () => {
      fileInput.value?.click()
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          appStore.showError('Размер файла не должен превышать 2 МБ')
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          profile.value.avatar = e.target.result
          appStore.showSuccess('Аватар загружен успешно')
        }
        reader.readAsDataURL(file)
      }
    }

    const saveProfile = async () => {
      try {
        // await userStore.updateProfile(profile.value)
        console.log('Сохранение профиля:', profile.value)
        appStore.showSuccess('Профиль сохранен успешно')
      } catch (error) {
        console.error('Error saving profile:', error)
        appStore.showError('Ошибка сохранения профиля')
      }
    }

    onMounted(async () => {
      try {
        // const savedProfile = await userStore.getProfile()
        const savedProfile = null
        if (savedProfile) {
          profile.value = { ...profile.value, ...savedProfile }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    })

    return {
      profile,
      profileStats,
      countries,
      timezones,
      languages,
      rules,
      fileInput,
      uploadAvatar,
      handleFileUpload,
      saveProfile
    }
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 100%;
}

.profile-section {
  margin-bottom: 24px;
}

.profile-section:last-child {
  margin-bottom: 0;
}
</style>