'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/app/medhope/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getStoredUser } from '@/lib/auth';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  AlertCircle,
  DollarSign,
  MapPin,
  Heart,
  Calendar
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
  estimatedTotalCost: number;
  priority: string;
  status: string;
  isZakatEligible: boolean;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    const currentUser = getStoredUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/auth/admin-login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const fetchCases = useCallback(async () => {
    if (!user || !user.email) {
      console.log('Cannot fetch cases: user or user.email is missing', { user });
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/admin/pending-cases?status=${statusFilter}&adminEmail=${encodeURIComponent(user.email)}`);
      setCases(response.data.cases || []);
    } catch (error: any) {
      console.error('Error fetching cases:', error);
      if (error.response?.status === 401) {
        // If unauthorized, redirect to admin login
        toast.error('Session expired. Please login again.');
        router.push('/auth/admin-login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch cases');
        setCases([]);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, user, router]);

  useEffect(() => {
    if (user && user.email) {
      fetchCases();
    }
  }, [fetchCases]);

  const handleApprove = async (caseId: string) => {
    if (!confirm('Are you sure you want to approve this case? It will be visible to donors.')) {
      return;
    }

    setProcessing(caseId);
    try {
      await api.post('/cases/approve', { caseId, action: 'approve', adminEmail: user?.email });
      toast.success('Case approved successfully!');
      fetchCases();
      setSelectedCase(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve case');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (caseId: string) => {
    if (!confirm('Are you sure you want to reject this case? This action cannot be undone.')) {
      return;
    }

    setProcessing(caseId);
    try {
      await api.post('/cases/approve', { caseId, action: 'reject', adminEmail: user?.email });
      toast.success('Case rejected');
      fetchCases();
      setSelectedCase(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject case');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      accepted: 'bg-green-100 text-green-700 border-green-200',
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

  if (!user) {
    return null;
  }

  const pendingCount = cases.filter(c => c.status === 'pending').length;
  const acceptedCount = cases.filter(c => c.status === 'accepted').length;
  const rejectedCount = cases.filter(c => c.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="section-container max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="heading-lg">Superadmin Dashboard</h1>
                <p className="text-gray-600">Review and manage medical cases</p>
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
                  <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
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
                  <p className="text-3xl font-bold text-green-600">{acceptedCount}</p>
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
                  <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
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
                <AlertCircle className="w-10 h-10 text-primary" />
              </div>
            </motion.div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { value: 'pending', label: 'Pending', icon: Clock },
              { value: 'accepted', label: 'Approved', icon: CheckCircle },
              { value: 'rejected', label: 'Rejected', icon: XCircle },
              { value: 'all', label: 'All', icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    statusFilter === tab.value
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-white text-gray-700 hover:bg-secondary border border-gray-soft'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Cases List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cases...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No {statusFilter === 'all' ? '' : statusFilter} cases found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((caseItem, index) => (
                <motion.div
                  key={caseItem._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6 hover:shadow-large transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-primary">
                              Case #{caseItem.caseNumber}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(caseItem.status)}`}>
                              {caseItem.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(caseItem.priority)}`}>
                              {caseItem.priority} Priority
                            </span>
                            {caseItem.isZakatEligible && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                Zakat Eligible
                              </span>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                            <div>
                              <p className="font-semibold text-dark mb-1">{caseItem.name}</p>
                              <p className="text-gray-600">{caseItem.email}</p>
                              <p className="text-gray-600">{caseItem.phone}</p>
                            </div>
                            <div>
                              <p className="flex items-center gap-2 text-gray-600 mb-1">
                                <MapPin className="w-4 h-4" />
                                {caseItem.area}, {caseItem.district}
                              </p>
                              <p className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {new Date(caseItem.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                            <p className="text-sm font-semibold text-dark mb-1">{caseItem.diseaseName || caseItem.diseaseType}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{caseItem.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Hospital: {caseItem.hospitalName}</span>
                              <span>Doctor: {caseItem.doctorName}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            <span className="text-xl font-bold text-primary">
                              PKR {caseItem.estimatedTotalCost.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:w-auto w-full">
                      {caseItem.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(caseItem._id)}
                            disabled={processing === caseItem._id}
                            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {processing === caseItem._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(caseItem._id)}
                            disabled={processing === caseItem._id}
                            className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedCase(selectedCase?._id === caseItem._id ? null : caseItem)}
                        className="btn-outline flex items-center justify-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        {selectedCase?._id === caseItem._id ? 'Hide' : 'View'} Details
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedCase?._id === caseItem._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-soft"
                    >
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-dark mb-2">Case Information</h4>
                          <div className="space-y-1 text-gray-600">
                            <p><strong>Disease Type:</strong> {caseItem.diseaseType}</p>
                            <p><strong>Disease Name:</strong> {caseItem.diseaseName}</p>
                            <p><strong>Description:</strong> {caseItem.description}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-dark mb-2">Medical Details</h4>
                          <div className="space-y-1 text-gray-600">
                            <p><strong>Hospital:</strong> {caseItem.hospitalName}</p>
                            <p><strong>Doctor:</strong> {caseItem.doctorName}</p>
                            <p><strong>Amount Needed:</strong> PKR {caseItem.estimatedTotalCost.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

