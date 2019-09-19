// initial state
const state = {
    show: 'addresses'
}

// getters
const getters = {}

// actions
const actions = {
    changeShow(context, payload){
        context.commit('setShow', payload)
    },    
}

// mutations
const mutations = {
    setShow(state, payload){
        state.show = payload
    }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
