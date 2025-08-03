import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';

const ContributionsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sample contribution data
  const [currentContribution] = useState({
    id: 'c123',
    status: 'pending',
    amount: 50,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    period: 'Week 32, 2023'
  });
  
  // Sample history data
  const [contributionHistory] = useState([
    { 
      id: 'c122', 
      status: 'completed', 
      amount: 50, 
      date: '08/05/2023', 
      period: 'Week 31, 2023',
      method: 'Bank Transfer'
    },
    { 
      id: 'c121', 
      status: 'completed', 
      amount: 50, 
      date: '07/29/2023', 
      period: 'Week 30, 2023',
      method: 'Cash'
    },
    { 
      id: 'c120', 
      status: 'late', 
      amount: 50, 
      date: '07/24/2023', 
      period: 'Week 29, 2023',
      method: 'Bank Transfer',
      lateBy: '2 days'
    },
    { 
      id: 'c119', 
      status: 'missed', 
      amount: 50, 
      date: 'N/A', 
      period: 'Week 28, 2023',
      method: 'N/A'
    },
  ]);
  
  const filteredHistory = contributionHistory.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/30 text-orange-400">
            <Clock className="w-3 h-3 mr-1" />
            Late
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Missed
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="px-4 py-8">
      <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Contributions</h1>
        {isAdmin && (
          <Button 
            variant="secondary" 
            className="mt-4 md:mt-0"
            onClick={() => console.log('Manual contribution entry')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Record Manual Contribution
          </Button>
        )}
      </div>
      
      {/* Current Period Card */}
      <Card className="mb-8 border-0 shadow-md bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Current Period</CardTitle>
          <CardDescription>
            Your contribution for {currentContribution.period}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center p-3 rounded-lg bg-white/5">
              <div className="p-2 mr-3 rounded-full bg-primary-700">
                <DollarSign className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <div className="text-sm text-white/60">Amount</div>
                <div className="text-xl font-bold text-white">${currentContribution.amount}</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 rounded-lg bg-white/5">
              <div className="p-2 mr-3 rounded-full bg-primary-700">
                <Calendar className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <div className="text-sm text-white/60">Due Date</div>
                <div className="text-xl font-medium text-white">{currentContribution.dueDate}</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 rounded-lg bg-white/5">
              <div className="p-2 mr-3 rounded-full bg-primary-700">
                <Clock className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <div className="text-sm text-white/60">Status</div>
                <div className="mt-1">{getStatusBadge(currentContribution.status)}</div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button 
            className="flex-1"
            onClick={() => console.log('Submit payment')}
          >
            Submit Payment
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => console.log('Request extension')}
          >
            Request Extension
          </Button>
        </CardFooter>
      </Card>
      
      {/* Contribution History */}
      <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-white">Contribution History</CardTitle>
            <CardDescription>
              Your past contributions
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filter
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardHeader>
        
        {showFilters && (
          <div className="px-6 pb-2">
            <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-white/5">
              <Button 
                size="sm" 
                variant={filter === 'all' ? 'secondary' : 'ghost'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button 
                size="sm" 
                variant={filter === 'completed' ? 'secondary' : 'ghost'}
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
              <Button 
                size="sm" 
                variant={filter === 'late' ? 'secondary' : 'ghost'}
                onClick={() => setFilter('late')}
              >
                Late
              </Button>
              <Button 
                size="sm" 
                variant={filter === 'missed' ? 'secondary' : 'ghost'}
                onClick={() => setFilter('missed')}
              >
                Missed
              </Button>
            </div>
          </div>
        )}
        
        <CardContent>
          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="p-3 text-sm font-medium text-white/60">Period</th>
                    <th className="p-3 text-sm font-medium text-white/60">Status</th>
                    <th className="p-3 text-sm font-medium text-white/60">Amount</th>
                    <th className="p-3 text-sm font-medium text-white/60">Date</th>
                    <th className="p-3 text-sm font-medium text-white/60">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 text-white">{item.period}</td>
                      <td className="p-3">{getStatusBadge(item.status)}</td>
                      <td className="p-3 text-white">${item.amount}</td>
                      <td className="p-3 text-white">{item.date}</td>
                      <td className="p-3 text-white">{item.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-white/60">
              No contribution history matching your filter
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributionsPage;
