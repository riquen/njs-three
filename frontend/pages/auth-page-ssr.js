import { withSession } from "../src/services/auth/session"

export default function AuthPageSSR(props) {
  return (
    <div>
      <h1>Auth Page SSR</h1>
      <pre>
        {JSON.stringify(props, null, 2)}
      </pre>
    </div>
  )
}

export const getServerSideProps = withSession((context) => {
  return {
    props: {
      session: context.req.session
    }
  }
})
