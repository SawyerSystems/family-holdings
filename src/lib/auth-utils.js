// Auth utilities for development mode
export const setDevUser = (user) => {
  if (import.meta.env.DEV) {
    localStorage.setItem('family_holdings_dev_user', JSON.stringify(user));
    
    // Dispatch an event to notify about the auth state change
    window.dispatchEvent(new CustomEvent('dev-auth-change', { 
      detail: { user }
    }));
  }
};
