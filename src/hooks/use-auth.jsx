import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// This is a simple pass-through hook that makes it easier to import
// and potentially extend auth functionality in the future
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
