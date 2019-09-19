import Vue from 'vue'
import Vuex from 'vuex'

// modules
import map from './map/map'
import user from './user/user'

export const strict = false

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

// initial state
const state = {}

// getters
const getters = {}

// actions
const actions = {}

// mutations
const mutations = {}

const createStore = () => {
  return new Vuex.Store({
    namespaced: true,
    modules: {
        map,
        user
    },
    state,
    getters,
    actions,
    mutations,
    // strict: debug
  })
}

export default createStore
