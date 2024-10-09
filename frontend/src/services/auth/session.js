import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { authService } from "./authService"

export function withSession(handler) {
  return async (context) => {
    try {
      const session = await authService.getSession(context)
      const modifiedContext = {
        ...context,
        req: {
          ...context.req,
          session,
        }
      }

      return handler(modifiedContext)
    } catch (error) {
      return {
        redirect: {
          destination: '/?error=401-unauthorized',
          permanent: false
        }
      }
    }
  }
}

export function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    authService.getSession().then((response) => {
      setSession(response)
    }).catch((error) => {
      setError(error)
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  return {
    data: session,
    loading,
    error,
  }
}

export function withSessionHOC(Component) {
  return function Wrapper(props) {
    const router = useRouter()
    const { loading, error, data } = useSession()

    if (!loading && error) {
      router.push('/?error=401-unauthorized')
    }

    const modifiedProps = {
      ...props,
      session: data
    }

    return (
      <Component {...modifiedProps} />
    )
  }
}
