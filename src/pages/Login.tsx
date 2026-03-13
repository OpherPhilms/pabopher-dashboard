import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import '../App.css'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)
  const navigate                = useNavigate()
  const { user, loading }       = useAuth()

  // Already logged in — go straight to dashboard
  useEffect(() => {
    if (!loading && user) navigate('/app/dashboard', { replace: true })
  }, [user, loading, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/app/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      // Surface a clean message instead of the raw Firebase error
      if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        setError('Wrong email or password.')
      } else {
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="auth-loading">LOADING...</div>

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">PABOPHER</h1>
        <p className="login-sub">CREW ACCESS ONLY</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            EMAIL
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              spellCheck={false}
            />
          </label>

          <label>
            PASSWORD
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={busy} className="login-btn">
            {busy ? 'LOGGING IN...' : 'LOGIN >>'}
          </button>
        </form>
      </div>
    </div>
  )
}
