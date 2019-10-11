const getService = require('../../services/utils/get-service')
class OAuthDataGetter {
  async getFacebookData (access) {
    const result = {
      email: null,
      id: null,
      name: null,
      avatar_url: null
    }
    const data = await getService.get({
      url: 'https://graph.facebook.com/v4.0/me?fields=email,name,picture.type(large)',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access.access_token}`
      },
      json: true
    })
    result.id = data.id
    result.name = data.name
    result.email = data.email
    result.avatar_url = data.picture && data.picture.data ? data.picture.data.url : undefined
    return result
  }

  async getGithubData (access) {
    const result = {
      email: null,
      id: null,
      name: null,
      avatar_url: null
    }
    const data = await getService.get({
      url: 'https://api.github.com/user',
      method: 'GET',
      headers: {
        Authorization: `token ${access.access_token}`,
        'User-Agent': 'Roomler APP'
      },
      json: true
    })

    result.id = data.id
    result.email = data.email
    result.name = data.login
    result.avatar_url = data.avatar_url
    if (!result.email) {
      const emails = await getService.get({
        url: 'https://api.github.com/user/emails',
        method: 'GET',
        headers: {
          Authorization: `token ${access.access_token}`,
          'User-Agent': 'Roomler APP'
        },
        json: true
      })
      const email = emails.find((e) => {
        return e.primary === true
      })
      result.email = email.email
    }
    return result
  }

  async getLinkedinData (access) {
    const result = {
      email: null,
      id: null,
      name: null,
      avatar_url: null
    }
    const data = await getService.get({
      url: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access.access_token}`
      },
      json: true
    })
    console.log(data)
    result.id = data.id
    result.name = data.name
    result.email = data.email
    result.avatar_url = data.picture && data.picture.data ? data.picture.data.url : undefined
    return result
  }
}

module.exports = new OAuthDataGetter()
