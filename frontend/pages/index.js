import { useState } from 'react'
import { useRouter } from 'next/router'
import { authService } from '../src/services/auth/authService'

export default function HomeScreen() {
  const router = useRouter()
  const [values, setValues] = useState({
    usuario: 'omariosouto',
    senha: 'safepassword'
  });

  const handleChange = (event) => {
    const fieldName = event.target.name
    const fieldValue = event.target.value

    setValues((currentValues) => {
      return {
        ...currentValues,
        [fieldName]: fieldValue
      }
    })
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={(event) => {
        event.preventDefault()
        authService.login({
          username: values.usuario,
          password: values.senha
        }).then(() => {
          // router.push('/auth-page-static')
          router.push('/auth-page-ssr')
        }).catch(() => {
          alert('Usuário ou senha inválidos')
        })
      }}>
        <input
          placeholder="Usuário" name="usuario"
          defaultValue={values.usuario}
          onChange={handleChange}
        />
        <input
          placeholder="Senha" name="senha" type="password"
          defaultValue={values.senha}
          onChange={handleChange}
        />
        <pre>
          {JSON.stringify(values, null, 2)}
        </pre>
        <div>
          <button>
            Entrar
          </button>
        </div>
        <p>
          <a href="/auth-page-ssr">SSR</a>
          <a href="/auth-page-static">Static</a>
        </p>
      </form>
    </div>
  );
}
