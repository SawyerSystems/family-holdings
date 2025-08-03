import { useState, useEffect } from 'react'
import { useView } from '@/hooks/use-view'
import { useAuth } from '@/hooks/use-auth'
import { User } from '@/api/entities'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { CheckCircle, User as UserIcon, Shield, LogOut, Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuth()
  const { isAdminView, toggleAdminView } = useView()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [weeklyContribution, setWeeklyContribution] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = await User.me()
        setUserData(userData)
        
        // Set form values
        setName(userData.name || '')
        setEmail(userData.email || '')
        setPhone(userData.phone || '')
        setWeeklyContribution(userData.weekly_contribution?.toString() || '')
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading user data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'destructive'
        })
        setLoading(false)
      }
    }

    loadUserData()
  }, [toast])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    
    try {
      // Update user profile
      await User.update({
        name,
        phone,
        weekly_contribution: weeklyContribution ? parseFloat(weeklyContribution) : undefined
      })
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      })
      return
    }
    
    setSaveLoading(true)
    
    try {
      // Update password
      await User.updatePassword(password)
      
      // Clear form
      setPassword('')
      setConfirmPassword('')
      
      toast({
        title: 'Success',
        description: 'Password updated successfully'
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive'
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: 'Success',
        description: 'Logged out successfully'
      })
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-white/10"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <UserIcon className="w-5 h-5 text-accent-400 mr-2" />
            <h2 className="text-xl font-bold text-white">Profile Settings</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="block w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white/70"
                placeholder="Your email address"
              />
              <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Your phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Weekly Contribution Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-white/50">$</span>
                </div>
                <input
                  type="number"
                  value={weeklyContribution}
                  onChange={(e) => setWeeklyContribution(e.target.value)}
                  className="block w-full pl-8 pr-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
                  placeholder="50.00"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={saveLoading} className="w-full">
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>
        
        {/* Account Security */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-accent-400 mr-2" />
            <h2 className="text-xl font-bold text-white">Account Security</h2>
          </div>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter new password"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Confirm new password"
                required
              />
            </div>
            
            <Button type="submit" disabled={saveLoading} className="w-full">
              {saveLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            {userData?.is_admin && (
              <div className="mb-4">
                <Button 
                  onClick={toggleAdminView} 
                  variant={isAdminView ? "default" : "outline"}
                  className="w-full mb-4"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  {isAdminView ? 'Switch to Member View' : 'Switch to Admin View'}
                </Button>
              </div>
            )}
            
            <Button 
              onClick={handleLogout} 
              variant="destructive" 
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
