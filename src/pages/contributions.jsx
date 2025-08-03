import { useState, useEffect } from 'react'
import { useView } from '@/hooks/use-view'
import { useAuth } from '@/hooks/use-auth'
import { Contribution, User } from '@/api/entities'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { DollarSign, Check, X, Clock } from 'lucide-react'

// Contribution card component
const ContributionCard = ({ contribution }) => {
  const statusColors = {
    pending: 'text-yellow-400',
    approved: 'text-green-400',
    rejected: 'text-red-400',
    late: 'text-orange-400'
  }
  
  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    approved: <Check className="w-4 h-4" />,
    rejected: <X className="w-4 h-4" />,
    late: <Clock className="w-4 h-4" />
  }

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Week of {format(new Date(contribution.due_date || contribution.date), 'MMM d, yyyy')}
          </h3>
          <p className="text-sm text-white/70">
            {contribution.submitted_date 
              ? `Submitted: ${format(new Date(contribution.submitted_date), 'MMM d, yyyy')}`
              : 'Not yet submitted'}
          </p>
        </div>
        <div className={`flex items-center ${statusColors[contribution.status] || 'text-white'}`}>
          {statusIcons[contribution.status]}
          <span className="ml-1 text-sm capitalize">{contribution.status}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-white/70">Amount</span>
          <span className="text-white font-semibold">${contribution.amount?.toLocaleString() || '0'}</span>
        </div>
        
        {contribution.status === 'late' && (
          <div className="flex justify-between">
            <span className="text-white/70">Late Fee</span>
            <span className="text-white font-semibold">${contribution.late_fee?.toLocaleString() || '0'}</span>
          </div>
        )}
      </div>
      
      {contribution.status === 'pending' && (
        <div className="mt-4 space-y-2">
          <Button className="w-full" size="sm">
            Submit Proof of Payment
          </Button>
        </div>
      )}
      
      {contribution.status === 'late' && (
        <div className="mt-4 space-y-2">
          <Button className="w-full" size="sm">
            Request Extension
          </Button>
          <Button className="w-full" size="sm" variant="secondary">
            Submit Late Payment
          </Button>
        </div>
      )}
    </div>
  )
}

// Contribution submission form
const ContributionSubmissionForm = ({ onSubmit, contributionAmount }) => {
  const [method, setMethod] = useState('bank_transfer')
  const [reference, setReference] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      payment_method: method,
      reference_number: reference,
      amount: contributionAmount
    })
  }
  
  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Submit Contribution</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-white/50" />
            </div>
            <input
              type="text"
              value={contributionAmount}
              className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-md bg-white/5 text-white"
              disabled
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Payment Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="block w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="mobile_money">Mobile Money</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Reference Number / Receipt ID
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="block w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter reference number or receipt ID"
            required
          />
        </div>
        
        <Button type="submit" className="w-full">
          Submit Contribution
        </Button>
      </form>
    </div>
  )
}

export default function Contributions() {
  const { user } = useAuth()
  const { isAdminView } = useView()
  const [contributions, setContributions] = useState([])
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadContributions() {
      try {
        // Get user data for contribution amount
        const userData = await User.me()
        setUserData(userData)
        
        // Get contributions
        const contributionsData = isAdminView 
          ? await Contribution.getAll()
          : await Contribution.getMine()
        
        setContributions(contributionsData || [])
        setLoading(false)
      } catch (error) {
        console.error('Error loading contributions:', error)
        toast({
          title: 'Error',
          description: 'Failed to load contribution data',
          variant: 'destructive'
        })
        setLoading(false)
      }
    }

    loadContributions()
  }, [isAdminView, toast])

  const handleContributionSubmit = async (contributionData) => {
    try {
      // Submit contribution
      await Contribution.submit(contributionData)
      
      // Reload contributions
      const updatedContributions = await Contribution.getMine()
      setContributions(updatedContributions)
      
      toast({
        title: 'Success',
        description: 'Contribution submitted successfully'
      })
    } catch (error) {
      console.error('Error submitting contribution:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit contribution',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-bold text-white mb-6">Contributions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-white/10"></div>
          ))}
        </div>
      </div>
    )
  }

  // Extract contribution amount from user data
  const contributionAmount = userData?.weekly_contribution || 50

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        {isAdminView ? 'Contribution Management' : 'My Contributions'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isAdminView ? (
          // Admin view shows all contributions
          contributions.length > 0 ? (
            contributions.map((contribution) => (
              <ContributionCard key={contribution.id} contribution={contribution} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-white/50 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl">
              No contributions in the system
            </div>
          )
        ) : (
          // Member view shows their contributions and a form to submit
          <>
            {contributions.length > 0 ? (
              contributions.map((contribution) => (
                <ContributionCard key={contribution.id} contribution={contribution} />
              ))
            ) : (
              <div className="text-center py-10 text-white/50 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl">
                No contribution history available
              </div>
            )}
            
            <ContributionSubmissionForm 
              onSubmit={handleContributionSubmit} 
              contributionAmount={contributionAmount}
            />
          </>
        )}
      </div>
    </div>
  )
}
