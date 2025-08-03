import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Sample data (would come from API in a real app)
  const [stats] = useState({
    weeklyContribution: 50,
    totalContributions: 650,
    availableBalance: 2500,
    activeLoans: 0,
    nextContributionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    recentActivity: [
      { id: 1, type: 'contribution', amount: 50, date: '2023-09-25', status: 'completed' },
      { id: 2, type: 'contribution', amount: 50, date: '2023-09-18', status: 'completed' },
      { id: 3, type: 'loan_payment', amount: 100, date: '2023-09-10', status: 'completed' },
    ]
  });
  
  return (
    <div className="px-4 py-8">
      <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="mt-2 md:mt-0">
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary-500/20 text-secondary-300">
            <Calendar className="w-4 h-4 mr-2" />
            Next contribution: {stats.nextContributionDate}
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
                <div className="text-2xl font-bold text-white">${stats.weeklyContribution}</div>
                <p className="text-sm text-white/60">Due every Sunday</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Contributions */}
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <ArrowUpCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${stats.totalContributions}</div>
                <p className="text-sm text-white/60">Lifetime total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Bank Balance (Admin only) */}
        {isAdmin && (
          <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-white/80">Bank Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="p-2 mr-4 rounded-full bg-primary-700">
                  <DollarSign className="w-5 h-5 text-secondary-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">${stats.availableBalance}</div>
                  <p className="text-sm text-white/60">Available for loans</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Active Loans */}
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/80">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-4 rounded-full bg-primary-700">
                <CreditCard className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${stats.activeLoans}</div>
                <p className="text-sm text-white/60">No active loans</p>
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
          {stats.recentActivity.length > 0 ? (
            <div className="divide-y divide-white/10">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <div className={`p-2 mr-4 rounded-full ${
                      activity.type === 'contribution' ? 'bg-green-900/50' : 'bg-blue-900/50'
                    }`}>
                      {activity.type === 'contribution' ? (
                        <ArrowUpCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {activity.type === 'contribution' ? 'Weekly Contribution' : 'Loan Payment'}
                      </div>
                      <div className="text-sm text-white/60">{activity.date}</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-white">${activity.amount}</div>
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
