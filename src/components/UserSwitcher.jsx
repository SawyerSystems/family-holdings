import React, { useState, useEffect } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { User } from '@/api/entities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserSwitcher = () => {
  const { user, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real user data when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await User.getAll();
        const usersWithDescriptions = users.map(u => ({
          id: u.id,
          email: u.email || `${u.full_name.toLowerCase().replace(' ', '.')}@familyholdings.local`,
          name: u.full_name,
          role: u.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=${u.role === 'admin' ? 'dc2626' : '2563eb'}&color=fff`,
          description: u.role === 'admin' ? 'Administrator' : `Weekly: $${u.weekly_contribution || 0}, Total: $${u.total_contributed || 0}`
        }));
        setAvailableUsers(usersWithDescriptions);
      } catch (error) {
        console.error('Failed to load users:', error);
        // Fallback to basic user info if API fails
        setAvailableUsers([{
          id: user?.id,
          name: user?.full_name || 'Current User',
          email: user?.email || 'user@familyholdings.local',
          role: user?.role || 'member',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=2563eb&color=fff`,
          description: 'Current User'
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [user]);

  const handleUserSwitch = async (selectedUser) => {
    if (selectedUser.id === user?.id) {
      return; // Don't switch to the same user
    }
    
    try {
      // Persist selected user id immediately so AuthContext init can pick it up
      localStorage.setItem('user-switcher.selectedUserId', selectedUser.id);
      await switchUser(selectedUser);
      setIsOpen(false);
      
      // Show a brief notification
      console.log(`Switched to: ${selectedUser.name} (${selectedUser.role})`);
      
      // Force a page refresh to ensure all data is reloaded with new user context
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Failed to switch user:', error);
    }
  };

  const currentUser = availableUsers.find(u => u.id === user?.id) || availableUsers[0];

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  if (loading || availableUsers.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-400/40"
          >
            <Users className="h-4 w-4" />
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="h-5 w-5 rounded-full"
            />
            <span className="hidden sm:inline-block">{currentUser.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-primary-900/95 backdrop-blur-md border border-white/10 text-white">
          <div className="p-2 border-b border-white/10">
            <div className="text-sm font-medium text-white">Switch User (Dev Mode)</div>
            <div className="text-xs text-white/60">For testing different user roles</div>
          </div>
          {availableUsers.map((testUser) => (
            <DropdownMenuItem
              key={testUser.id}
              onClick={() => handleUserSwitch(testUser)}
              className={`flex items-center gap-3 p-3 cursor-pointer rounded-md transition-colors ${
                testUser.id === user?.id ? 'bg-accent-500/20 text-white' : 'hover:bg-white/10'
              }`}
            >
              <img 
                src={testUser.avatar} 
                alt={testUser.name}
                className="h-8 w-8 rounded-full flex-shrink-0 ring-2 ring-white/10"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-white">{testUser.name}</div>
                  {testUser.role === 'admin' && (
                    <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-300 rounded">
                      Admin
                    </span>
                  )}
                  {testUser.id === user?.id && (
                    <span className="px-1.5 py-0.5 text-xs bg-accent-500/30 text-accent-200 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm text-white/60 truncate">{testUser.email}</div>
                <div className="text-xs text-white/40">{testUser.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserSwitcher;
