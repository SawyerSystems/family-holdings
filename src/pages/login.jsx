import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { setDevUser } from '@/lib/auth-utils'
import { useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '@/components/loading-screen'

export default function Login() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = useCallback(async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    
    console.log("Attempting login with:", email)

    try {
      // For development mode, skip actual authentication
      if (import.meta.env.MODE === 'development' && 
          email === 'demo@example.com' && 
          password === 'password123') {
        console.log("DEV MODE: Using mock authentication")
        
        // Create fake user session for development
        const devUser = {
          id: 'dev-user-1',
          email: email,
          user_metadata: { name: 'Development User' },
          role: 'admin'
        }
        
        // Use our utility to set the dev user and trigger auth state change
        setDevUser(devUser)
        
        // Navigate to dashboard
        console.log("Login successful, redirecting to dashboard")
        navigate('/dashboard')
        return
      }

      // For production, use real authentication
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        throw error
      }

      console.log("Login successful, redirecting to dashboard")
      navigate('/dashboard')
    } catch (err) {
      console.error("Login failed:", err)
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }, [email, password, navigate])

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      })

      if (error) {
        throw error
      }

      setError('Check your email for the confirmation link!')
    } catch (err) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  // For development purposes, auto-login when the component mounts
  useEffect(() => {
    // Only auto-login in development mode AND if we haven't tried it in this session already
    if (import.meta.env.MODE === 'development' && !sessionStorage.getItem('autoLoginAttempted')) {
      console.log("DEV MODE: Auto-login initiated")
      // Set flag to prevent repeated login attempts across page reloads
      sessionStorage.setItem('autoLoginAttempted', 'true')
      // Use a timeout to prevent potential render issues
      setTimeout(() => {
        handleLogin()
      }, 100)
    }
  }, [handleLogin])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-900 to-primary-950">
      <div className="w-[380px] p-8 rounded-xl bg-white/10 backdrop-blur-sm shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-accent-400 rounded-full p-4 mb-4">
            <img 
              src="/logo.png"
              alt="Family Bank Logo"
              className="h-12 w-12"
              onError={(e) => e.target.src = "https://via.placeholder.com/48/F97316/FFFFFF?text=Bank"}
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Sawyer Family Bank</h1>
          <p className="text-white/70">Secure family financial management</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-500/20 border border-red-600 text-white px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </div>
          
          <div className="space-y-1">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-accent-400 hover:bg-accent-500 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-400 flex items-center justify-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                <span>Signing in...</span>
              </>
            ) : 'Sign in to Continue'}
          </button>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-transparent border border-white/30 hover:bg-white/10 text-white rounded-lg transition-colors focus:outline-none"
            >
              Create Account
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-white/50 text-sm">
          Using demo credentials for development.
        </div>
      </div>
    </div>
  )
}
