import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from './button'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useView } from '@/hooks/use-view'

export function Sidebar({ items, isOpen, setIsOpen, user }) {
  const { logout } = useAuth()
  const { isAdminView, toggleAdminView } = useView()
  
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-50 md:relative
          w-64 md:w-72 h-screen 
          bg-primary-900/90 backdrop-blur-md
          border-r border-white/10
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">Family Holdings</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-white/70 hover:text-white md:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation links */}
        <nav className="mt-6 px-2">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center px-4 py-2 rounded-lg 
                    ${isActive 
                      ? 'bg-primary-700 text-white' 
                      : 'text-white/70 hover:bg-primary-800 hover:text-white'}
                    transition-colors duration-200
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {/* User info */}
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center">
              <span className="text-accent-400 font-bold">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-white/70">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          
          {/* Admin toggle (if applicable) */}
          {user?.is_admin && (
            <div className="mb-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleAdminView}
                className="w-full text-xs"
              >
                {isAdminView ? 'Switch to Member View' : 'Switch to Admin View'}
              </Button>
            </div>
          )}
          
          {/* Logout button */}
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
            className="w-full flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-primary-700 text-white shadow-lg md:hidden z-30"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </>
  )
}
