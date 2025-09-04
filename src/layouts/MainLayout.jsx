import React, { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '@/hooks/use-auth';

// Icons
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
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewAs, setViewAs] = useState('user');
  
  // Show loading while auth is initializing
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const isAdmin = user?.role === 'admin';
  const isAdminView = isAdmin && viewAs === 'admin';
  
  const toggleView = () => {
    if (!isAdmin) return;
    const newView = viewAs === 'admin' ? 'user' : 'admin';
    setViewAs(newView);
  };
  
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
  ];
  
  const visibleNavItems = navigationItems.filter(
    item => item.showWhen.includes(isAdminView ? 'admin' : 'user')
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-950">
      <div className="flex flex-col md:flex-row">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 text-white shadow-md bg-primary-900 md:hidden">
          <h1 className="text-xl font-bold">Sawyer Family Bank</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-primary-800"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
        
        {/* Sidebar navigation for desktop */}
        <aside className="hidden h-screen md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto bg-primary-900">
            <div className="flex items-center justify-between h-16 px-4 text-white border-b border-white/10">
              <h1 className="text-xl font-bold">Sawyer Family Bank</h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`flex items-center px-3 py-2 rounded-lg ${
                      isActive 
                        ? 'bg-primary-700 text-white' 
                        : 'text-white/70 hover:bg-primary-700/50 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.title}
                  </Link>
                );
              })}
              
              {isAdmin && (
                <button
                  onClick={toggleView}
                  className="flex items-center w-full px-3 py-2 text-white/70 rounded-lg hover:bg-primary-700/50 hover:text-white"
                >
                  <Eye size={20} className="mr-3" />
                  View as: {viewAs === 'admin' ? 'Admin' : 'User'}
                </button>
              )}
              
              <button
                onClick={signOut}
                className="flex items-center w-full px-3 py-2 mt-4 text-white/70 rounded-lg hover:bg-primary-700/50 hover:text-white"
              >
                <LogOut size={20} className="mr-3" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>
        
        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-20 mt-16 bg-primary-900 md:hidden">
            <nav className="p-4 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`flex items-center px-3 py-2 rounded-lg ${
                      isActive 
                        ? 'bg-primary-700 text-white' 
                        : 'text-white/70 hover:bg-primary-700/50 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.title}
                  </Link>
                );
              })}
              
              {isAdmin && (
                <button
                  onClick={() => {
                    toggleView();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-white/70 rounded-lg hover:bg-primary-700/50 hover:text-white"
                >
                  <Eye size={20} className="mr-3" />
                  View as: {viewAs === 'admin' ? 'Admin' : 'User'}
                </button>
              )}
              
              <button
                onClick={signOut}
                className="flex items-center w-full px-3 py-2 mt-4 text-white/70 rounded-lg hover:bg-primary-700/50 hover:text-white"
              >
                <LogOut size={20} className="mr-3" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default MainLayout;
