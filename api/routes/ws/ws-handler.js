const os = require('os')
const process = require('process')
const uuid = require('uuid')
const config = require('../../../config')
const wsDispatcher = require('./ws-dispatcher')
const storage = require('./ws-storage')
const processName = `${os.hostname()}_${process.pid}`

class WsHandler {
  /*
    On Connection:
    1. Push the WS connection in the WS Storage
    2. Create UserConnection DB entry & push it in user.user_connections collection
    3. Notify all Peers based on Rooms
  */
  async onConnection (wss, conn, req) {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    conn.id = uuid()
    if (req.user) {
      conn.user = req.user
      console.log(`WS client '${conn.user.username}' connected on '${processName}'`)
    } else {
      console.log(`WS client 'ANONYMOUS' connected on '${processName}'`)
    }
    storage.push(conn)
    const payload = {
      conn_id: conn.id,
      process_name: processName,
      ip_address: ipAddress
    }
    const userConnection = await require('../metric/metric-controller').pushUserConnectionWs(wss, conn, payload)
    conn.user_connection_id = userConnection._id

    // notify USER CONNECTION OPENED
    if (conn.user) {
      const op = config.wsSettings.opTypes.userConnectionOpened
      wsDispatcher.dispatch(op, [userConnection])
    }
  }

  onMessage (wss, conn, msg) {
    console.log(`ON_MESSAGE: ${processName}`)
    console.log(`WS message for OP TYPE: ${msg.op}`)
    if (msg.op === config.wsSettings.opTypes.messageCreate) {
      return require('../message/message-controller').createWs(wss, conn, msg.payload)
    } else if (msg.op === config.wsSettings.opTypes.messageReactionPush) {
      return require('../message/message-reactions-controller').pushWs(wss, conn, msg.payload)
    } else if (msg.op === config.wsSettings.opTypes.messageReactionPull) {
      return require('../message/message-reactions-controller').pullWs(wss, conn, msg.payload)
    }
    return null
  }

  /*
    On Close:
    1. Pull out the WS conn from the WS Storage
    2. Close the UserConnection DB entry & pull it out of the user.user_connections collection
    3. Notify all Peers based on Rooms
  */
  async onClose (wss, conn) {
    if (conn.user) {
      console.log(`WS Client '${conn.user.username}' disconnected from '${processName}'`)
    } else {
      console.log(`WS Client 'ANONYMOUS' disconnected from '${processName}'`)
    }
    storage.pull(conn)
    if (conn.user_connection_id) {
      const userConnection = await require('../metric/metric-controller').pullUserConnectionWs(wss, conn)
      // notify USER CONNECTION CLOSED
      if (conn.user) {
        const op = config.wsSettings.opTypes.userConnectionClosed
        wsDispatcher.dispatch(op, [userConnection])
      }
    }
  }
}

module.exports = new WsHandler()
