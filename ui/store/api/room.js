import {
  handleError,
  handleSuccess
} from '@/services/ajax-handlers'

import { treeOps } from '../../services/tree-ops'
import Tree from '../../services/tree'

export const state = () => ({
  room: null,
  rooms: [],
  tree: new Tree([])
})

export const mutations = {
  setRoom (state, room) {
    state.room = room
  },
  setRooms (state, rooms) {
    rooms.forEach((room) => { room.children = [] })
    state.rooms = rooms
    const open = state.tree.open
    state.tree = new Tree(state.rooms)
    state.tree.open = open
  },
  push (state, room) {
    room.children = []
    if (state.room && state.room._id === room._id) {
      state.room = room
    }
    const found = state.rooms.find(r => r._id === room._id)
    if (!found) {
      state.rooms = [room, ...state.rooms].sort((a, b) => a.path.localeCompare(b.path))
    } else {
      state.rooms = state.rooms
        .map(r => r._id === room._id ? room : r)
        .sort((a, b) => a.path.localeCompare(b.path))
    }
    const open = state.tree.open
    state.tree = new Tree(state.rooms)
    state.tree.open = open
  },
  pull (state, roomid) {
    if (state.room && state.room._id === roomid) {
      state.room = null
    }
    state.rooms = state.rooms.filter(r => r._id !== roomid)
    const open = state.tree.open
    state.tree = new Tree(state.rooms)
    state.tree.open = open
  },
  setOpen (state, list) {
    state.tree.open = list
  },
  open (state, room) {
    state.tree.open.push(room.path)
    const parent = treeOps.findParent(state.tree.items, room)
    if (parent) {
      state.tree.open.push(parent.path)
    }
  },
  pushUser (state, invite) {
    const room = state.rooms.find(r => r._id === invite.room._id)
    if (room) {
      room[`${invite.type}s`].push(invite.invitee._id)
    }
  }
}

export const actions = {
  subscribe ({
    commit,
    state,
    rootState
  }, router) {
    this.$wss.subscribe('onmessage', (message) => {
      const data = JSON.parse(message.data)
      if (
        data.op === rootState.api.config.config.wsSettings.opTypes.roomPeerRoleUpdate ||
        data.op === rootState.api.config.config.wsSettings.opTypes.roomPeerAdd ||
        data.op === rootState.api.config.config.wsSettings.opTypes.roomPeerJoin) {
        data.data.forEach((record) => {
          record.users.forEach((user) => {
            commit('api/auth/push', user, {
              root: true
            })
          })
          commit('api/room/push', record.room, {
            root: true
          })
          commit('api/message/initMessages', record.room.path, {
            root: true
          })
        })
      } else if (
        data.op === rootState.api.config.config.wsSettings.opTypes.roomPeerRemove ||
        data.op === rootState.api.config.config.wsSettings.opTypes.roomPeerLeave) {
        data.data.forEach(async (record) => {
          record.users.forEach((user) => {
            commit('api/auth/push', user, {
              root: true
            })
          })

          const userid = rootState.api.auth.user._id
          const isUserRemoved = record.room.owner !== userid && !record.room.members.includes(userid) && !record.room.moderators.includes(userid)
          if (isUserRemoved) {
            handleSuccess(`You have been removed from the room '${record.room.path}'`, commit)
            if (rootState.api.room.room && rootState.api.room.room._id === record.room._id) {
              await router.push({ path: '/' })
            }
            if (!record.room.is_open) {
              commit('api/room/pull', record.room._id, {
                root: true
              })
            } else {
              commit('api/room/push', record.room, {
                root: true
              })
            }
          } else {
            commit('api/room/push', record.room, {
              root: true
            })
          }
        })
      }
    })
  },
  async create ({
    commit,
    state
  }, payload) {
    const response = {}
    try {
      response.result = await this.$axios.$post('/api/room/create', payload)
      commit('push', response.result)
      commit('open', response.result)
      commit('api/message/initMessages', response.result.path, {
        root: true
      })
    } catch (err) {
      handleError(err, commit)
      response.hasError = true
    }
    return response
  },
  async get ({
    commit,
    state
  }, id) {
    const response = {}
    try {
      response.result = await this.$axios.$get(`/api/room/get?id=${id}`)
    } catch (err) {
      handleError(err, commit)
      response.hasError = true
    }
    return response
  },

  async getAll ({
    commit,
    state
  }) {
    const response = {}
    try {
      response.result = await this.$axios.$get('/api/room/get-all')
      commit('setRooms', response.result)
      // eslint-disable-next-line no-debugger
      debugger
      commit('setOpen', response.result.map(room => room._id))
      response.result.forEach((room) => {
        commit('api/message/initMessages', room.path, {
          root: true
        })
      })
    } catch (err) {
      // handleError(err, commit)
      response.hasError = true
    }
    return response
  },

  async update ({
    commit,
    state
  }, payload) {
    const response = {}
    try {
      response.result = await this.$axios.$put(`/api/room/update/${payload.id}`, payload.update)
      commit('push', response.result)
      commit('api/message/initMessages', response.result.path, {
        root: true
      })
    } catch (err) {
      handleError(err, commit)
      response.hasError = true
    }
    return response
  },

  async delete ({
    commit,
    state
  }, id) {
    const response = {}
    try {
      response.result = await this.$axios.$delete(`/api/room/delete/${id}`)
      commit('pull', id)
    } catch (err) {
      handleError(err, commit)
      response.hasError = true
    }
    return response
  }
}

export const getters = {
  roomPaths: (state) => {
    return state.rooms.map(r => r.path)
  },
  selectedRoom: state => (roomname) => {
    const nullo = { tags: [] }
    return roomname ? (state.rooms.find(r => r.name.toLowerCase() === roomname.toLowerCase()) || nullo) : nullo
  },
  getUserRole: state => (roomid, userid) => {
    const room = state.rooms.find(r => r._id === roomid)
    if (room) {
      if (room.owner === userid) {
        return 'owner'
      } else if (room.moderators.includes(userid)) {
        return 'moderator'
      } else if (room.members.includes(userid)) {
        return 'member'
      }
    }
    return null
  },
  isRoomPeer: (state, getters, rootState) => (room, userid = null) => {
    const user = userid || (rootState.api.auth.user ? rootState.api.auth.user._id : null)
    return room ? [room.owner, ...room.members, ...room.moderators].includes(user) : false
  }
}
