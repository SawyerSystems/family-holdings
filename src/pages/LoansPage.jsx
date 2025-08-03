import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  CreditCard,
  PlusCircle,
  ArrowRight,
  XCircle
} from 'lucide-react';

const LoansPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Form state
  const [loanAmount, setLoanAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentTerm, setRepaymentTerm] = useState('3 months');
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  
  // Sample data for active loans
  const [activeLoans] = useState([]);
  
  // Sample data for loan history
  const [loanHistory] = useState([
    {
      id: 'l001',
      amount: 500,
      purpose: 'Home repair',
      requestDate: '05/15/2023',
      approvalDate: '05/17/2023',
      repaymentTerm: '3 months',
      status: 'repaid',
      dueDate: '08/17/2023',
      repaidDate: '08/15/2023'
    },
    {
      id: 'l002',
      amount: 300,
      purpose: 'Car maintenance',
      requestDate: '03/10/2023',
      approvalDate: '03/12/2023',
      repaymentTerm: '1 month',
      status: 'repaid',
      dueDate: '04/12/2023',
      repaidDate: '04/10/2023'
    }
  ]);
  
  // Sample data for pending loan requests
  const [pendingRequests] = useState([
    {
      id: 'r001',
      amount: 800,
      purpose: 'Medical expenses',
      requestDate: '09/05/2023',
      repaymentTerm: '6 months',
      status: 'pending'
    }
  ]);
  
  const handleLoanRequest = (e) => {
    e.preventDefault();
    // In a real app, this would submit to an API
    console.log({ loanAmount, purpose, repaymentTerm });
    setIsRequestFormOpen(false);
    
    // Reset form
    setLoanAmount('');
    setPurpose('');
    setRepaymentTerm('3 months');
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'repaid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Repaid
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="px-4 py-8">
      <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Loans</h1>
        <Button 
          variant={isRequestFormOpen ? "outline" : "secondary"}
          className="mt-4 md:mt-0"
          onClick={() => setIsRequestFormOpen(!isRequestFormOpen)}
        >
          {isRequestFormOpen ? (
            <>Cancel Request</>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Request a Loan
            </>
          )}
        </Button>
      </div>
      
      {/* Loan Request Form */}
      {isRequestFormOpen && (
        <Card className="mb-8 border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Request a Loan</CardTitle>
            <CardDescription>
              Fill out the form below to request a new loan. All requests are subject to approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoanRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="w-5 h-5 text-white/50" />
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Briefly describe the purpose of this loan"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="term">Repayment Term</Label>
                <select 
                  id="term"
                  value={repaymentTerm}
                  onChange={(e) => setRepaymentTerm(e.target.value)}
                  className="flex w-full h-10 px-3 py-2 text-sm border rounded-md bg-white/5 border-white/20"
                >
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                </select>
              </div>
              
              <div className="p-4 text-sm rounded-md bg-primary-900/50">
                <p className="font-medium text-white">Terms & Conditions</p>
                <ul className="mt-2 ml-4 space-y-1 list-disc text-white/70">
                  <li>All loans are subject to approval by bank administrators</li>
                  <li>Loan repayments must be made by the due date</li>
                  <li>Loans are interest-free for family members</li>
                  <li>Members must be in good standing (current on contributions)</li>
                </ul>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              onClick={handleLoanRequest}
              className="w-full"
            >
              Submit Request
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Pending Loan Requests */}
      {pendingRequests.length > 0 && (
        <Card className="mb-8 border-0 shadow-md bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Pending Requests</CardTitle>
            <CardDescription>
              Your loan requests awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="p-3 text-sm font-medium text-white/60">Amount</th>
                    <th className="p-3 text-sm font-medium text-white/60">Purpose</th>
                    <th className="p-3 text-sm font-medium text-white/60">Request Date</th>
                    <th className="p-3 text-sm font-medium text-white/60">Term</th>
                    <th className="p-3 text-sm font-medium text-white/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 text-white">${request.amount}</td>
                      <td className="p-3 text-white">{request.purpose}</td>
                      <td className="p-3 text-white">{request.requestDate}</td>
                      <td className="p-3 text-white">{request.repaymentTerm}</td>
                      <td className="p-3">{getStatusBadge(request.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Active Loans */}
      <Card className="mb-8 border-0 shadow-md bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Active Loans</CardTitle>
          <CardDescription>
            Your current outstanding loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeLoans.length > 0 ? (
            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <div 
                  key={loan.id} 
                  className="p-4 border rounded-lg border-white/10 bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 mr-3 rounded-full bg-primary-700">
                        <CreditCard className="w-5 h-5 text-primary-300" />
                      </div>
                      <div>
                        <div className="text-lg font-medium text-white">${loan.amount}</div>
                        <div className="text-sm text-white/60">{loan.purpose}</div>
                      </div>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-4">
                    <div>
                      <div className="text-sm text-white/60">Due Date</div>
                      <div className="text-white">{loan.dueDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Approval Date</div>
                      <div className="text-white">{loan.approvalDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Term</div>
                      <div className="text-white">{loan.repaymentTerm}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Payment Status</div>
                      <div className="text-white">On schedule</div>
                    </div>
                  </div>
                  
                  <div className="flex mt-4 space-x-2">
                    <Button>Make Payment</Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-white/60">
              You don't have any active loans at this time.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Loan History */}
      <Card className="border-0 shadow-md bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Loan History</CardTitle>
          <CardDescription>
            Your past loans and repayments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loanHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="p-3 text-sm font-medium text-white/60">Amount</th>
                    <th className="p-3 text-sm font-medium text-white/60">Purpose</th>
                    <th className="p-3 text-sm font-medium text-white/60">Approval Date</th>
                    <th className="p-3 text-sm font-medium text-white/60">Due Date</th>
                    <th className="p-3 text-sm font-medium text-white/60">Repaid Date</th>
                    <th className="p-3 text-sm font-medium text-white/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loanHistory.map((loan) => (
                    <tr key={loan.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 text-white">${loan.amount}</td>
                      <td className="p-3 text-white">{loan.purpose}</td>
                      <td className="p-3 text-white">{loan.approvalDate}</td>
                      <td className="p-3 text-white">{loan.dueDate}</td>
                      <td className="p-3 text-white">{loan.repaidDate}</td>
                      <td className="p-3">{getStatusBadge(loan.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-white/60">
              You don't have any loan history yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoansPage;
