import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext.jsx'
import MainLayout from '@/layouts/MainLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ContributionsPage from '@/pages/ContributionsPage'
import Loans from '@/pages/loans' // Use the real API-connected loans page
import FamilyOverviewPage from '@/pages/FamilyOverviewPage'
import SettingsPage from '@/pages/SettingsPage'
import DiagnosticComponent from '@/components/DiagnosticComponent'
import { Toaster } from '@/components/ui/toaster'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/diagnostics" element={<DiagnosticComponent />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="contributions" element={<ContributionsPage />} />
            <Route path="loans" element={<Loans />} />
            <Route path="family-overview" element={<FamilyOverviewPage />} />
            <Route path="bank-overview" element={<Navigate to="/dashboard" replace />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
