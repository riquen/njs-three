import nookies from 'nookies'
import { tokenService } from "../../services/auth/tokenService"

export async function HttpClient(fetchUrl, fetchOptions = {}) {
  const defaultHeaders = fetchOptions.headers || {}
  const options = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...defaultHeaders
    },
    body: fetchOptions.body && JSON.stringify(fetchOptions.body),
  }

  return fetch(fetchUrl, options).then(async (response) => {
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: await response.json(),
    }
  }).then(async (response) => {
    if (!fetchOptions.refresh) return response
    if (response.status !== 401) return response

    const isServer = Boolean(fetchOptions?.context)
    const currentRefreshToken = fetchOptions?.context?.req?.cookies['REFRESH_TOKEN_NAME']

    try {
      const refreshResponse = await HttpClient('http://localhost:3000/api/refresh', {
        method: isServer ? 'PUT' : 'GET',
        body: isServer && { refresh_token: currentRefreshToken }
      })
      const newAccessToken = refreshResponse.body.data.access_token
      const newRefreshToken = refreshResponse.body.data.refresh_token
      
      if (isServer) {
        nookies.set(fetchOptions.context, 'REFRESH_TOKEN_NAME', newRefreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/'
        })
      }
      
      tokenService.save(newAccessToken)
      
      const retryResponse = await HttpClient(fetchUrl, {
        ...options,
        headers: {
          'Authorization': `Bearer ${newAccessToken}`,
        },
        refresh: false,
      })

      return retryResponse
    } catch (error) {
      return response
    }
  })
}
