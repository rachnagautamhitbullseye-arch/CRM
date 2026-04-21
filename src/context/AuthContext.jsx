import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data?.session?.user ?? null)
      setLoading(false)
    }

    init()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email, password) => {
    return await supabase.auth.signUp({ email, password })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}