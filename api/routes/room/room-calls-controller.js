const os = require('os')
const process = require('process')
const config = require('../../../config')
const performanceService = require('../../services/performance/performance-service')
const roomService = require('../../services/room/room-service')
const callService = require('../../services/call/call-service')
const geoipService = require('../../services/geoip/geoip-service')
const wsDispatcher = require('../ws/ws-dispatcher')
const processName = `${os.hostname()}_${process.pid}`

class RoomCallsController {
  async getAll (request, reply) {
    const rooms = await roomService.getAll(request.user.user._id, 0, 1000)
    const ids = rooms.map(r => r.calls).reduce((a, b) => a.concat(b), [])
    const result = await callService.getAll({
      ids,
      status: 'open'
    })
    reply.send(result)
  }

  async pushCallWs (fastify, wss, conn, req, payload) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      const geoip = await geoipService.get(ipAddress)
      payload.process_name = processName
      payload.ip_address = ipAddress
      payload.geoip = geoip

      performanceService.performance.mark('CallOpen start')
      const call = await callService.create(conn.user ? conn.user._id : null, payload)
      performanceService.performance.mark('CallOpen end')
      performanceService.performance.measure('CallOpen', 'CallOpen start', 'CallOpen end')

      performanceService.performance.mark('RoomCallPush start')
      const room = await roomService.pushCall(conn.user._id, call.room, call._id)
      performanceService.performance.mark('RoomCallPush end')
      performanceService.performance.measure('RoomCallPush', 'RoomCallPush start', 'RoomCallPush end')

      const result = {
        room,
        call
      }
      if (conn.user) {
        const op = config.wsSettings.opTypes.roomCallOpen
        wsDispatcher.dispatch(op, [result], true)
      }

      return result
    } catch (err) {
      fastify.log.error(err)
    }
  }

  async pull (request, reply) {
    const id = request.params.id
    const call = await callService.close(id)
    const room = await roomService.pullCall(request.user.user._id, call.room, call._id)
    const result = {
      room,
      call
    }
    const op = config.wsSettings.opTypes.roomCallClose
    wsDispatcher.dispatch(op, [result], true)
    reply.send(result)
  }

  async pullCallWs (fastify, wss, conn, req, payload) {
    const id = payload.id
    if (id) {
      try {
        performanceService.performance.mark('CallClose start')
        const call = await callService.close(id)
        performanceService.performance.mark('CallClose end')
        performanceService.performance.measure('CallClose', 'CallClose start', 'CallClose end')

        performanceService.performance.mark('RoomCallPull start')
        const room = await roomService.pullCall(conn.user._id, call.room, call._id)
        performanceService.performance.mark('RoomCallPull end')
        performanceService.performance.measure('RoomCallPull', 'RoomCallPull start', 'RoomCallPull end')

        const result = {
          room,
          call
        }
        const op = config.wsSettings.opTypes.roomCallClose
        wsDispatcher.dispatch(op, [result], true)

        return call
      } catch (err) {
        fastify.log.error(err)
      }
    }
  }
}

module.exports = new RoomCallsController()
