import nookies from 'nookies'

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN_KEY'

const ONE_SECOND = 1
const ONE_MINUTE = ONE_SECOND * 60
const ONE_HOUR = ONE_MINUTE * 60
const ONE_DAY = ONE_HOUR * 24
const ONE_YEAR = ONE_DAY * 365

export const tokenService = {
  save(accessToken, context = null) {
    nookies.set(context, ACCESS_TOKEN_KEY, accessToken, {
      maxAge: ONE_YEAR,
      path: '/'
    })
  },
  get(context = null) {
    const cookies = nookies.get(context)
    return cookies[ACCESS_TOKEN_KEY] ?? ''
  },
  delete(context = null) {
    nookies.destroy(context, ACCESS_TOKEN_KEY)
  }
}
