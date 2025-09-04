import { useState, useEffect } from 'react'
import { useView } from '@/hooks/use-view'
import { useAuth } from '@/hooks/use-auth'
import { User, Contribution } from '@/api/entities'
import { useToast } from '@/components/ui/toaster'
import { format } from 'date-fns'
import { Users, DollarSign, TrendingUp, Percent } from 'lucide-react'

// Member card component
const MemberCard = ({ member }) => {
  // Calculate contribution compliance rate
  const complianceRate = member.contribution_stats?.compliance_rate || 0
  const complianceColor = 
    complianceRate >= 90 ? 'text-green-400' :
    complianceRate >= 75 ? 'text-yellow-400' :
    'text-red-400'

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{member.name}</h3>
          <p className="text-sm text-white/70">Member since {format(new Date(member.joined_date || '2023-01-01'), 'MMM yyyy')}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center">
          <span className="text-accent-400 font-bold">
            {member.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-white/70">Weekly Contribution</span>
          <span className="text-white font-semibold">${member.weekly_contribution?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-white/70">Total Contributed</span>
          <span className="text-white font-semibold">${member.total_contributed?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-white/70">Current Loan Balance</span>
          <span className="text-white font-semibold">${member.current_loan_balance?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-white/70">Compliance Rate</span>
          <span className={`font-semibold ${complianceColor}`}>{complianceRate}%</span>
        </div>
      </div>
    </div>
  )
}

// Stats overview component
const StatsOverview = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white">Total Members</h3>
          <span className="p-2 bg-primary-700 rounded-lg">
            <Users className="w-5 h-5 text-accent-400" />
          </span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.total_members || 0}</div>
      </div>
      
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white">Fund Balance</h3>
          <span className="p-2 bg-primary-700 rounded-lg">
            <DollarSign className="w-5 h-5 text-accent-400" />
          </span>
        </div>
        <div className="text-2xl font-bold text-white">${stats.fund_balance?.toLocaleString() || '0'}</div>
      </div>
      
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white">Weekly Inflow</h3>
          <span className="p-2 bg-primary-700 rounded-lg">
            <TrendingUp className="w-5 h-5 text-accent-400" />
          </span>
        </div>
        <div className="text-2xl font-bold text-white">${stats.weekly_inflow?.toLocaleString() || '0'}</div>
      </div>
      
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white">Avg. Compliance</h3>
          <span className="p-2 bg-primary-700 rounded-lg">
            <Percent className="w-5 h-5 text-accent-400" />
          </span>
        </div>
        <div className="text-2xl font-bold text-white">{stats.avg_compliance || 0}%</div>
      </div>
    </div>
  )
}

export default function FamilyOverview() {
  const { isAdminView } = useView()
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [familyStats, setFamilyStats] = useState({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadFamilyData() {
      try {
        // Load all family members using existing API
        const response = await User.getAll()
        if (response.success) {
          setMembers(response.data || [])
          
          // Calculate basic family stats from the member data
          const totalMembers = response.data?.length || 0
          const activeMembers = response.data?.filter(member => member.role !== 'inactive').length || 0
          const totalContributions = response.data?.reduce((sum, member) => 
            sum + parseFloat(member.total_contributed || 0), 0) || 0
          
          setFamilyStats({
            totalMembers,
            activeMembers,
            totalContributions,
            averageContribution: totalMembers > 0 ? totalContributions / totalMembers : 0
          })
        } else {
          throw new Error('Failed to fetch family members')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading family data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load family data',
          variant: 'destructive'
        })
        setLoading(false)
      }
    }

    if (isAdminView) {
      loadFamilyData()
    } else {
      setLoading(false)
    }
  }, [isAdminView, toast])

  if (!isAdminView) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
        <p className="text-white/70">
          You need to have admin privileges and be in admin view to access the family overview.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-bold text-white mb-6">Family Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-white/10"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-white/10"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Family Overview</h1>
      
      {/* Stats Overview */}
      <StatsOverview stats={familyStats} />
      
      {/* Members List */}
      <h2 className="text-xl font-bold text-white mb-4">Family Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.length > 0 ? (
          members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-white/50 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl">
            No family members found
          </div>
        )}
      </div>
    </div>
  )
}
