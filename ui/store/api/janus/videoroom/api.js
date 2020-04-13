export const actions = {
  create ({
    commit
  }, { handleDto, payload }) {
    payload.request = 'create'
    return new Promise((resolve, reject) => {
      handleDto.handle.send({
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
  }, { handleDto, payload }) {
    payload.request = 'edit'
    return new Promise((resolve, reject) => {
      handleDto.handle.send({
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
  }, { handleDto, payload }) {
    payload.request = 'destroy'
    return new Promise((resolve, reject) => {
      handleDto.handle.send({
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
  }, { handleDto, roomid }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'exists',
        room: parseInt(roomid)
      }
      handleDto.handle.send({
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
  }, { handleDto }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'list'
      }
      handleDto.handle.send({
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
  }, { handleDto }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'join',
        room: handleDto.roomid,
        // id: handleDto.id,
        ptype: 'publisher',
        display: handleDto.display,
        token: handleDto.token
      }
      handleDto.handle.send({
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
  }, { handleDto }) {
    const Janus = this.$Janus
    return new Promise((resolve, reject) => {
      const request = {
        request: 'join',
        room: handleDto.roomid,
        ptype: 'subscriber',
        display: handleDto.display,
        feed: handleDto.id
      }
      if (Janus.webRTCAdapter.browserDetails.browser === 'safari' &&
      (handleDto.video.codec === 'vp9' || (handleDto.video.codec === 'vp8' && !Janus.safariVp8))) {
        request.offer_video = false
      }
      handleDto.handle.send({
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
  }, { handleDto, jsep }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'start',
        room: handleDto.roomid
      }
      handleDto.handle.send({
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
  }, { handleDto }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'listparticipants',
        room: handleDto.roomid
      }
      handleDto.handle.send({
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
  }, { handleDto, jsep, replace = undefined }) {
    return new Promise((resolve, reject) => {
      const audio = handleDto.audio && handleDto.audio.enabled
      const screen = handleDto.screen && handleDto.screen.enabled
      const video = handleDto.video && handleDto.video.enabled
      const data = handleDto.data && handleDto.data.enabled
      const request = {
        request: 'configure',
        audio,
        video: video || screen,
        data,
        bitrate: handleDto.bitrate.limit,
        // keyframe: handleDto.keyframe,
        // record: handleDto.record,
        // filename: handleDto.filename,
        display: handleDto.display
      }
      handleDto.handle.send({
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
  }, { handleDto, jsep }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'publish',
        audio: handleDto.audio,
        video: handleDto.video,
        data: handleDto.data,
        audiocodec: handleDto.audiocodec,
        videocodec: handleDto.videocodec,
        bitrate: handleDto.bitrate,
        record: handleDto.record,
        filename: handleDto.filename,
        display: handleDto.display
      }
      handleDto.handle.send({
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
  }, { handleDto }) {
    return new Promise((resolve, reject) => {
      const request = {
        request: 'unpublish'
      }
      handleDto.handle.send({
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
