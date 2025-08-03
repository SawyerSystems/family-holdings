import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Mail,
  Key,
  Bell,
  Shield,
  Smartphone,
  DollarSign,
  Save,
  LogOut,
  AlertTriangle
} from 'lucide-react';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Form states
  const [name, setName] = useState(user?.name || 'John Sawyer');
  const [email, setEmail] = useState(user?.email || 'demo@example.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    contributionReminders: true,
    paymentNotifications: true,
    loanUpdates: true,
    securityAlerts: true
  });
  
  // Bank settings (admin only)
  const [bankSettings, setBankSettings] = useState({
    weeklyContributionAmount: 50,
    maxLoanAmount: 1000,
    defaultLoanTerm: '3 months'
  });
  
  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleSaveAccount = (e) => {
    e.preventDefault();
    // In a real app, this would call an API
    console.log('Saving account settings', { name, email });
  };
  
  const handleSavePassword = (e) => {
    e.preventDefault();
    // In a real app, this would call an API
    console.log('Changing password');
  };
  
  const handleSaveBankSettings = (e) => {
    e.preventDefault();
    // In a real app, this would call an API
    console.log('Saving bank settings', bankSettings);
  };
  
  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-white">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange}
          className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-500"></div>
      </label>
    </div>
  );
  
  return (
    <div className="px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Settings</h1>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Account Settings */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-white">
                <User className="w-5 h-5 mr-2" /> 
                Account Settings
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="w-4 h-4 text-white/50" />
                    </div>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="w-4 h-4 text-white/50" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Account Information
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-white">
                <Key className="w-5 h-5 mr-2" /> 
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-white">
                <Bell className="w-5 h-5 mr-2" /> 
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleSwitch 
                label="Email Notifications" 
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
              />
              
              <ToggleSwitch 
                label="Contribution Reminders" 
                checked={notifications.contributionReminders}
                onChange={() => handleNotificationChange('contributionReminders')}
              />
              
              <ToggleSwitch 
                label="Payment Notifications" 
                checked={notifications.paymentNotifications}
                onChange={() => handleNotificationChange('paymentNotifications')}
              />
              
              <ToggleSwitch 
                label="Loan Updates" 
                checked={notifications.loanUpdates}
                onChange={() => handleNotificationChange('loanUpdates')}
              />
              
              <ToggleSwitch 
                label="Security Alerts" 
                checked={notifications.securityAlerts}
                onChange={() => handleNotificationChange('securityAlerts')}
              />
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Notification Preferences
              </Button>
            </CardFooter>
          </Card>
          
          {/* Bank Settings (Admin Only) */}
          {isAdmin && (
            <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-white">
                  <Shield className="w-5 h-5 mr-2" /> 
                  Bank Admin Settings
                </CardTitle>
                <CardDescription>
                  Configure bank-wide settings (admin only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveBankSettings} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weekly-contribution">Weekly Contribution Amount</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <DollarSign className="w-4 h-4 text-white/50" />
                      </div>
                      <Input
                        id="weekly-contribution"
                        type="number"
                        value={bankSettings.weeklyContributionAmount}
                        onChange={(e) => setBankSettings(prev => ({ 
                          ...prev, 
                          weeklyContributionAmount: e.target.value 
                        }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-loan">Maximum Loan Amount</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <DollarSign className="w-4 h-4 text-white/50" />
                      </div>
                      <Input
                        id="max-loan"
                        type="number"
                        value={bankSettings.maxLoanAmount}
                        onChange={(e) => setBankSettings(prev => ({ 
                          ...prev, 
                          maxLoanAmount: e.target.value 
                        }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="default-term">Default Loan Term</Label>
                    <select 
                      id="default-term"
                      value={bankSettings.defaultLoanTerm}
                      onChange={(e) => setBankSettings(prev => ({ 
                        ...prev, 
                        defaultLoanTerm: e.target.value 
                      }))}
                      className="flex w-full h-10 px-3 py-2 text-sm border rounded-md bg-white/5 border-white/20"
                    >
                      <option value="1 month">1 month</option>
                      <option value="3 months">3 months</option>
                      <option value="6 months">6 months</option>
                      <option value="12 months">12 months</option>
                    </select>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveBankSettings} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Bank Settings
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Account Actions */}
          <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-white">
                <AlertTriangle className="w-5 h-5 mr-2" /> 
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => console.log('Download data')}
              >
                Download Your Data
              </Button>
              
              <Button 
                onClick={signOut}
                variant="destructive" 
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
