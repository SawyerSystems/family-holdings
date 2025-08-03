import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = React.useState('demo@example.com');
  const [password, setPassword] = React.useState('password123');
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  
  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // For development mode, use mock authentication
      if (import.meta.env.DEV && email === 'demo@example.com') {
        console.log("DEV MODE: Using mock authentication");
        
        // Create a dev user for testing
        const devUser = {
          id: 'dev-user-1',
          email: email,
          name: 'Development User',
          role: 'admin'
        };
        
        // Store the dev user in localStorage for persistence
        localStorage.setItem('family_holdings_dev_user', JSON.stringify(devUser));
        
        // Dispatch custom event to update auth context
        window.dispatchEvent(new CustomEvent('dev-auth-change', { 
          detail: { user: devUser }
        }));
        
        navigate('/dashboard');
        return;
      }
      
      // Otherwise use real authentication
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-800 to-primary-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Sawyer Family Bank</h1>
          <p className="mt-2 text-white/70">Secure family financial management</p>
        </div>
        
        {error && (
          <div className="p-4 text-white bg-red-500/20 border border-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-white/20 border border-white/10 rounded-lg"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-white/20 border border-white/10 rounded-lg"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-white bg-accent-500 rounded-lg hover:bg-accent-600 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-sm text-center text-white/50">
            Using demo credentials in development mode
          </div>
        </form>
      </div>
    </div>
  );
};

LoginPage.propTypes = {};

export default LoginPage;
