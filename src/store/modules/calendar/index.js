export default {
  namespaced: true,
  state: {
    selectedDate: new Date(),
    view: 'month' // month, week, day
  },
  mutations: {
    SET_SELECTED_DATE(state, date) {
      state.selectedDate = date
    },
    SET_VIEW(state, view) {
      state.view = view
    }
  }
} 