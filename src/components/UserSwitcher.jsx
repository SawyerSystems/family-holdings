import React, { useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AVAILABLE_USERS = [
  {
    id: '5e98e9eb-375b-49f6-82bc-904df30c4021',
    email: 'admin@familyholdings.local',
    name: 'Family Admin',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Family+Admin&background=dc2626&color=fff',
    description: 'Administrator'
  },
  {
    id: '6813d815-53cc-4d08-8bf5-8df09e8a7650',
    email: 'john@familyholdings.local',
    name: 'John Smith',
    role: 'member',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=2563eb&color=fff',
    description: 'Weekly: $75, Total: $1500'
  },
  {
    id: 'a00a1129-eabe-4e82-afa4-0a6136313cd2',
    email: 'jane@familyholdings.local',
    name: 'Jane Smith',
    role: 'member',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=7c3aed&color=fff',
    description: 'Weekly: $50, Total: $1000'
  },
  {
    id: '0155517a-6406-4cea-9425-990e32820803',
    email: 'bob@familyholdings.local',
    name: 'Bob Johnson',
    role: 'member',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=059669&color=fff',
    description: 'Weekly: $100, Total: $2000'
  }
];

const UserSwitcher = () => {
  const { user, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleUserSwitch = async (selectedUser) => {
    if (selectedUser.id === user?.id) {
      return; // Don't switch to the same user
    }
    
    try {
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

  const currentUser = AVAILABLE_USERS.find(u => u.id === user?.id) || AVAILABLE_USERS[0];

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
          {AVAILABLE_USERS.map((testUser) => (
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
