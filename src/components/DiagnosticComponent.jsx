import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SupabaseConnectionTest from './diagnostics/SupabaseConnectionTest';
import { Button } from './ui/button';
import { checkEnvironmentVariables } from '@/utils/environment';

/**
 * DiagnosticComponent provides tools to diagnose and test the application's
 * connections, configurations, and services.
 */
export default function DiagnosticComponent() {
  const [backendHealth, setBackendHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [envVariables, setEnvVariables] = useState(null);

  useEffect(() => {
    // Check environment variables when component mounts
    setEnvVariables(checkEnvironmentVariables());
  }, []);

  const checkBackendHealth = async () => {
    setChecking(true);
    try {
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      setBackendHealth({
        status: data.status === 'ok' ? 'healthy' : 'unhealthy',
        message: data.status === 'ok' ? 'Backend is running properly' : 'Backend health check failed',
        data
      });
    } catch (error) {
      setBackendHealth({
        status: 'error',
        message: `Could not connect to backend: ${error.message}`,
        error
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>System Diagnostics</CardTitle>
          <CardDescription>
            Test and verify the application's connections and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="database">
            <TabsList className="mb-4">
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="backend">Backend</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="database" className="py-4">
              <SupabaseConnectionTest />
            </TabsContent>
            
            <TabsContent value="backend" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Backend Health</CardTitle>
                  <CardDescription>Check if the FastAPI backend is running correctly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {backendHealth ? (
                      <div className={`p-4 rounded-md ${
                        backendHealth.status === 'healthy' ? 'bg-green-100' : 
                        backendHealth.status === 'unhealthy' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <p className="font-medium">{backendHealth.status.toUpperCase()}</p>
                        <p className="text-sm mt-1">{backendHealth.message}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Backend health not checked yet</p>
                    )}
                  </div>
                  <Button 
                    onClick={checkBackendHealth} 
                    disabled={checking}
                  >
                    {checking ? 'Checking...' : 'Check Backend Health'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="environment" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>Check the environment configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  {envVariables ? (
                    <div className="space-y-2">
                      <p><strong>Node Environment:</strong> {envVariables.mode}</p>
                      <p><strong>Supabase URL:</strong> {envVariables.supabaseUrl || 'Not set'}</p>
                      <p><strong>Supabase Key Configured:</strong> {envVariables.supabaseKeyExists ? 'Yes' : 'No'}</p>
                      <p><strong>Backend URL:</strong> {envVariables.backendUrl}</p>
                    </div>
                  ) : (
                    <p>Loading environment variables...</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
