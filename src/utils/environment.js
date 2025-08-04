// Make sure .env is properly loaded in the frontend
export function checkEnvironmentVariables() {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKeyExists: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    mode: import.meta.env.MODE,
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  };
}
