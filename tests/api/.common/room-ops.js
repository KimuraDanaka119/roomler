class RoomOps {
  create(fastify, test, testname, context) {
    test.serial(`API "/api/room/create" ${testname}`, async(t) => {
      await fastify
        .inject({
          method: 'POST',
          url: `/api/room/create`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${context.token}`
          },
          payload: context.payload
        })
        .then((response) => {
          t.is(response.statusCode, 200)
          t.is(response.headers['content-type'], 'application/json; charset=utf-8')
          const result = JSON.parse(response.payload)
          t.true(result._id !== undefined)
          t.true(result.name === context.payload.name)
          if (context.payload.tags) {
            context.payload.tags.forEach(tag => {
              const foundTag = result.tags.find(item => item === tag)
              t.true(foundTag !== null && foundTag !== undefined)
            })
          }
          t.true(result.createdAt !== undefined)
          t.true(result.updatedAt !== undefined)
          context.record = result
          t.pass()
        })
        .catch((e) => {
          t.fail(e)
        })
    })
  }

  delete(fastify, test, testname, context) {
    test.serial(`API "/api/room/delete/:id" ${testname}`, async(t) => {
      await fastify
        .inject({
          method: 'DELETE',
          url: `/api/room/delete/${context.record._id}`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${context.token}`
          }
        })
        .then((response) => {
          t.is(response.statusCode, 200)
          t.is(response.headers['content-type'], 'application/json; charset=utf-8')
          const result = JSON.parse(response.payload)
          t.true(result.ok === 1)
          t.true(result.n > 0)
          t.true(result.deletedCount > 0)
          t.pass()
        })
        .catch((e) => {
          t.fail(e)
        })
    })
  }

  push(fastify, test, testname, arrayType, roomContext, userContexts) {
    test.serial(`API "/api/room/${arrayType}s/push/:id" ${testname}`, async(t) => {
      const payload = {}
      if (Array.isArray(userContexts)) {
        payload.users = userContexts.map(uc => uc.record._id)
      } else {
        payload.user = userContexts && userContexts.record && userContexts.record._id ? userContexts.record._id : null
      }
      await fastify
        .inject({
          method: 'PUT',
          url: `/api/room/${arrayType}s/push/${roomContext.record._id}`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${roomContext.token}`
          },
          payload
        })
        .then((response) => {
          t.is(response.statusCode, 200)
          t.is(response.headers['content-type'], 'application/json; charset=utf-8')
          const result = JSON.parse(response.payload)
          t.true(result._id !== undefined)
          t.true(result.name === roomContext.payload.name)
          t.true(result.createdAt !== undefined)
          t.true(result.updatedAt !== undefined)
          const array = result[`${arrayType}s`]
          t.true(Array.isArray(array))
          const users = Array.isArray(userContexts) ? userContexts : (userContexts ? [userContexts] : [])
          users.forEach(user => {
            const arrayItem = array.find(item => item._id.toString() === user.record._id.toString())
            t.true(arrayItem._id !== undefined)
            t.true(arrayItem.username === user.record.username)
            t.true(arrayItem.email === user.record.email)
            t.true(arrayItem.password === undefined)
          })
          t.pass()
        })
        .catch((e) => {
          t.fail(e)
        })
    })
  }

  pull(fastify, test, testname, arrayType, roomContext, userContexts) {
    test.serial(`API "/api/room/${arrayType}s/pull/:id" ${testname}`, async(t) => {
      const payload = {}
      if (Array.isArray(userContexts)) {
        payload.users = userContexts.map(uc => uc.record._id)
      } else {
        payload.user = userContexts && userContexts.record && userContexts.record._id ? userContexts.record._id : null
      }
      await fastify
        .inject({
          method: 'PUT',
          url: `/api/room/${arrayType}s/pull/${roomContext.record._id}`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${roomContext.token}`
          },
          payload
        })
        .then((response) => {
          t.is(response.statusCode, 200)
          t.is(response.headers['content-type'], 'application/json; charset=utf-8')
          const result = JSON.parse(response.payload)
          t.true(result._id !== undefined)
          t.true(result.name === roomContext.payload.name)
          t.true(result.createdAt !== undefined)
          t.true(result.updatedAt !== undefined)
          const array = result[`${arrayType}s`]
          t.true(Array.isArray(array))

          const users = Array.isArray(userContexts) ? userContexts : (userContexts ? [userContexts] : [])
          users.forEach(user => {
            const arrayItem = array.find(item => item._id.toString() === user.record._id.toString())
            t.true(!arrayItem)
          })
          t.pass()
        })
        .catch((e) => {
          t.fail(e)
        })
    })
  }

  update(fastify, test, testname, arrayType, roomContext, userContexts) {
    test.serial(`API "/api/room/${arrayType}s/update/:id" ${testname}`, async(t) => {
      const payload = {}
      if (Array.isArray(userContexts)) {
        payload.users = userContexts.map(uc => uc.record._id)
      } else {
        payload.user = userContexts && userContexts.record && userContexts.record._id ? userContexts.record._id : null
      }
      await fastify
        .inject({
          method: 'PUT',
          url: `/api/room/${arrayType}s/update/${roomContext.record._id}`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${roomContext.token}`
          },
          payload
        })
        .then((response) => {
          t.is(response.statusCode, 200)
          t.is(response.headers['content-type'], 'application/json; charset=utf-8')
          const result = JSON.parse(response.payload)
          t.true(result._id !== undefined)
          t.true(result.name === roomContext.payload.name)
          t.true(result.createdAt !== undefined)
          t.true(result.updatedAt !== undefined)
          const array = result[`${arrayType}s`]
          t.true(Array.isArray(array))
          const users = Array.isArray(userContexts) ? userContexts : (userContexts ? [userContexts] : [])
          t.true(array.length === users.length)
          users.forEach(user => {
            const arrayItem = array.find(item => item._id.toString() === user.record._id.toString())
            t.true(arrayItem._id !== undefined)
            t.true(arrayItem.username === user.record.username)
            t.true(arrayItem.email === user.record.email)
            t.true(arrayItem.password === undefined)
          })
          t.pass()
        })
        .catch((e) => {
          t.fail(e)
        })
    })
  }
}

module.exports = new RoomOps()
