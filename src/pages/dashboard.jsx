import { useEffect, useState } from 'react'
import { useView } from '@/hooks/use-view'
import { useAuth } from '@/hooks/use-auth'
import { User, Contribution, Stats } from '@/api/entities'
import { format } from 'date-fns'
import { DollarSign, ArrowUp, ArrowDown, Users } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'

// Dashboard card component
const StatsCard = ({ title, value, icon, trend, trendValue }) => {
  const Icon = icon
  const isTrendUp = trend === 'up'

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="p-2 bg-primary-700 rounded-lg">
          <Icon className="w-5 h-5 text-accent-400" />
        </span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      {trendValue && (
        <div className={`flex items-center ${isTrendUp ? 'text-green-400' : 'text-red-400'}`}>
          {isTrendUp ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
          <span className="text-sm">{trendValue}</span>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { isAdminView } = useView()
  const [userData, setUserData] = useState(null)
  const [contributionData, setContributionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboardData() {
      try {
  // Load core user profile
  const userData = await User.me()
  setUserData(userData)

  // Load stats (expected/deficiency etc.)
  const stats = await Stats.me()
  setUserData(prev => ({ ...prev, stats }))

        // Load contributions
        const contributions = isAdminView 
          ? await Contribution.getAll()
          : await Contribution.getMine()
        
        setContributionData(contributions)
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        })
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [isAdminView, toast])

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-white/10"></div>
          ))}
        </div>
        <div className="mt-8 h-64 rounded-xl bg-white/10"></div>
      </div>
    )
  }

  // Format data for display
  const formattedBalance = userData?.current_loan_balance 
    ? `$${userData.current_loan_balance.toLocaleString()}` 
    : '$0'
  
  const contributionAmount = userData?.weekly_contribution 
    ? `$${userData.weekly_contribution.toLocaleString()}`
    : '$50'
    
  const totalContributed = userData?.total_contributed 
    ? `$${userData.total_contributed.toLocaleString()}`
    : '$0'
    
  const borrowingLimit = userData?.borrowing_limit
    ? `$${userData.borrowing_limit.toLocaleString()}`
    : '$0'
  const deficiency = userData?.stats?.deficiency ? `$${Number(userData.stats.deficiency).toLocaleString()}` : '$0'
  const expected = userData?.stats?.expected_total ? `$${Number(userData.stats.expected_total).toLocaleString()}` : '$0'

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        {isAdminView ? 'Admin Dashboard' : 'My Dashboard'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Current Balance" 
          value={formattedBalance}
          icon={DollarSign}
        />
        
        <StatsCard 
          title="Weekly Contribution" 
          value={contributionAmount}
          icon={DollarSign}
        />
        
        <StatsCard 
          title="Total Contributed" 
          value={totalContributed}
          icon={DollarSign}
          trend="up"
          trendValue="Since joining"
        />
        
        <StatsCard 
          title="Borrowing Limit" 
          value={borrowingLimit}
          icon={Users}
        />
        <StatsCard 
          title="Expected (Total)" 
          value={expected}
          icon={DollarSign}
        />
        <StatsCard 
          title="Deficiency" 
          value={deficiency}
          icon={DollarSign}
        />
      </div>
      
      <div className="mt-8">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          
          {contributionData && contributionData.length > 0 ? (
            <div className="space-y-4">
              {contributionData.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="font-medium text-white">
                      {item.type === 'payment' ? 'Loan Payment' : 'Weekly Contribution'}
                    </div>
                    <div className="text-sm text-white/70">
                      {format(new Date(item.created_at || item.date), 'MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className={`font-semibold ${item.type === 'payment' ? 'text-green-400' : 'text-accent-400'}`}>
                    {item.type === 'payment' ? '-' : '+'}{item.amount ? `$${item.amount}` : '$0'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/50">
              No recent activity to display
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
