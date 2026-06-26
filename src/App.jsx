import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import { supabase } from './lib/supabase.js'
import Login from './pages/Login.jsx'
import SetPassword from './pages/SetPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'

function Protected({ children }) {
  const { session, loading, accessLoading, isAllowed, accessError } = useAuth()
  if (loading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <p className="eyebrow">Loading</p>
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <p className="eyebrow mb-2">Invite required</p>
          <h1 className="font-display text-4xl font-light text-paper mb-5">
            Access has not been approved.
          </h1>
          <p className="font-display text-lg font-light text-bone/70 leading-relaxed mb-6">
            This dashboard is invite-only. Ask the workspace owner to approve your email before signing in again.
          </p>
          {accessError && (
            <p className="font-mono text-sm text-ember mb-6">
              Access check failed: {accessError}
            </p>
          )}
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-paper text-ink font-mono text-xs tracking-widest uppercase px-5 py-3 hover:bg-gold transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
