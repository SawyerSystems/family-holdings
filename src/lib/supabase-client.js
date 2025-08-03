import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For development mode, we'll provide a way to set a dev user
export const setDevUser = (user) => {
  if (import.meta.env.DEV) {
    localStorage.setItem('family_holdings_dev_user', JSON.stringify(user));
    
    // Dispatch an event to notify about the auth state change
    window.dispatchEvent(new CustomEvent('dev-auth-change', { 
      detail: { user }
    }));
  }
};
