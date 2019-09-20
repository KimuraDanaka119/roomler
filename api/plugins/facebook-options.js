const defaultState = require('crypto').randomBytes(10).toString('hex')
const oauthPlugin = require('fastify-oauth2')
const config = require('../../config')
module.exports = {
  name: 'facebookOAuth2',
  credentials: {
    client: {
      id: process.env.FACEBOOK_ID || null,
      secret: process.env.FACEBOOK_SECRET || null
    },
    auth: oauthPlugin.FACEBOOK_CONFIGURATION
  },
  startRedirectPath: '/oauth/login/facebook',
  callbackUri: `${config.appSettings.env.URL}/oauth/callback/facebook`,
  scope: ['email'],
  generateStateFunction: () => {
    return defaultState
  },
  checkStateFunction: (state, callback) => {
    if (process.env.NODE_ENV === 'development') {
      callback()
    } else {
      if (state === defaultState) {
        callback()
        return
      }
      callback(new Error('Invalid state'))
    }
  }
}
