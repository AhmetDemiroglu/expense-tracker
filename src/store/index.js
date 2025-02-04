import { createStore } from 'vuex'
import expenses from './modules/expenses'
import income from './modules/income'
import debts from './modules/debts'
import bills from './modules/bills'
import savings from './modules/savings'

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
    debts,
    bills,
    savings,
  }
}) 