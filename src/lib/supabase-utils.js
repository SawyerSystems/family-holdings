import { supabase } from './supabase-client';

/**
 * Utility function to test the Supabase connection
 * @returns {Promise<Object>} Result object with status and message
 */
export async function testSupabaseConnection() {
  try {
    // Attempt to query public schema version as a simple connectivity test
    const { data, error } = await supabase.from('_schema').select('version').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        error
      };
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase',
      data
    };
  } catch (err) {
    console.error('Unexpected error during Supabase connection test:', err);
    return {
      success: false,
      message: `Unexpected error: ${err.message}`,
      error: err
    };
  }
}

/**
 * Utility function to test authentication
 * @returns {Promise<Object>} Result object with auth status
 */
export async function checkAuthStatus() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        authenticated: false,
        message: `Auth error: ${error.message}`,
        error
      };
    }
    
    return {
      authenticated: !!data.session,
      message: data.session 
        ? `Authenticated as ${data.session.user.email}` 
        : 'Not authenticated',
      session: data.session
    };
  } catch (err) {
    console.error('Error checking auth status:', err);
    return {
      authenticated: false,
      message: `Error: ${err.message}`,
      error: err
    };
  }
}
