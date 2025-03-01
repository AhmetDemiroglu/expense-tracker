import { createStore } from 'vuex'
import expenses from './modules/expenses'
import income from './modules/income'
import bills from './modules/bills'
import debts from './modules/debts'
import savings from './modules/savings'
import auth from './modules/auth'
import settings from './modules/settings'

export default createStore({
  state: {
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth()
  },
  mutations: {
    SET_SELECTED_YEAR(state, year) {
      state.selectedYear = year
    },
    SET_SELECTED_MONTH(state, month) {
      state.selectedMonth = month
    }
  },
  modules: {
    expenses,
    income,
    bills,
    debts,
    savings,
    auth,
    settings
  }
})