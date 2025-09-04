import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react';
import { User, Contribution, Stats } from '@/api/entities';

const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Real data from API
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // Load user profile
        const userProfile = await User.me();
        setUserData(userProfile);
        
        // Load stats
        const userStats = await Stats.me();
        setStats(userStats);
        
        // Load contributions
        const userContributions = await Contribution.getMine();
        setContributions(userContributions);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="animate-pulse">
          <div className="w-48 h-8 mb-8 rounded bg-white/10"></div>
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded bg-white/10"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Format the data for display
  const weeklyContribution = userData?.weekly_contribution ? Number(userData.weekly_contribution) : 0;
  const totalContributed = userData?.total_contributed ? Number(userData.total_contributed) : 0;
  const currentBalance = userData?.current_loan_balance ? Number(userData.current_loan_balance) : 0;
  const borrowingLimit = userData?.borrowing_limit ? Number(userData.borrowing_limit) : 0;
  const deficiency = stats?.deficiency ? Number(stats.deficiency) : 0;
  const expectedTotal = stats?.expected_total ? Number(stats.expected_total) : 0;
  const weeksActive = stats?.weeks_active || 0;
  
  return (
    <div className="px-4 py-8">
      <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="mt-2 md:mt-0">
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary-500/20 text-secondary-300">
            <Calendar className="w-4 h-4 mr-2" />
            {weeksActive > 0 ? `Active for ${weeksActive} weeks` : 'Just started'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 xl:grid-cols-4">
        {/* Weekly Contribution */}
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Weekly Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <DollarSign className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${weeklyContribution}</div>
                <p className="text-sm text-white/60">Due every Sunday</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Contributions */}
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Total Contributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <ArrowUpCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${totalContributed}</div>
                <p className="text-sm text-white/60">Lifetime total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Expected Total */}
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Expected Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${expectedTotal}</div>
                <p className="text-sm text-white/60">{weeksActive} weeks active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Deficiency */}
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Deficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <ArrowDownCircle className={`w-5 h-5 ${deficiency > 0 ? 'text-red-400' : 'text-green-400'}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${deficiency > 0 ? 'text-red-400' : 'text-white'}`}>
                  ${deficiency}
                </div>
                <p className="text-sm text-white/60">{deficiency > 0 ? 'Behind schedule' : 'All caught up!'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Bank Balance (Admin only) */}
        {isAdmin && (
          <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white/80">Borrowing Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="p-2 mr-4 rounded-full bg-primary-700">
                  <DollarSign className="w-5 h-5 text-secondary-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">${borrowingLimit}</div>
                  <p className="text-sm text-white/60">Available for loans</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Active Loans */}
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Loan Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <CreditCard className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${currentBalance}</div>
                <p className="text-sm text-white/60">{currentBalance > 0 ? 'Outstanding balance' : 'No active loans'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {contributions.length > 0 ? (
            <div className="divide-y divide-white/10">
              {contributions.slice(0, 5).map((contribution) => (
                <div key={contribution.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <div className={`p-2 mr-4 rounded-full ${
                      contribution.status === 'paid' ? 'bg-green-900/50' : 'bg-yellow-900/50'
                    }`}>
                      {contribution.status === 'paid' ? (
                        <ArrowUpCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Calendar className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        Weekly Contribution - Week {contribution.period_week}
                      </div>
                      <div className="text-sm text-white/60">
                        Due: {new Date(contribution.due_date).toLocaleDateString()}
                        {contribution.paid_at ? ` • Paid: ${new Date(contribution.paid_at).toLocaleDateString()}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    contribution.status === 'paid' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    ${contribution.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-white/60">No recent activity to display</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
