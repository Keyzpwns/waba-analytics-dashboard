import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessLoading, setAccessLoading] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)
  const [accessError, setAccessError] = useState(null)

  function updateSession(nextSession) {
    setAccessLoading(Boolean(nextSession?.user?.email))
    setSession(nextSession)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function checkInvite() {
      setAccessError(null)
      setIsAllowed(false)

      if (!session?.user?.email) {
        setAccessLoading(false)
        return
      }

      setAccessLoading(true)
      const email = session.user.email.trim().toLowerCase()
      const { data, error } = await supabase
        .from('app_members')
        .select('email')
        .eq('email', email)
        .eq('active', true)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        setAccessError(error.message)
        setIsAllowed(false)
      } else {
        setIsAllowed(Boolean(data))
      }
      setAccessLoading(false)
    }

    checkInvite()

    return () => {
      cancelled = true
    }
  }, [session])

  return (
    <AuthContext.Provider value={{ session, loading, accessLoading, isAllowed, accessError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
