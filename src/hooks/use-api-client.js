import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/api/api-client';

/**
 * Custom hook that provides an API client configured with the current user's context
 */
export const useApiClient = () => {
  const { user } = useAuth();
  
  const request = async (endpoint, method = 'GET', data = null) => {
    return apiClient.request(endpoint, method, data, user);
  };

  const get = (endpoint) => request(endpoint, 'GET');
  const post = (endpoint, data) => request(endpoint, 'POST', data);
  const put = (endpoint, data) => request(endpoint, 'PUT', data);
  const patch = (endpoint, data) => request(endpoint, 'PATCH', data);
  const del = (endpoint) => request(endpoint, 'DELETE');

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
  };
};

export default useApiClient;
