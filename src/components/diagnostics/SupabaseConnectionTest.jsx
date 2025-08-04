import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { testSupabaseConnection, checkAuthStatus } from '../../lib/supabase-utils';

export default function SupabaseConnectionTest() {
  const [frontendStatus, setFrontendStatus] = useState({ tested: false, result: null });
  const [backendStatus, setBackendStatus] = useState({ tested: false, result: null });
  const [authStatus, setAuthStatus] = useState({ tested: false, result: null });
  const [loading, setLoading] = useState(false);

  const testFrontendConnection = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      setFrontendStatus({ tested: true, result });
    } catch (error) {
      setFrontendStatus({ 
        tested: true, 
        result: { success: false, message: error.message, error } 
      });
    }
    setLoading(false);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/database/test-connection');
      const data = await response.json();
      
      setBackendStatus({
        tested: true,
        result: {
          success: data.status === 'ok',
          message: data.message,
          data: data.data
        }
      });
    } catch (error) {
      setBackendStatus({
        tested: true,
        result: { success: false, message: error.message, error }
      });
    }
    setLoading(false);
  };

  const testAuthStatus = async () => {
    setLoading(true);
    try {
      const result = await checkAuthStatus();
      setAuthStatus({ tested: true, result });
    } catch (error) {
      setAuthStatus({
        tested: true,
        result: { authenticated: false, message: error.message, error }
      });
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    await testFrontendConnection();
    await testBackendConnection();
    await testAuthStatus();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>
          Test connectivity to the Supabase database from both frontend and backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Frontend Connection</h3>
            {frontendStatus.tested ? (
              <div className={`p-3 rounded ${frontendStatus.result?.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-medium">{frontendStatus.result?.success ? 'Connected!' : 'Failed'}</p>
                <p className="text-sm mt-1">{frontendStatus.result?.message}</p>
              </div>
            ) : (
              <p className="text-gray-500">Not tested yet</p>
            )}
            <Button 
              onClick={testFrontendConnection} 
              className="mt-2 w-full" 
              disabled={loading}
              variant="outline"
            >
              Test Frontend
            </Button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Backend Connection</h3>
            {backendStatus.tested ? (
              <div className={`p-3 rounded ${backendStatus.result?.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-medium">{backendStatus.result?.success ? 'Connected!' : 'Failed'}</p>
                <p className="text-sm mt-1">{backendStatus.result?.message}</p>
              </div>
            ) : (
              <p className="text-gray-500">Not tested yet</p>
            )}
            <Button 
              onClick={testBackendConnection} 
              className="mt-2 w-full" 
              disabled={loading}
              variant="outline"
            >
              Test Backend
            </Button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            {authStatus.tested ? (
              <div className={`p-3 rounded ${authStatus.result?.authenticated ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <p className="font-medium">
                  {authStatus.result?.authenticated ? 'Authenticated' : 'Not Authenticated'}
                </p>
                <p className="text-sm mt-1">{authStatus.result?.message}</p>
              </div>
            ) : (
              <p className="text-gray-500">Not tested yet</p>
            )}
            <Button 
              onClick={testAuthStatus} 
              className="mt-2 w-full" 
              disabled={loading}
              variant="outline"
            >
              Check Auth
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={runAllTests} 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Run All Tests'}
        </Button>
      </CardFooter>
    </Card>
  );
}
