import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Import API client (we'll implement this later)
// import { supabase } from '@/api/supabaseClient';

// Create context
export const AuthContext = createContext(null);

// For development, we'll use a mock user. In production, this would use Supabase auth
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // For development mode, sign in automatically
  const isDevelopment = import.meta.env.DEV;
  
  useEffect(() => {
    // This simulates retrieving a user from localStorage or a real auth session
    const initAuth = async () => {
      try {
        setLoading(true);
        
        if (isDevelopment) {
          // In development, set a mock user
          const mockUser = {
            id: 'dev-user-123',
            email: 'dev@example.com',
            name: 'Development User',
            role: 'admin', // admin or member
            avatar: 'https://ui-avatars.com/api/?name=Dev+User&background=6d28d9&color=fff',
          };
          
          setUser(mockUser);
          localStorage.setItem('auth.user', JSON.stringify(mockUser));
        } else {
          // In production, we would use Supabase auth
          // const { data: { session } } = await supabase.auth.getSession();
          // if (session) {
          //   const { data: userData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          //   setUser({ ...session.user, ...userData });
          // }
          
          // For now, check localStorage
          const storedUser = localStorage.getItem('auth.user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, [isDevelopment]);
  
  // Sign in function - this would use Supabase auth in production
  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      
      if (isDevelopment) {
        // Mock successful sign-in
        const mockUser = {
          id: 'dev-user-123',
          email,
          name: 'Development User',
          role: 'admin',
          avatar: 'https://ui-avatars.com/api/?name=Dev+User&background=6d28d9&color=fff',
        };
        
        setUser(mockUser);
        localStorage.setItem('auth.user', JSON.stringify(mockUser));
        return { success: true, user: mockUser };
      } else {
        // In production:
        // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        // if (error) throw error;
        // const { data: userData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        // setUser({ ...data.user, ...userData });
        // return { success: true, user: { ...data.user, ...userData } };
        
        // Mock for now:
        if (email === 'admin@example.com' && password === 'password') {
          const mockUser = {
            id: 'real-user-123',
            email,
            name: 'Real User',
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Real+User&background=6d28d9&color=fff',
          };
          
          setUser(mockUser);
          localStorage.setItem('auth.user', JSON.stringify(mockUser));
          return { success: true, user: mockUser };
        } else {
          throw new Error('Invalid login credentials');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      // In production: await supabase.auth.signOut();
      localStorage.removeItem('auth.user');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };
  
  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
