import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useView } from '@/hooks/use-view'
import { Sidebar } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { Home, Users, DollarSign, Wallet, Settings } from 'lucide-react'

// Loading spinner component
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-primary-300 border-t-accent-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-white">Loading...</p>
      </div>
    </div>
  )
}

export default function Layout() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const { isAdminView } = useView()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Define navigation items based on user role and view
  const getNavItems = () => {
    const items = [
      {
        name: 'Dashboard',
        icon: <Home className="w-5 h-5" />,
        path: '/dashboard',
      },
      {
        name: 'Contributions',
        icon: <Wallet className="w-5 h-5" />,
        path: '/contributions',
      },
      {
        name: 'Loans',
        icon: <DollarSign className="w-5 h-5" />,
        path: '/loans',
      },
      {
        name: 'Settings',
        icon: <Settings className="w-5 h-5" />,
        path: '/settings',
      },
    ]

    // Add Family Overview for admins in admin view
    if (user?.is_admin && isAdminView) {
      items.splice(1, 0, {
        name: 'Family Overview',
        icon: <Users className="w-5 h-5" />,
        path: '/family-overview',
      })
    }

    return items
  }

  // Handle loading state
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      {/* Sidebar */}
      <Sidebar 
        items={getNavItems()} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        user={user}
        isAdminView={isAdminView}
      />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <Outlet />
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
