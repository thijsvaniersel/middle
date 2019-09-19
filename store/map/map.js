// initial state
const state = {
    addressOne: {},
    addressTwo: {},
    midPoint: {
        "latitude": 0,
        "longitude": 0
    },
    markers: {
    addressOne: {},
    addressTwo: {},
    suggestions: []
    },
}

// getters
const getters = {}

// actions
const actions = {
  changeAddress(context, payload){
      context.commit('setAddress', payload)
  },
  changeMidPoint(context, payload){
      context.commit('setMidPoint', payload)
  },
  changeSuggestions(context, suggestions){
      context.commit('setSuggestions', suggestions)
  }
}

// mutations
const mutations = {
  setAddress(state, payload){

    // als er geen echt adres in zit, voeg niet toe
    if(payload.address.address_components === undefined){
      return
    }

    // change address in state
    let addressType = payload.type
    state[addressType] = payload.address

    // set marker for this address
    state.markers[addressType] = {
        name: state[addressType].address_components[0].long_name,
        description: state[addressType].formatted_address,
        position: {
            lat: state[addressType].geometry.location.lat(),
            lng: state[addressType].geometry.location.lng()
        }
    }
  },

  setMidPoint(state, payload){

    // change midpoint
    state.midPoint.latitude = payload.lat
    state.midPoint.longitude = payload.lng
  },

  setSuggestions(state, suggestions){

    // set suggestions
    state.markers.suggestions = suggestions
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
