import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User } from '../api/entities'
import {
  Home,
  DollarSign,
  CreditCard,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Landmark,
  Eye
} from 'lucide-react'
import { ViewContext } from '../contexts/view-context'
import { useAuth } from '../hooks/use-auth'
import { apiClient } from '../api/api-client'
import LoadingScreen from '../components/loading-screen'
import PropTypes from 'prop-types'

export default function MainLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [viewAs, setViewAs] = useState(sessionStorage.getItem('viewAs') || 'user')
  const { signOut, user: authUser } = useAuth()

  // Load user data when auth user changes
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we have an authenticated user
        if (!authUser) {
          console.log("No authenticated user found")
          setLoading(false)
          return
        }
        
        console.log("Auth user found, loading user data...", authUser.email)
        
        // Set the auth token in the API client
        apiClient.setAuthToken(authUser.token || 'dev-token')
        
        let userData = null
        try {
          // Now fetch user data from the backend
          userData = await User.me()
          console.log("User data loaded:", userData)
          setUser(userData)
          
          // On initial load, set the correct default view if not already set
          if (userData.role === 'admin') {
            if (!sessionStorage.getItem('viewAs')) {
              sessionStorage.setItem('viewAs', 'admin')
              setViewAs('admin')
            }
          } else {
            sessionStorage.setItem('viewAs', 'user')
            setViewAs('user')
          }
          
          // Initialize user with default banking settings if they don't exist
          if (!userData.weekly_contribution) {
            await User.updateMyUserData({
              weekly_contribution: 50,
              total_contributed: 0,
              current_loan_balance: 0,
              late_fee_balance: 0,
              borrowing_limit: 0,
              borrow_limit_percent: 75,
              late_fee_amount: 5,
              repayment_buffer: 25,
              join_date: new Date().toISOString().split('T')[0],
              is_active: true
            })
            
            // Reload user data
            const updatedUser = await User.me()
            setUser(updatedUser)
          }
        } catch (apiError) {
          console.error("Error loading user data:", apiError)
          // Handle API error but don't rethrow
        }
      } catch (err) {
        console.error("User loading error:", err)
      }
      setLoading(false)
    }

    if (authUser) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [authUser])

  const handleLogout = async () => {
    try {
      // Clear view settings first
      sessionStorage.removeItem('viewAs')
      sessionStorage.removeItem('autoLoginAttempted')
      
      // Use auth context to sign out
      await signOut()
      
      // Clear any API tokens
      apiClient.setAuthToken(null)
      
      // Navigate to login after successful logout
      navigate('/login')
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const handleViewSwitch = () => {
    const newView = viewAs === 'admin' ? 'user' : 'admin'
    setViewAs(newView)
    sessionStorage.setItem('viewAs', newView)
  }

  const isAdmin = user?.role === "admin" // Check if the user's actual role is admin
  const isAdminView = isAdmin && viewAs === 'admin' // Check if user is admin AND currently viewing as admin

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      showWhen: ["user", "admin"],
    },
    {
      title: "Contributions",
      url: "/contributions",
      icon: DollarSign,
      showWhen: ["user", "admin"],
    },
    {
      title: "Loans",
      url: "/loans",
      icon: CreditCard,
      showWhen: ["user", "admin"],
    },
    {
      title: "Family Overview",
      url: "/family-overview",
      icon: Users,
      showWhen: ["admin"],
    },
    {
      title: "Bank Overview",
      url: "/bank-overview",
      icon: Landmark,
      showWhen: ["admin"],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      showWhen: ["user", "admin"],
    },
  ]

  const visibleNavItems = navigationItems.filter(
    item => item.showWhen.includes(isAdminView ? 'admin' : 'user')
  )

  if (loading) {
    return <LoadingScreen message="Loading user data..." />
  }

  return (
    <div className="app min-h-screen bg-gradient-to-br from-primary-800 to-primary-950">
      <div className="app-container">
        <div className="flex flex-col md:flex-row">
          <div>
            <ViewContext.Provider value={{ viewAs, isAdmin, isAdminView, handleViewSwitch, user }}>
              {/* Mobile header */}
              <header className="bg-primary-800 text-white p-4 flex justify-between items-center shadow-md md:hidden sticky top-0 z-10">
                <h1 className="text-xl font-bold">Sawyer Family Bank</h1>
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-white focus:outline-none"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </header>

              {/* Mobile sidebar */}
              {mobileMenuOpen && (
                <div className="md:hidden bg-primary-700 text-white min-h-screen fixed inset-0 top-16 z-10 pb-6 px-4 overflow-y-auto">
                  <nav className="mt-6 space-y-4">
                    {visibleNavItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.url}
                        className={`flex items-center p-3 rounded-lg hover:bg-primary-600 ${
                          location.pathname === item.url ? 'bg-primary-600' : ''
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                    
                    {isAdmin && (
                      <button
                        onClick={() => {
                          handleViewSwitch()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center w-full p-3 rounded-lg hover:bg-primary-600"
                      >
                        <Eye className="mr-3 h-5 w-5" />
                        <span>View as {viewAs === 'admin' ? 'Member' : 'Admin'}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full p-3 rounded-lg hover:bg-primary-600 text-red-300"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </nav>
                </div>
              )}

              {/* Desktop sidebar */}
              <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:bg-primary-700 md:text-white md:shadow-xl">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-center h-16 px-4 border-b border-primary-600">
                    <h1 className="text-xl font-bold">Sawyer Family Bank</h1>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto py-4 px-3">
                    <nav className="space-y-2">
                      {visibleNavItems.map((item, index) => (
                        <Link
                          key={index}
                          to={item.url}
                          className={`flex items-center p-3 rounded-lg hover:bg-primary-600 ${
                            location.pathname === item.url ? 'bg-primary-600' : ''
                          }`}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                  
                  <div className="p-4 border-t border-primary-600 space-y-2">
                    {isAdmin && (
                      <button
                        onClick={handleViewSwitch}
                        className="flex items-center w-full p-3 rounded-lg hover:bg-primary-600"
                      >
                        <Eye className="mr-3 h-5 w-5" />
                        <span>View as {viewAs === 'admin' ? 'Member' : 'Admin'}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full p-3 rounded-lg hover:bg-primary-600 text-red-300"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                    
                    {user && (
                      <div className="pt-2 border-t border-primary-600 mt-2">
                        <div className="text-sm text-primary-100">{user.email}</div>
                        <div className="text-xs text-primary-300">{user.role}</div>
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <main className="md:ml-64 p-4 pt-6">
                {children}
              </main>
            </ViewContext.Provider>
          </div>
        </div>
      </div>
    </div>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
}
