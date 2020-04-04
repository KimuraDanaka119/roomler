export const actions = {
  create ({
    commit
  }, { handleDTO, payload }) {
    payload.request = 'create'
    return new Promise((resolve, reject) => {
      handleDTO.handle.send({
        message: payload,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve(data)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  edit ({
    commit
  }, { handleDTO, payload }) {
    payload.request = 'edit'
    return new Promise((resolve, reject) => {
      handleDTO.handle.send({
        message: payload,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve(data)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  destroy ({
    commit
  }, { handleDTO, payload }) {
    payload.request = 'destroy'
    return new Promise((resolve, reject) => {
      handleDTO.handle.send({
        message: payload,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve(data)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  exists ({
    commit
  }, { handleDTO, roomid }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'exists',
        room: parseInt(roomid)
      }
      handleDTO.handle.send({
        message: request,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve(data)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  list ({
    commit
  }, { handleDTO }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'list'
      }
      handleDTO.handle.send({
        message: request,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve(data.rooms)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  joinPublisher ({
    commit
  }, { handleDTO }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'join',
        room: handleDTO.roomid,
        // id: handleDTO.id,
        ptype: 'publisher',
        display: handleDTO.display,
        token: handleDTO.token
      }
      console.log(`REQUEST: ${JSON.stringify(request)}`)
      handleDTO.handle.send({
        message: request,
        success: () => {
          resolve()
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  joinSubscriber ({
    commit
  }, { handleDTO }) {
    const Janus = this.$Janus
    return new Promise((resolve, reject) => {
      const request = {
        request: 'join',
        room: handleDTO.roomid,
        ptype: 'subscriber',
        display: handleDTO.display,
        feed: handleDTO.id
      }
      if (Janus.webRTCAdapter.browserDetails.browser === 'safari' &&
      (handleDTO.videoCodec === 'vp9' || (handleDTO.videoCodec === 'vp8' && !Janus.safariVp8))) {
        request.offer_video = false
      }
      handleDTO.handle.send({
        message: request,
        success: () => {
          resolve()
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  start ({
    commit
  }, { handleDTO, jsep }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'start',
        room: handleDTO.roomid
      }
      handleDTO.handle.send({
        jsep,
        message: request,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve()
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  listparticipants ({
    commit
  }, { handleDTO }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'listparticipants',
        room: handleDTO.roomid
      }
      handleDTO.handle.send({
        message: request,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve(data)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  configure ({
    commit
  }, { handleDTO, jsep, replace = undefined }) {
    return new Promise((resolve, reject) => {
      const audio = handleDTO.audio
      const screen = handleDTO.screen
      const video = handleDTO.video
      const data = handleDTO.data
      const request = {
        request: 'configure',
        audio,
        video: video || screen,
        data,
        // bitrate: handleDTO.bitrate,
        // keyframe: handleDTO.keyframe,
        // record: handleDTO.record,
        // filename: handleDTO.filename,
        display: handleDTO.display
      }
      handleDTO.handle.send({
        message: request,
        jsep,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve()
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  publish ({
    commit
  }, { handleDTO, jsep }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'publish',
        audio: handleDTO.audio,
        video: handleDTO.video,
        data: handleDTO.data,
        audiocodec: handleDTO.audiocodec,
        videocodec: handleDTO.videocodec,
        bitrate: handleDTO.bitrate,
        record: handleDTO.record,
        filename: handleDTO.filename,
        display: handleDTO.display
      }
      handleDTO.handle.send({
        message: request,
        jsep,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve()
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  },

  unpublish ({
    commit
  }, { handleDTO }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'unpublish'
      }
      handleDTO.handle.send({
        message: request,
        success: (data) => {
          if (data && data.error) {
            reject(data.error)
          } else {
            resolve()
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  }
}
