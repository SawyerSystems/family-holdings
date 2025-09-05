import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProcessLoanModal = ({ isOpen, onClose, user, onLoanProcessed }) => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [action, setAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch pending loans for the user
  useEffect(() => {
    const fetchLoans = async () => {
      if (!isOpen || !user) return;
      
      try {
        const response = await fetch(`http://localhost:8000/loans?user_id=${user.id}&status=pending`);
        if (response.ok) {
          const data = await response.json();
          setLoans(data);
        }
      } catch (err) {
        console.error('Error fetching loans:', err);
      }
    };

    fetchLoans();
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoan || !action) return;

    setLoading(true);
    setError('');

    try {
      const endpoint = action === 'approve' 
        ? `http://localhost:8000/loans/${selectedLoan.id}/approve`
        : `http://localhost:8000/loans/${selectedLoan.id}/reject`;

      const body = action === 'reject' && rejectionReason
        ? { rejection_reason: rejectionReason }
        : {};

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${action} loan`);
      }

      const updatedLoan = await response.json();
      onLoanProcessed(updatedLoan);
      onClose();
      
      // Reset form
      setSelectedLoan(null);
      setAction('');
      setRejectionReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-primary-900 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Process Loan</DialogTitle>
          <DialogDescription className="text-white/70">
            Approve or reject pending loans for {user?.name}.
          </DialogDescription>
        </DialogHeader>
        
        {loans.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            No pending loans found for this user.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Select Loan</Label>
              <Select 
                value={selectedLoan?.id?.toString() || ''} 
                onValueChange={(value) => {
                  const loan = loans.find(l => l.id.toString() === value);
                  setSelectedLoan(loan);
                }}
              >
                <SelectTrigger className="bg-primary-800 border-white/20 text-white">
                  <SelectValue placeholder="Choose a loan to process" />
                </SelectTrigger>
                <SelectContent>
                  {loans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id.toString()}>
                      {formatCurrency(loan.amount)} - {loan.purpose || 'No purpose specified'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLoan && (
              <div className="p-4 rounded bg-primary-800 border border-white/20">
                <h4 className="text-white font-medium mb-2">Loan Details</h4>
                <div className="space-y-1 text-sm text-white/70">
                  <p><span className="font-medium">Amount:</span> {formatCurrency(selectedLoan.amount)}</p>
                  <p><span className="font-medium">Purpose:</span> {selectedLoan.purpose || 'Not specified'}</p>
                  <p><span className="font-medium">Requested:</span> {new Date(selectedLoan.created_at).toLocaleDateString()}</p>
                  {selectedLoan.notes && (
                    <p><span className="font-medium">Notes:</span> {selectedLoan.notes}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white">Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="bg-primary-800 border-white/20 text-white">
                  <SelectValue placeholder="Choose an action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve Loan</SelectItem>
                  <SelectItem value="reject">Reject Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {action === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejection_reason" className="text-white">Rejection Reason</Label>
                <Input
                  id="rejection_reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this loan is being rejected..."
                  className="bg-primary-800 border-white/20 text-white"
                  required
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded bg-red-900/30 border border-red-400 text-red-400 text-sm">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !selectedLoan || !action}
                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {loading ? 'Processing...' : action === 'approve' ? 'Approve Loan' : 'Reject Loan'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProcessLoanModal;
