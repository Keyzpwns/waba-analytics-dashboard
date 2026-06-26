import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export default function SetPassword() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-ink"><p className="eyebrow">Loading</p></div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-2">Secure link required</p>
          <h1 className="font-display text-3xl font-light text-paper mb-5">Request a new link.</h1>
          <p className="font-display text-lg font-light text-bone/70 leading-relaxed mb-6">
            This password link has expired or is invalid. Request another one from the sign-in page.
          </p>
          <Link to="/login" className="font-mono text-xs text-gold hover:text-paper transition-colors">Back to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2">Set password</p>
        <h1 className="font-display text-3xl font-light text-paper mb-3">Choose your password.</h1>
        <p className="font-display text-lg font-light text-bone/70 leading-relaxed mb-8">
          Use at least six characters. You will sign in again when you are done.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="eyebrow block mb-2">New password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-b border-paper/20 py-2 text-paper focus:border-ember outline-none transition-colors" />
          </div>
          <div>
            <label className="eyebrow block mb-2">Confirm password</label>
            <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-transparent border-b border-paper/20 py-2 text-paper focus:border-ember outline-none transition-colors" />
          </div>

          {error && <p className="text-ember text-sm font-mono">{error}</p>}

          <button type="submit" disabled={busy} className="w-full bg-paper text-ink font-mono text-xs tracking-widest uppercase py-3 mt-4 hover:bg-gold transition-colors disabled:opacity-50">
            {busy ? 'Saving...' : 'Save password'}
          </button>
        </form>
      </div>
    </div>
  )
}
