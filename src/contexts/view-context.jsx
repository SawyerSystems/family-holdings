import { createContext, useState, useEffect } from 'react'

export const ViewContext = createContext({
  viewAs: 'user',
  isAdmin: false,
  isAdminView: false,
  handleViewSwitch: () => {}
})

export function ViewProvider({ children, user }) {
  const [viewAs, setViewAs] = useState(
    sessionStorage.getItem('viewAs') || (user?.role === 'admin' ? 'admin' : 'user')
  )
  
  const isAdmin = user?.role === 'admin'
  const isAdminView = isAdmin && viewAs === 'admin'
  
  useEffect(() => {
    // Set initial view mode based on user role
    if (user) {
      if (user.role === 'admin') {
        if (!sessionStorage.getItem('viewAs')) {
          sessionStorage.setItem('viewAs', 'admin')
          setViewAs('admin')
        }
      } else {
        sessionStorage.setItem('viewAs', 'user')
        setViewAs('user')
      }
    }
  }, [user])
  
  const handleViewSwitch = () => {
    if (!isAdmin) return
    
    const newView = viewAs === 'admin' ? 'user' : 'admin'
    setViewAs(newView)
    sessionStorage.setItem('viewAs', newView)
  }
  
  return (
    <ViewContext.Provider value={{ viewAs, isAdmin, isAdminView, handleViewSwitch, user }}>
      {children}
    </ViewContext.Provider>
  )
}
