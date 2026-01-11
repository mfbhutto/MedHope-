'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VolunteerHeader from '../components/VolunteerHeader';
import { getStoredUser } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  MapPin, 
  DollarSign,
  User,
  AlertCircle
} from 'lucide-react';

interface Case {
  _id: string;
  caseNumber: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  area: string;
  diseaseType: string;
  diseaseName: string;
  description: string;
  hospitalName: string;
  doctorName: string;
  amountNeeded: number;
  estimatedTotalCost: number;
  priority: string;
  status: string;
  volunteerApprovalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function VolunteerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);

  useEffect(() => {
    // Get user from localStorage
    const currentUser = getStoredUser();
    
    // Check authentication - if no user, redirect to login
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    // Check if user is a volunteer
    if (currentUser.role !== 'volunteer') {
      // If not a volunteer, redirect to appropriate profile
      if (currentUser.role === 'donor') {
        router.push('/medhope/pages/donorprofile');
      } else if (currentUser.role === 'accepter') {
        router.push('/medhope/pages/needyprofile');
      } else {
        router.push('/auth/login');
      }
      return;
    }

    setUser(currentUser);
    fetchCases();
  }, [router]);

  const fetchCases = async () => {
    const currentUser = getStoredUser();
    if (!currentUser || !currentUser.email) return;

    setLoading(true);
    try {
      const response = await api.get(`/volunteer/cases?volunteerEmail=${encodeURIComponent(currentUser.email)}`);
      setCases(response.data.cases || []);
    } catch (error: any) {
      console.error('Error fetching cases:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch assigned cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (caseId: string) => {
    if (!confirm('Are you sure you want to approve this case? It will be sent to admin for final approval.')) {
      return;
    }

    if (!user || !user.email) return;

    setProcessing(caseId);
    try {
      await api.post('/volunteer/cases/approve', { 
        caseId, 
        action: 'approve', 
        volunteerEmail: user.email 
      });
      toast.success('Case approved successfully!');
      // Refresh cases
      fetchCases();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve case');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setRejectionReasons([]);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedCaseId || !user || !user.email) return;

    if (rejectionReasons.length === 0) {
      toast.error('Please select at least one reason for rejection');
      return;
    }

    setProcessing(selectedCaseId);
    try {
      await api.post('/volunteer/cases/approve', { 
        caseId: selectedCaseId, 
        action: 'reject', 
        volunteerEmail: user.email,
        rejectionReasons: rejectionReasons
      });
      toast.success('Case rejected');
      setShowRejectModal(false);
      setSelectedCaseId(null);
      setRejectionReasons([]);
      // Refresh cases
      fetchCases();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject case');
    } finally {
      setProcessing(null);
    }
  };

  const toggleRejectionReason = (reason: string) => {
    setRejectionReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      High: 'bg-red-100 text-red-700 border-red-200',
      Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Low: 'bg-green-100 text-green-700 border-green-200',
    };
    return badges[priority as keyof typeof badges] || badges.Medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
        <VolunteerHeader />
        <div className="flex items-center justify-center h-screen pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pendingCases = cases.filter(c => c.volunteerApprovalStatus === 'pending');
  const approvedCases = cases.filter(c => c.volunteerApprovalStatus === 'approved');
  const rejectedCases = cases.filter(c => c.volunteerApprovalStatus === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <VolunteerHeader />
      
      <div className="pt-32 pb-20 px-4">
        <div className="section-container max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="heading-lg">Volunteer Dashboard</h1>
                <p className="text-gray-600">Review and verify cases assigned to you</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Cases</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingCases.length}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved Cases</p>
                  <p className="text-3xl font-bold text-green-600">{approvedCases.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected Cases</p>
                  <p className="text-3xl font-bold text-red-600">{rejectedCases.length}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cases</p>
                  <p className="text-3xl font-bold text-primary">{cases.length}</p>
                </div>
                <FileText className="w-10 h-10 text-primary" />
              </div>
            </motion.div>
          </div>

          {/* Cases List */}
          {cases.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No cases assigned to you yet</p>
              <p className="text-gray-500 text-sm mt-2">Admin will assign cases to you for verification</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((caseItem, index) => (
                <motion.div
                  key={caseItem._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {caseItem.caseNumber}
                          </h3>
                          <p className="text-gray-600">{caseItem.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(caseItem.priority)}`}>
                            {caseItem.priority}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(caseItem.volunteerApprovalStatus)}`}>
                            {caseItem.volunteerApprovalStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="text-gray-900 font-medium">{caseItem.area}, {caseItem.district}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Disease</p>
                            <p className="text-gray-900 font-medium">{caseItem.diseaseName}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Amount Needed</p>
                            <p className="text-gray-900 font-medium">PKR {caseItem.amountNeeded.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <User className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Hospital</p>
                            <p className="text-gray-900 font-medium">{caseItem.hospitalName}</p>
                          </div>
                        </div>
                      </div>

                      {caseItem.description && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-1">Description</p>
                          <p className="text-gray-700">{caseItem.description}</p>
                        </div>
                      )}
                    </div>

                    {caseItem.volunteerApprovalStatus === 'pending' && (
                      <div className="flex flex-col gap-2 md:min-w-[200px]">
                        <button
                          onClick={() => handleApprove(caseItem._id)}
                          disabled={processing === caseItem._id}
                          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {processing === caseItem._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectClick(caseItem._id)}
                          disabled={processing === caseItem._id}
                          className="btn-outline border-red-500 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Case</h3>
            <p className="text-gray-600 mb-6">Please select the reason(s) for rejection:</p>
            
            <div className="space-y-3 mb-6">
              {[
                'Personal information issue',
                'Financial information issue',
                'Disease information issue'
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={rejectionReasons.includes(reason)}
                    onChange={() => toggleRejectionReason(reason)}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <span className="ml-3 text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedCaseId(null);
                  setRejectionReasons([]);
                }}
                className="flex-1 btn-outline"
                disabled={processing === selectedCaseId}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={processing === selectedCaseId || rejectionReasons.length === 0}
                className="flex-1 btn-outline border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === selectedCaseId ? 'Processing...' : 'Reject Case'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

