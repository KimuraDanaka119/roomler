const os = require('os')
const process = require('process')
const fp = require('fastify-plugin')
const WebSocket = require('ws')
const Redis = require('ioredis')
const processName = `${os.hostname()}_${process.pid}`

const verify = (fastify, opts) => (info, cb) => {
  const cookie = info.req.headers.cookie
  let callCallback = true
  if (cookie) {
    let token = cookie.split(';').find(function (item) {
      return item.includes('token=')
    })
    if (token) {
      token = token.trim().toString().replace('token=', '')
      if (token) {
        callCallback = false
        fastify.jwt.verify(token, opts.jwt, function (err, decoded) {
          if (!err) {
            info.req.user = decoded.user // [1]
          }
          // eslint-disable-next-line standard/no-callback-literal
          cb(true)
        })
      }
    }
  }
  if (callCallback) {
    // eslint-disable-next-line standard/no-callback-literal
    cb(true)
  }
}

function fastifyWs (fastify, opts, next) {
  if (opts.scaleout && opts.scaleout.enabled) {
    if (!fastify.scaleout) {
      fastify.decorate('scaleout', {})
      if (fastify.scaleout.publisher) {
        return next(new Error('Redis \'publisher\' instance namespace has already been registered'))
      }
      if (fastify.scaleout.subscriber) {
        return next(new Error('Redis \'subscriber\' instance namespace has already been registered'))
      }
      try {
        const publisher = new Redis(opts.scaleout.publisher)
        fastify.scaleout.publisher = publisher
        if (opts.dispatcher && opts.dispatcher.initPublisher) {
          opts.dispatcher.initPublisher(publisher)
        }
      } catch (err) {
        return next(err)
      }
      try {
        const subscriber = new Redis(opts.scaleout.subscriber)
        subscriber.subscribe('global')
          .then(() => {
            subscriber.on('message', (channel, payload) => {
              const data = JSON.parse(payload)
              if (channel === 'global' && opts.dispatcher && data.process !== processName) {
                console.log('SUBSCRIPTION MESSAGE')

                console.log(data.process)
                console.log(processName)
                opts.dispatcher.dispatch(data.op, data.messages, false)
              }
            })
          })

        fastify.scaleout.subscriber = subscriber
      } catch (err) {
        return next(err)
      }
    }
  }
  const wss = new WebSocket.Server({
    server: fastify.server,
    verifyClient: verify(fastify, opts)
  })
  wss
    .on('connection', (conn, req) => {
      if (opts.handler) {
        conn.send(JSON.stringify({
          op: 'HELLO',
          data: `${processName}`
        }))
        opts.handler.onConnection(wss, conn, req)

        // on WS message:
        // 1. handle message e.g. store to the DB
        // 2. dispatch to proper recepients
        // 3. scaleout to other WS servers
        conn.on('message', async (msg) => {
          console.log(`ON_MESSAGE__: ${processName}`)
          const message = JSON.parse(msg)
          let messages = await opts.handler.onMessage(wss, conn, message)
          if (messages) {
            if (!Array.isArray(messages)) {
              messages = [messages]
            }
            if (opts.dispatcher) {
              console.log('Dispatching relayed message')
              opts.dispatcher.dispatch(message.op, messages, true)
            }
          }
        })

        conn.on('close', () => {
          opts.handler.onClose(wss, conn)
        })
      }
    })

  fastify.decorate('ws', wss)

  fastify.addHook('onClose', (fastify, done) => {
    if (fastify.scaleout) {
      fastify.scaleout.publisher.quit()
      fastify.scaleout.subscriber.quit()
    }

    fastify.ws.close(done)
  })

  next()
}

module.exports = fp(fastifyWs, {
  fastify: '>=2.6.0',
  name: 'fastify-ws'
})
