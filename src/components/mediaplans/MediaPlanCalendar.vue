<template>
  <div class="media-plan-calendar">
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between align-center w-100">
          <span>Календарь медиа-планов</span>
          <div class="d-flex align-center">
            <v-btn-toggle v-model="viewMode" mandatory>
              <v-btn value="month" size="small">Месяц</v-btn>
              <v-btn value="week" size="small">Неделя</v-btn>
            </v-btn-toggle>
            <v-spacer class="mx-2" />
            <v-btn
              icon="mdi-chevron-left"
              size="small"
              variant="text"
              @click="previousPeriod"
            />
            <span class="mx-2 font-weight-medium">{{ currentPeriodLabel }}</span>
            <v-btn
              icon="mdi-chevron-right"
              size="small"
              variant="text"
              @click="nextPeriod"
            />
            <v-btn
              icon="mdi-calendar-today"
              size="small"
              variant="text"
              @click="goToToday"
            />
          </div>
        </div>
      </v-card-title>

      <v-card-text>
        <!-- Календарная сетка -->
        <div class="calendar-grid">
          <!-- Заголовки дней недели -->
          <div class="calendar-header">
            <div
              v-for="day in weekDays"
              :key="day"
              class="calendar-day-header"
            >
              {{ day }}
            </div>
          </div>

          <!-- Дни календаря -->
          <div class="calendar-body">
            <div
              v-for="day in calendarDays"
              :key="day.date"
              class="calendar-day"
              :class="{
                'calendar-day--today': day.isToday,
                'calendar-day--other-month': day.isOtherMonth
              }"
              @click="selectDay(day)"
            >
              <div class="calendar-day-number">{{ day.dayNumber }}</div>

              <!-- Планы в этот день -->
              <div class="calendar-events">
                <div
                  v-for="event in day.events"
                  :key="event.id"
                  class="calendar-event"
                  :class="`calendar-event--${event.type}`"
                  @click.stop="viewEvent(event)"
                >
                  <div class="calendar-event-title">{{ event.title }}</div>
                  <div class="calendar-event-time">{{ event.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Список планов на выбранный день -->
        <v-card v-if="selectedDay" variant="outlined" class="mt-4">
          <v-card-title>
            События на {{ formatDate(selectedDay.date) }}
          </v-card-title>
          <v-card-text>
            <div v-if="selectedDay.events.length === 0" class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-2">mdi-calendar-outline</v-icon>
              <p class="text-grey mt-2">Нет запланированных событий</p>
            </div>

            <v-list v-else density="compact">
              <v-list-item
                v-for="event in selectedDay.events"
                :key="event.id"
                @click="viewEvent(event)"
              >
                <template #prepend>
                  <v-avatar
                    size="32"
                    :color="getEventColor(event.type)"
                  >
                    <v-icon size="16" color="white">{{ getEventIcon(event.type) }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>{{ event.title }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ event.time }} • {{ event.description }}
                </v-list-item-subtitle>

                <template #append>
                  <v-chip
                    size="small"
                    :color="getStatusColor(event.status)"
                  >
                    {{ getStatusLabel(event.status) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <!-- Диалог просмотра события -->
    <v-dialog v-model="showEventDialog" max-width="600px">
      <v-card v-if="selectedEvent">
        <v-card-title>
          <v-icon class="me-2" :color="getEventColor(selectedEvent.type)">
            {{ getEventIcon(selectedEvent.type) }}
          </v-icon>
          {{ selectedEvent.title }}
        </v-card-title>

        <v-card-text>
          <v-list density="compact">
            <v-list-item>
              <v-list-item-title>Дата и время</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(selectedEvent.date) }} в {{ selectedEvent.time }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Тип события</v-list-item-title>
              <v-list-item-subtitle>{{ getEventTypeLabel(selectedEvent.type) }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Статус</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip size="small" :color="getStatusColor(selectedEvent.status)">
                  {{ getStatusLabel(selectedEvent.status) }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="selectedEvent.description">
              <v-list-item-title>Описание</v-list-item-title>
              <v-list-item-subtitle>{{ selectedEvent.description }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="showEventDialog = false">Закрыть</v-btn>
          <v-btn color="primary" @click="editEvent">Редактировать</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  mediaplans: { type: Array, default: () => [] }
})

const viewMode = ref('month')
const currentDate = ref(new Date())
const selectedDay = ref(null)
const showEventDialog = ref(false)
const selectedEvent = ref(null)

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const currentPeriodLabel = computed(() => {
  const options = {
    year: 'numeric',
    month: 'long'
  }
  return currentDate.value.toLocaleDateString('ru-RU', options)
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // Первый день месяца
  const firstDay = new Date(year, month, 1)
  // Последний день месяца
  const lastDay = new Date(year, month + 1, 0)

  // Первый день недели (понедельник = 1)
  const firstWeekDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay()

  const days = []

  // Дни предыдущего месяца
  for (let i = firstWeekDay - 1; i > 0; i--) {
    const prevDate = new Date(year, month, 1 - i)
    days.push({
      date: prevDate.toISOString().split('T')[0],
      dayNumber: prevDate.getDate(),
      isOtherMonth: true,
      isToday: false,
      events: getEventsForDate(prevDate)
    })
  }

  // Дни текущего месяца
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const today = new Date()

    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: day,
      isOtherMonth: false,
      isToday: date.toDateString() === today.toDateString(),
      events: getEventsForDate(date)
    })
  }

  // Дни следующего месяца
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(year, month + 1, day)
    days.push({
      date: nextDate.toISOString().split('T')[0],
      dayNumber: day,
      isOtherMonth: true,
      isToday: false,
      events: getEventsForDate(nextDate)
    })
  }

  return days
})

const getEventsForDate = (date) => {
  const events = []
  const dateStr = date.toISOString().split('T')[0]

  // Получаем события из медиа-планов
  props.mediaplans.forEach(plan => {
    const startDate = new Date(plan.start_date)
    const endDate = new Date(plan.end_date)

    if (date >= startDate && date <= endDate) {
      // Добавляем событие запуска
      if (date.toDateString() === startDate.toDateString()) {
        events.push({
          id: `start-${plan.plan_id}`,
          title: `Запуск: ${plan.name}`,
          time: '09:00',
          type: 'start',
          status: plan.status,
          description: plan.description,
          date: dateStr,
          planId: plan.plan_id
        })
      }

      // Добавляем событие завершения
      if (date.toDateString() === endDate.toDateString()) {
        events.push({
          id: `end-${plan.plan_id}`,
          title: `Завершение: ${plan.name}`,
          time: '18:00',
          type: 'end',
          status: plan.status,
          description: plan.description,
          date: dateStr,
          planId: plan.plan_id
        })
      }

      // Добавляем рабочие события
      if (plan.flights) {
        plan.flights.forEach(flight => {
          const flightStart = new Date(flight.start_date)
          const flightEnd = new Date(flight.end_date)

          if (date >= flightStart && date <= flightEnd) {
            events.push({
              id: `flight-${flight.flight_id}`,
              title: flight.name,
              time: '12:00',
              type: 'flight',
              status: flight.status || 'active',
              description: `Канал: ${flight.channel}`,
              date: dateStr,
              planId: plan.plan_id,
              flightId: flight.flight_id
            })
          }
        })
      }
    }
  })

  return events
}

const getEventColor = (type) => {
  const colors = {
    start: 'success',
    end: 'error',
    flight: 'primary',
    review: 'warning'
  }
  return colors[type] || 'grey'
}

const getEventIcon = (type) => {
  const icons = {
    start: 'mdi-play',
    end: 'mdi-stop',
    flight: 'mdi-airplane',
    review: 'mdi-eye'
  }
  return icons[type] || 'mdi-calendar'
}

const getEventTypeLabel = (type) => {
  const labels = {
    start: 'Запуск плана',
    end: 'Завершение плана',
    flight: 'Размещение',
    review: 'Проверка'
  }
  return labels[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    draft: 'Черновик',
    active: 'Активный',
    paused: 'Приостановлен',
    completed: 'Завершен',
    cancelled: 'Отменен'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString))
}

const selectDay = (day) => {
  selectedDay.value = day
}

const viewEvent = (event) => {
  selectedEvent.value = event
  showEventDialog.value = true
}

const editEvent = () => {
  // Здесь должна быть логика редактирования события
  showEventDialog.value = false
}

const previousPeriod = () => {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  } else {
    currentDate.value = new Date(currentDate.value.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
}

const nextPeriod = () => {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  } else {
    currentDate.value = new Date(currentDate.value.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
}

const goToToday = () => {
  currentDate.value = new Date()
}

onMounted(() => {
  // Выбираем сегодняшний день при загрузке
  const today = calendarDays.value.find(day => day.isToday)
  if (today) {
    selectedDay.value = today
  }
})
</script>

<style scoped>
.calendar-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: rgb(var(--v-theme-surface-variant));
}

.calendar-day-header {
  padding: 12px 8px;
  text-align: center;
  font-weight: 500;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.calendar-day-header:last-child {
  border-right: none;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  padding: 8px;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  position: relative;
}

.calendar-day:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day--today {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.calendar-day--other-month {
  opacity: 0.4;
}

.calendar-day-number {
  font-weight: 500;
  margin-bottom: 4px;
}

.calendar-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.calendar-event {
  background-color: rgb(var(--v-theme-primary));
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.calendar-event--start {
  background-color: rgb(var(--v-theme-success));
}

.calendar-event--end {
  background-color: rgb(var(--v-theme-error));
}

.calendar-event--flight {
  background-color: rgb(var(--v-theme-primary));
}

.calendar-event--review {
  background-color: rgb(var(--v-theme-warning));
}

.calendar-event-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calendar-event-time {
  font-size: 0.7rem;
  opacity: 0.8;
}
</style>