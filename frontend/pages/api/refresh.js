import nookies from 'nookies'
import { HttpClient } from '../../src/infra/HttpClient/HttpClient'
import { tokenService } from '../../src/services/auth/tokenService'

const REFRESH_TOKEN_NAME = 'REFRESH_TOKEN_NAME'

const controllers = {
  async storeRefreshToken(req, res) {
    const context = { req, res }

    nookies.set(context, REFRESH_TOKEN_NAME, req.body.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    })

    res.json({
      data: {
        message: 'Stored successfully'
      }
    })
  },
  async displayCookies(req, res) {
    const context = { req, res }
    
    res.json({
      data: {
        cookies: nookies.get(context)
      }
    })
  },
  async regenerateTokens(req, res) {
    const context = { req, res }
    const cookies = nookies.get(context)
    const refreshToken = cookies[REFRESH_TOKEN_NAME] || req.body.refresh_token

    const refreshResponse = await HttpClient(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/refresh`, {
      method: 'POST',
      body: {
        refresh_token: refreshToken
      }
    })

    if (refreshResponse.ok) {      
      nookies.set(context, REFRESH_TOKEN_NAME, refreshResponse.body.data.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      })

      tokenService.save(refreshResponse.body.data.access_token, context)

      res.status(200).json({
        data: refreshResponse.body.data
      })
    } else {
      res.status(401).json({
        status: 401,
        message: 'Unauthorized'
      })
    }
  }
}

const controllerBy = {
  POST: controllers.storeRefreshToken,
  // GET: controllers.displayCookies
  GET: controllers.regenerateTokens,
  PUT: controllers.regenerateTokens,
  DELETE: (req, res) => {
    nookies.destroy({ req, res }, REFRESH_TOKEN_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    })

    res.status(200).json({
      data: {
        message: 'Deleted successfully'
      }
    })
  }
}

export default function handler(req, res) {
  if (controllerBy[req.method]) return controllerBy[req.method](req, res)

  res.status(404).json({
    status: 404,
    message: 'Not Found'
  })
}
