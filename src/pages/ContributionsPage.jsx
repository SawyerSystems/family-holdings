import React, { useState, useEffect } from 'react';
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
import { Contribution } from '@/api/entities';

const ContributionsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadContributions() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await Contribution.getMine();
        setContributions(data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading contributions:', err);
        setError('Failed to load contributions');
        setLoading(false);
      }
    }
    
    loadContributions();
  }, []);
  
  // Find current period contribution (pending or most recent)
  const currentContribution = contributions.find(c => c.status === 'pending') || 
    contributions.sort((a, b) => new Date(b.due_date) - new Date(a.due_date))[0];
  
  // Filter historical contributions
  const filteredHistory = contributions
    .filter(item => {
      if (filter === 'all') return true;
      return item.status === filter;
    })
    .sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
  
  // Helper functions to format API data
  const formatPeriod = (contribution) => {
    return `Week ${contribution.period_week}, ${contribution.period_year}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const formatDisplayDate = (contribution) => {
    if (contribution.paid_at) {
      return formatDate(contribution.paid_at);
    }
    return contribution.status === 'completed' ? formatDate(contribution.due_date) : 'N/A';
  };

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
      
      {loading ? (
        <div className="space-y-6">
          {/* Loading skeleton for current period */}
          <Card className="mb-8 border-0 shadow-md bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <div className="w-48 h-6 mb-2 rounded bg-white/10 animate-pulse"></div>
              <div className="w-32 h-4 rounded bg-white/10 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 mr-3 rounded-full bg-white/10 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-16 h-3 mb-1 rounded bg-white/10 animate-pulse"></div>
                        <div className="w-20 h-5 rounded bg-white/10 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Loading skeleton for history */}
          <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <div className="w-48 h-6 mb-2 rounded bg-white/10 animate-pulse"></div>
              <div className="w-32 h-4 rounded bg-white/10 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-12 rounded bg-white/5 animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardContent className="py-8 text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="mb-2 text-lg font-semibold text-white">Error Loading Contributions</h3>
            <p className="text-white/60">{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Period Card */}
          {currentContribution && (
            <Card className="mb-8 border-0 shadow-md bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Current Period</CardTitle>
                <CardDescription>
                  Your contribution for {formatPeriod(currentContribution)}
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
                      <div className="text-xl font-medium text-white">{formatDate(currentContribution.due_date)}</div>
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
              {currentContribution.status === 'pending' && (
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
              )}
            </Card>
          )}
          
          {!currentContribution && contributions.length === 0 && (
            <Card className="mb-8 border-0 shadow-md bg-white/5 backdrop-blur-sm">
              <CardContent className="py-8 text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary-300" />
                <h3 className="mb-2 text-lg font-semibold text-white">No Contributions Yet</h3>
                <p className="text-white/60">You don't have any contributions assigned yet.</p>
              </CardContent>
            </Card>
          )}
          
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
                    variant={filter === 'pending' ? 'secondary' : 'ghost'}
                    onClick={() => setFilter('pending')}
                  >
                    Pending
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
                          <td className="p-3 text-white">{formatPeriod(item)}</td>
                          <td className="p-3">{getStatusBadge(item.status)}</td>
                          <td className="p-3 text-white">${item.amount}</td>
                          <td className="p-3 text-white">{formatDisplayDate(item)}</td>
                          <td className="p-3 text-white">{item.method || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-white/60">
                  {contributions.length === 0 
                    ? "No contribution history available"
                    : "No contribution history matching your filter"
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ContributionsPage;
