<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <div class="year-selector">
        <button @click="changeYear(-1)" class="nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="year">{{ currentYear }}</span>
        <button @click="changeYear(1)" class="nav-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div class="months-grid">
      <div 
        v-for="(month, index) in months" 
        :key="month"
        class="month-card"
        :class="{ 'current-month': isCurrentMonth(index) }"
        @click="selectMonth(index)"
      >
        <h3>{{ month }}</h3>
        <div class="mini-calendar">
          <div class="weekdays">
            <span v-for="day in weekDays" :key="day">{{ day }}</span>
          </div>
          <div class="days">
            <span 
              v-for="day in getDaysInMonth(index)"
              :key="day"
              :class="{ 
                'current-day': isCurrentDay(index, day),
                'different-month': day === ''
              }"
            >
              {{ day }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ay Detay Modalı -->
    <div v-if="selectedMonthDetails" class="month-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ months[selectedMonthDetails.month] }} {{ currentYear }}</h2>
          <button @click="closeMonthDetails" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="detailed-calendar">
          <div class="weekdays">
            <span v-for="day in weekDays" :key="day">{{ day }}</span>
          </div>
          <div class="days detailed">
            <div 
              v-for="(day, index) in getDetailedMonthDays()"
              :key="index"
              class="day-cell"
              :class="{
                'current-day': isCurrentDay(selectedMonthDetails.month, day.number),
                'different-month': !day.currentMonth
              }"
            >
              <span class="day-number">{{ day.number }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CalendarView',
  setup() {
    const currentYear = ref(new Date().getFullYear())
    const selectedMonthDetails = ref(null)
    
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]
    
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

    const today = new Date()

    const changeYear = (delta) => {
      currentYear.value += delta
    }

    const isCurrentMonth = (monthIndex) => {
      return monthIndex === today.getMonth() && currentYear.value === today.getFullYear()
    }

    const isCurrentDay = (monthIndex, day) => {
      return isCurrentMonth(monthIndex) && day === today.getDate()
    }

    const getDaysInMonth = (monthIndex) => {
      const date = new Date(currentYear.value, monthIndex + 1, 0)
      return Array.from({ length: date.getDate() }, (_, i) => i + 1)
    }

    const selectMonth = (monthIndex) => {
      selectedMonthDetails.value = {
        month: monthIndex,
        year: currentYear.value
      }
    }

    const closeMonthDetails = () => {
      selectedMonthDetails.value = null
    }

    const getDetailedMonthDays = () => {
      if (!selectedMonthDetails.value) return []

      const month = selectedMonthDetails.value.month
      const year = currentYear.value
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // Önceki ayın son günlerini ekle
      const prevMonthDays = []
      const firstDayOfWeek = firstDay.getDay() || 7
      if (firstDayOfWeek > 1) {
        const prevMonth = new Date(year, month, 0)
        const daysToAdd = firstDayOfWeek - 1
        for (let i = daysToAdd - 1; i >= 0; i--) {
          prevMonthDays.push({
            number: prevMonth.getDate() - i,
            currentMonth: false
          })
        }
      }

      // Bu ayın günlerini ekle
      const currentMonthDays = Array.from(
        { length: lastDay.getDate() },
        (_, i) => ({
          number: i + 1,
          currentMonth: true
        })
      )

      // Sonraki ayın ilk günlerini ekle
      const nextMonthDays = []
      const lastDayOfWeek = lastDay.getDay() || 7
      if (lastDayOfWeek < 7) {
        const daysToAdd = 7 - lastDayOfWeek
        for (let i = 1; i <= daysToAdd; i++) {
          nextMonthDays.push({
            number: i,
            currentMonth: false
          })
        }
      }

      return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
    }

    return {
      currentYear,
      months,
      weekDays,
      selectedMonthDetails,
      changeYear,
      isCurrentMonth,
      isCurrentDay,
      getDaysInMonth,
      selectMonth,
      closeMonthDetails,
      getDetailedMonthDays
    }
  }
}
</script>

<style scoped>
.calendar-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.calendar-header {
  margin-bottom: 2rem;
  text-align: center;
}

.year-selector {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 59, 92, 0.1);
}

.year {
  font-size: 1.5rem;
  font-weight: 600;
  color: #003B5C;
  min-width: 100px;
}

.nav-btn {
  background: none;
  border: none;
  color: #009B9F;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.nav-btn:hover {
  color: #00B2A9;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.month-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 59, 92, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.month-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 59, 92, 0.15);
}

.month-card h3 {
  color: #003B5C;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.current-month {
  border: 2px solid #009B9F;
}

.mini-calendar {
  font-size: 0.8rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: #666;
  margin-bottom: 0.5rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}

.days span {
  padding: 4px;
  border-radius: 4px;
}

.current-day {
  background-color: #009B9F;
  color: white;
}

.different-month {
  color: #ccc;
}

/* Modal Styles */
.month-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  color: #003B5C;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
}

.detailed-calendar .days {
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f8f9fa;
}

.day-number {
  font-size: 1.1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .calendar-view {
    padding: 1rem;
  }

  .months-grid {
    gap: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }
}
</style> 