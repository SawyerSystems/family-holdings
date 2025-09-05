import React, { useState } from 'react';
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

const AddContributionModal = ({ isOpen, onClose, user, onContributionAdded }) => {
  const [formData, setFormData] = useState({
    amount: user?.weeklyContribution || 0,
    due_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate the next Monday for due date
  const getNextMonday = () => {
    const today = new Date();
    const nextMonday = new Date(today);
    const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split('T')[0];
  };

  React.useEffect(() => {
    if (isOpen && user) {
      setFormData({
        amount: user.weeklyContribution || 0,
        due_date: getNextMonday(),
        notes: '',
      });
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          notes: formData.notes || null,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create contribution');
      }

      const newContribution = await response.json();
      onContributionAdded(newContribution);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-primary-900 border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Add Contribution</DialogTitle>
          <DialogDescription className="text-white/70">
            Create a new contribution for {user?.name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="bg-primary-800 border-white/20 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date" className="text-white">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
              className="bg-primary-800 border-white/20 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any notes about this contribution..."
              className="bg-primary-800 border-white/20 text-white"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-red-900/30 border border-red-400 text-red-400 text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Contribution'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContributionModal;
