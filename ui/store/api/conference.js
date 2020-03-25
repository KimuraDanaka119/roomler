
export const state = () => ({
  session: null,
  room: null,
  position: 'center'
})

export const mutations = {
  set (state, { session, room }) {
    state.session = session
    state.room = room
  },
  setPosition (state, position) {
    state.position = position
  }
}

export const actions = {
  async join ({
    commit,
    dispatch,
    state
  }, { janusPayload, room }) {
    const session = await dispatch('api/janus/videoroom/join', janusPayload, { root: true })
    commit('set', { session, room })
  },
  async leave ({
    commit,
    dispatch,
    state
  }) {
    const session = await dispatch('api/janus/session/destroy', { sessionDTO: state.session }, { root: true })
    commit('set', { session, room: null })
  }
}

export const getters = {
  localHandle: (state) => {
    return state.session && state.session.handleDTOs ? state.session.handleDTOs.find(h => h.isLocal) : null
  }
}
