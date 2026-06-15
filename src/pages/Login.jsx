import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  if (session) {
    navigate('/', { replace: true })
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/', { replace: true })
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex">
      <div className="hidden lg:flex w-1/2 bg-stone relative overflow-hidden border-r border-paper/5">
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div>
            <p className="eyebrow text-paper/40">WABA / Performance Signal</p>
          </div>
          <div>
            <h1 className="font-display text-6xl font-light text-paper leading-[0.95] tracking-tight">
              The week,<br/>
              <span className="italic font-normal text-gold">read aloud</span>.
            </h1>
            <p className="font-display font-light text-xl text-bone/70 mt-8 max-w-md leading-relaxed">
              A weekly account of what reached, what landed, and what to do next — across every channel WABA touches.
            </p>
          </div>
          <div className="font-mono text-[0.65rem] text-ash tracking-widest">
            INSTAGRAM &nbsp;·&nbsp; TIKTOK &nbsp;·&nbsp; YOUTUBE &nbsp;·&nbsp; FACEBOOK
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-2">{mode === 'signin' ? 'Sign in' : 'Create account'}</p>
          <h2 className="font-display text-3xl font-light text-paper mb-8">
            {mode === 'signin' ? 'Welcome back.' : 'Get access.'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="eyebrow block mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-paper/20 py-2 text-paper focus:border-ember outline-none transition-colors"
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-paper/20 py-2 text-paper focus:border-ember outline-none transition-colors"
              />
            </div>

            {error && <p className="text-ember text-sm font-mono">{error}</p>}
            {message && <p className="text-mint text-sm font-mono">{message}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-paper text-ink font-mono text-xs tracking-widest uppercase py-3 mt-4 hover:bg-gold transition-colors disabled:opacity-50"
            >
              {busy ? 'Working…' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null) }}
            className="mt-6 eyebrow text-ash hover:text-paper transition-colors"
          >
            {mode === 'signin' ? 'No account? Sign up →' : '← Have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
