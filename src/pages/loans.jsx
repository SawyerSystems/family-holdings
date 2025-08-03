import { useState, useEffect } from 'react'
import { useView } from '@/hooks/use-view'
import { useAuth } from '@/hooks/use-auth'
import { Loan, User } from '@/api/entities'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { DollarSign, Clock, AlertCircle, Check } from 'lucide-react'

// Loan card component
const LoanCard = ({ loan }) => {
  const statusColors = {
    pending: 'text-yellow-400',
    approved: 'text-green-400',
    rejected: 'text-red-400',
    paid: 'text-blue-400',
  }
  
  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    approved: <Check className="w-4 h-4" />,
    rejected: <AlertCircle className="w-4 h-4" />,
    paid: <Check className="w-4 h-4" />,
  }

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Loan #{loan.id}</h3>
          <p className="text-sm text-white/70">
            {loan.date ? format(new Date(loan.date), 'MMMM d, yyyy') : 'No date'}
          </p>
        </div>
        <div className={`flex items-center ${statusColors[loan.status] || 'text-white'}`}>
          {statusIcons[loan.status]}
          <span className="ml-1 text-sm capitalize">{loan.status}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-white/70">Amount</span>
          <span className="text-white font-semibold">${loan.amount?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-white/70">Duration</span>
          <span className="text-white font-semibold">{loan.duration_weeks || 0} weeks</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-white/70">Weekly Payment</span>
          <span className="text-white font-semibold">
            ${loan.weekly_payment?.toLocaleString() || ((loan.amount / loan.duration_weeks) || 0).toFixed(2)}
          </span>
        </div>
        
        {loan.status === 'approved' && (
          <div className="flex justify-between">
            <span className="text-white/70">Remaining</span>
            <span className="text-white font-semibold">${loan.remaining_balance?.toLocaleString() || '0'}</span>
          </div>
        )}
      </div>
      
      {loan.status === 'approved' && (
        <Button className="w-full mt-4" size="sm">
          Make Payment
        </Button>
      )}
    </div>
  )
}

// Loan request form
const LoanRequestForm = ({ onSubmit }) => {
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('12')
  const [reason, setReason] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      amount: parseFloat(amount),
      duration_weeks: parseInt(duration),
      reason
    })
  }
  
  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Request a Loan</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Loan Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-white/50" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Duration (Weeks)
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="block w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="4">4 weeks</option>
            <option value="8">8 weeks</option>
            <option value="12">12 weeks</option>
            <option value="16">16 weeks</option>
            <option value="20">20 weeks</option>
            <option value="24">24 weeks</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Reason for Loan
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            className="block w-full px-3 py-2 border border-white/20 rounded-md bg-white/5 text-white focus:ring-primary-500 focus:border-primary-500"
            placeholder="Please explain the reason for your loan request"
            required
          />
        </div>
        
        <Button type="submit" className="w-full">
          Submit Request
        </Button>
      </form>
    </div>
  )
}

export default function Loans() {
  const { user } = useAuth()
  const { isAdminView } = useView()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadLoans() {
      try {
        const loansData = isAdminView 
          ? await Loan.getAll()
          : await Loan.getMine()
        
        setLoans(loansData || [])
        setLoading(false)
      } catch (error) {
        console.error('Error loading loans:', error)
        toast({
          title: 'Error',
          description: 'Failed to load loan data',
          variant: 'destructive'
        })
        setLoading(false)
      }
    }

    loadLoans()
  }, [isAdminView, toast])

  const handleLoanRequest = async (loanData) => {
    try {
      // Submit loan request
      await Loan.create(loanData)
      
      // Reload loans
      const updatedLoans = await Loan.getMine()
      setLoans(updatedLoans)
      
      toast({
        title: 'Success',
        description: 'Loan request submitted successfully'
      })
    } catch (error) {
      console.error('Error submitting loan request:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit loan request',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-bold text-white mb-6">Loans</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-white/10"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        {isAdminView ? 'Loan Management' : 'My Loans'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isAdminView ? (
          // Admin view shows all loans
          loans.length > 0 ? (
            loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-white/50 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl">
              No loans in the system
            </div>
          )
        ) : (
          // Member view shows their loans and a form to request
          <>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))
            ) : (
              <div className="text-center py-10 text-white/50 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl">
                You have no active loans
              </div>
            )}
            
            <LoanRequestForm onSubmit={handleLoanRequest} />
          </>
        )}
      </div>
    </div>
  )
}
