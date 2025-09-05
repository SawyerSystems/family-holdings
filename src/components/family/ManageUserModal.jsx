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
import { User } from '@/api/entities';

const ManageUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'member',
    weekly_contribution: 0,
    borrowing_limit: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      console.log('ManageUserModal - User data:', user);
      setFormData({
        full_name: user.name || '',
        email: '', // Start with empty email since most users don't have one
        role: user.role || 'member',
        weekly_contribution: user.weeklyContribution || 0,
        borrowing_limit: user.borrowingLimit || 0,
      });
      setError(''); // Clear any previous errors
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          weekly_contribution: parseFloat(formData.weekly_contribution),
          borrowing_limit: parseFloat(formData.borrowing_limit),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      onUserUpdated(updatedUser);
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
          <DialogTitle className="text-white">Manage User</DialogTitle>
          <DialogDescription className="text-white/70">
            Update user information and settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-white">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="bg-primary-800 border-white/20 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="bg-primary-800 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger className="bg-primary-800 border-white/20 text-white">
                <SelectValue placeholder="Select a role">
                  {formData.role === 'admin' ? 'Admin' : 'Member'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly_contribution" className="text-white">Weekly Contribution ($)</Label>
            <Input
              id="weekly_contribution"
              type="number"
              step="0.01"
              min="0"
              value={formData.weekly_contribution}
              onChange={(e) => handleInputChange('weekly_contribution', e.target.value)}
              className="bg-primary-800 border-white/20 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrowing_limit" className="text-white">Borrowing Limit ($)</Label>
            <Input
              id="borrowing_limit"
              type="number"
              step="0.01"
              min="0"
              value={formData.borrowing_limit}
              onChange={(e) => handleInputChange('borrowing_limit', e.target.value)}
              className="bg-primary-800 border-white/20 text-white"
              required
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
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManageUserModal;
