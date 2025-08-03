import { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-client'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            token: session.access_token,
            ...session.user.user_metadata
          })
        } else {
          setUser(null)
          
          // Development mode auto-login
          if (import.meta.env.DEV) {
            const devUser = localStorage.getItem('family_holdings_dev_user')
            if (devUser) {
              setUser(JSON.parse(devUser))
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth session:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            token: session.access_token,
            ...session.user.user_metadata
          })
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    // Listen for dev auth change events (for development mode)
    const handleDevAuthChange = (event) => {
      const { user } = event.detail
      setUser(user)
    }
    
    if (import.meta.env.DEV) {
      window.addEventListener('dev-auth-change', handleDevAuthChange)
    }

    return () => {
      subscription?.unsubscribe()
      if (import.meta.env.DEV) {
        window.removeEventListener('dev-auth-change', handleDevAuthChange)
      }
    }
  }, [])

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear dev user if in development mode
      if (import.meta.env.DEV) {
        localStorage.removeItem('family_holdings_dev_user')
        
        // Dispatch event to notify about auth state change
        window.dispatchEvent(new CustomEvent('dev-auth-change', { 
          detail: { user: null }
        }))
      }
      
      setUser(null)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    signIn,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
