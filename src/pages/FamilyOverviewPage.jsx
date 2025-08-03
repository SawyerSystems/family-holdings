import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Wallet, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  UserCog
} from 'lucide-react';

const FamilyOverviewPage = () => {
  const { user } = useAuth();
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [expandedMember, setExpandedMember] = useState(null);
  
  // Sample data for family members
  const [familyMembers] = useState([
    {
      id: 'user1',
      name: 'John Sawyer',
      email: 'john@example.com',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=John+Sawyer&background=6d28d9&color=fff',
      totalContributed: 500,
      activeLoans: 0,
      contributionStatus: 'current',
      joinDate: '01/15/2023',
      lastContribution: '09/01/2023'
    },
    {
      id: 'user2',
      name: 'Lisa Sawyer',
      email: 'lisa@example.com',
      role: 'member',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Sawyer&background=6d28d9&color=fff',
      totalContributed: 400,
      activeLoans: 0,
      contributionStatus: 'current',
      joinDate: '01/15/2023',
      lastContribution: '09/01/2023'
    },
    {
      id: 'user3',
      name: 'Mark Sawyer',
      email: 'mark@example.com',
      role: 'member',
      avatar: 'https://ui-avatars.com/api/?name=Mark+Sawyer&background=6d28d9&color=fff',
      totalContributed: 350,
      activeLoans: 1,
      contributionStatus: 'late',
      joinDate: '02/20/2023',
      lastContribution: '08/20/2023'
    },
    {
      id: 'user4',
      name: 'Sarah Sawyer',
      email: 'sarah@example.com',
      role: 'member',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Sawyer&background=6d28d9&color=fff',
      totalContributed: 250,
      activeLoans: 0,
      contributionStatus: 'current',
      joinDate: '03/10/2023',
      lastContribution: '09/01/2023'
    },
  ]);
  
  // Sample contribution summary
  const contributionSummary = {
    totalContributed: familyMembers.reduce((sum, member) => sum + member.totalContributed, 0),
    activeMembers: familyMembers.length,
    currentMembers: familyMembers.filter(m => m.contributionStatus === 'current').length,
    lateMembers: familyMembers.filter(m => m.contributionStatus === 'late').length
  };
  
  const getContributionStatusBadge = (status) => {
    switch (status) {
      case 'current':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Current
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Late
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </span>
        );
      default:
        return null;
    }
  };
  
  const toggleMemberExpanded = (memberId) => {
    if (expandedMember === memberId) {
      setExpandedMember(null);
    } else {
      setExpandedMember(memberId);
    }
  };
  
  return (
    <div className="px-4 py-8">
      <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Family Overview</h1>
        <Button 
          variant={showCreateMember ? "outline" : "secondary"}
          className="mt-4 md:mt-0"
          onClick={() => setShowCreateMember(!showCreateMember)}
        >
          {showCreateMember ? (
            <>Cancel</>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Family Member
            </>
          )}
        </Button>
      </div>
      
      {/* Add New Member Form */}
      {showCreateMember && (
        <Card className="mb-8 border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Add New Family Member</CardTitle>
            <CardDescription>
              Create an account for a new family member to join the bank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">First Name</label>
                  <input 
                    type="text" 
                    className="flex w-full h-10 px-3 py-2 text-sm border rounded-md bg-white/5 border-white/20"
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Last Name</label>
                  <input 
                    type="text" 
                    className="flex w-full h-10 px-3 py-2 text-sm border rounded-md bg-white/5 border-white/20"
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email</label>
                <input 
                  type="email" 
                  className="flex w-full h-10 px-3 py-2 text-sm border rounded-md bg-white/5 border-white/20"
                  placeholder="Email address"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Role</label>
                <select className="flex w-full h-10 px-3 py-2 text-sm border rounded-md bg-white/5 border-white/20">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Initial Contribution</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-white/50">$</span>
                  </div>
                  <input 
                    type="number" 
                    className="flex w-full h-10 px-3 py-2 pl-8 text-sm border rounded-md bg-white/5 border-white/20"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Create Member Account</Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Contribution Summary */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <Wallet className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${contributionSummary.totalContributed}</div>
                <p className="text-sm text-white/60">Lifetime total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <Users className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{contributionSummary.activeMembers}</div>
                <p className="text-sm text-white/60">Family members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Current Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{contributionSummary.currentMembers}</div>
                <p className="text-sm text-white/60">Up to date</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Late Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{contributionSummary.lateMembers}</div>
                <p className="text-sm text-white/60">Need follow-up</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Family Members List */}
      <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Family Members</CardTitle>
          <CardDescription>
            All family members participating in the bank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <div 
                key={member.id} 
                className="overflow-hidden border rounded-lg border-white/10 bg-white/5"
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10"
                  onClick={() => toggleMemberExpanded(member.id)}
                >
                  <div className="flex items-center">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-10 h-10 mr-4 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-white">{member.name}</div>
                      <div className="text-sm text-white/60">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="hidden text-right md:block">
                      <div className="font-medium text-white">${member.totalContributed}</div>
                      <div className="text-sm text-white/60">Total Contributed</div>
                    </div>
                    <div className="hidden md:block">
                      {getContributionStatusBadge(member.contributionStatus)}
                    </div>
                    <div className="p-1 rounded-full bg-white/10">
                      {expandedMember === member.id ? (
                        <ChevronUp className="w-5 h-5 text-white/60" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/60" />
                      )}
                    </div>
                  </div>
                </div>
                
                {expandedMember === member.id && (
                  <div className="p-4 border-t border-white/10">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      <div>
                        <div className="text-sm text-white/60">Role</div>
                        <div className="font-medium text-white capitalize">{member.role}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Total Contributed</div>
                        <div className="font-medium text-white">${member.totalContributed}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Active Loans</div>
                        <div className="font-medium text-white">{member.activeLoans}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Contribution Status</div>
                        <div>{getContributionStatusBadge(member.contributionStatus)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Join Date</div>
                        <div className="font-medium text-white">{member.joinDate}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Last Contribution</div>
                        <div className="font-medium text-white">{member.lastContribution}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => console.log('View profile', member.id)}
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => console.log('Add contribution', member.id)}
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Add Contribution
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => console.log('Approve loan', member.id)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Process Loan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyOverviewPage;
