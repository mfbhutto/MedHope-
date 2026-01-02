'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminHeader from '../../components/AdminHeader';
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
  Calendar,
  Users,
  MoreVertical
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
  const [allCases, setAllCases] = useState<Case[]>([]); // Store all cases
  const [cases, setCases] = useState<Case[]>([]); // Filtered cases for display
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Initial loading
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all' | 'donors'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [togglingDonor, setTogglingDonor] = useState<string | null>(null);
  const [showDonorMenu, setShowDonorMenu] = useState<string | null>(null);
  const [showCaseMenu, setShowCaseMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const caseMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check donor menu
      if (showDonorMenu && menuRef.current && !menuRef.current.contains(target)) {
        setShowDonorMenu(null);
      }
      
      // Check case menu - check if click is outside any case menu
      if (showCaseMenu) {
        const isInsideCaseMenu = target.closest('[data-case-menu]') !== null;
        if (!isInsideCaseMenu) {
          setShowCaseMenu(null);
        }
      }
    };

    if (showDonorMenu || showCaseMenu) {
      // Use a slight delay to ensure onClick handlers fire first
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showDonorMenu, showCaseMenu]);

  useEffect(() => {
    // Check if user is admin or superadmin
    const currentUser = getStoredUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  // Fetch all cases once on mount
  const fetchAllCases = useCallback(async () => {
    if (!user || !user.email) {
      console.log('Cannot fetch cases: user or user.email is missing', { user });
      return;
    }
    
    setLoading(true);
    try {
      // Fetch all cases at once
      const response = await api.get(`/admin/pending-cases?status=all&adminEmail=${encodeURIComponent(user.email)}`);
      const fetchedCases = response.data.cases || [];
      setAllCases(fetchedCases);
      // Initial filter will be applied by the useEffect that watches statusFilter
    } catch (error: any) {
      console.error('Error fetching cases:', error);
      if (error.response?.status === 401) {
        // If unauthorized, redirect to admin login
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch cases');
        setAllCases([]);
        setCases([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  const fetchDonors = useCallback(async () => {
    if (!user || !user.email) {
      return;
    }
    
    setDonorsLoading(true);
    try {
      const response = await api.get(`/admin/donors?adminEmail=${encodeURIComponent(user.email)}`);
      setDonors(response.data.donors || []);
    } catch (error: any) {
      console.error('Error fetching donors:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch donors');
        setDonors([]);
      }
    } finally {
      setDonorsLoading(false);
    }
  }, [user, router]);

  // Fetch all cases once when user is available
  useEffect(() => {
    if (user && user.email && allCases.length === 0 && statusFilter !== 'donors') {
      fetchAllCases();
    }
  }, [user, fetchAllCases, allCases.length, statusFilter]);

  // Filter cases when status filter changes (no API call)
  useEffect(() => {
    if (allCases.length > 0 && statusFilter !== 'donors') {
      if (statusFilter === 'all') {
        setCases(allCases);
      } else {
        setCases(allCases.filter(c => c.status === statusFilter));
      }
    }
  }, [statusFilter, allCases]);

  // Fetch donors when donors tab is selected
  useEffect(() => {
    if (user && user.email && statusFilter === 'donors') {
      fetchDonors();
    }
  }, [statusFilter, user, fetchDonors]);

  const handleApprove = async (caseId: string) => {
    if (!confirm('Are you sure you want to approve this case? It will be visible to donors.')) {
      return;
    }

    setProcessing(caseId);
    try {
      await api.post('/cases/approve', { caseId, action: 'approve', adminEmail: user?.email });
      toast.success('Case approved successfully!');
      
      // Update the case in allCases array
      setAllCases(prevCases => {
        const updated = prevCases.map(c => c._id === caseId ? { ...c, status: 'accepted' } : c);
        // Update filtered cases immediately based on current filter
        if (statusFilter === 'all') {
          setCases(updated);
        } else {
          setCases(updated.filter(c => c.status === statusFilter));
        }
        return updated;
      });
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
      
      // Update the case in allCases array
      setAllCases(prevCases => {
        const updated = prevCases.map(c => c._id === caseId ? { ...c, status: 'rejected' } : c);
        // Update filtered cases immediately based on current filter
        if (statusFilter === 'all') {
          setCases(updated);
        } else {
          setCases(updated.filter(c => c.status === statusFilter));
        }
        return updated;
      });
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

  const handleToggleDonorStatus = async (donorId: string, currentStatus: boolean) => {
    if (!user || !user.email) return;

    setTogglingDonor(donorId);
    try {
      const newStatus = !currentStatus;
      await api.post(`/admin/donors/${donorId}/toggle-status`, {
        adminEmail: user.email,
        isActive: newStatus,
      });
      toast.success(`Donor ${newStatus ? 'activated' : 'deactivated'} successfully`);
      // Update the donor in the list without refetching
      setDonors(prevDonors => 
        prevDonors.map(donor => 
          donor._id === donorId ? { ...donor, isActive: newStatus } : donor
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update donor status');
    } finally {
      setTogglingDonor(null);
      setShowDonorMenu(null);
    }
  };

  if (!user) {
    return null;
  }

  // Calculate counts from allCases (always available, no filtering needed)
  const pendingCount = allCases.filter(c => c.status === 'pending').length;
  const acceptedCount = allCases.filter(c => c.status === 'accepted').length;
  const rejectedCount = allCases.filter(c => c.status === 'rejected').length;
  const totalCount = allCases.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <AdminHeader />
      
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
                <p className="text-gray-600">Review and manage medical cases and donors</p>
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
                  <p className="text-3xl font-bold text-primary">{totalCount}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-primary" />
              </div>
            </motion.div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { value: 'all', label: 'All', icon: Eye },
              { value: 'pending', label: 'Pending', icon: Clock },
              { value: 'accepted', label: 'Approved', icon: CheckCircle },
              { value: 'rejected', label: 'Rejected', icon: XCircle },
              { value: 'donors', label: 'Donors', icon: Users },
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

          {/* Donors Table */}
          {statusFilter === 'donors' && (
            <>
              {donorsLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading donors...</p>
                </div>
              ) : donors.length > 0 ? (
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-primary/20 bg-secondary/30">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">SNO</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone Number</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donors.map((donor, index) => (
                          <motion.tr
                            key={donor._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-soft hover:bg-secondary/20 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{donor.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{donor.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{donor.phone || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleDonorStatus(donor._id, donor.isActive)}
                                disabled={togglingDonor === donor._id}
                                className={`relative inline-flex h-7 w-28 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                  donor.isActive ? 'bg-green-500' : 'bg-gray-300'
                                } ${togglingDonor === donor._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <span
                                  className={`absolute inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform z-10 ${
                                    donor.isActive ? 'translate-x-[5.5rem]' : 'translate-x-1'
                                  }`}
                                />
                                <span className={`absolute left-2 text-xs font-semibold text-white ${
                                  donor.isActive ? 'opacity-100' : 'opacity-0'
                                }`}>
                                  Active
                                </span>
                                <span className={`absolute right-2 text-xs font-semibold text-gray-600 ${
                                  !donor.isActive ? 'opacity-100' : 'opacity-0'
                                }`}>
                                  Disable
                                </span>
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="relative inline-block" ref={menuRef}>
                                <button
                                  onClick={() => setShowDonorMenu(showDonorMenu === donor._id ? null : donor._id)}
                                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                                {showDonorMenu === donor._id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-soft z-10">
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          // View donor details - placeholder
                                          toast('View donor details - coming soon');
                                          setShowDonorMenu(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-secondary transition-colors"
                                      >
                                        View Detail
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          )}

          {/* Cases Table - Show for approved, rejected, and all */}
          {statusFilter !== 'donors' && statusFilter !== 'pending' && (
            <>
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
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-primary/20 bg-secondary/30">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">SNO</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Priority</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Disease</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Need Amount</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.map((caseItem, index) => (
                          <motion.tr
                            key={caseItem._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-soft hover:bg-secondary/20 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{caseItem.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{caseItem.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{caseItem.area}, {caseItem.district}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(caseItem.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(caseItem.priority || 'Medium')}`}>
                                {caseItem.priority || 'Medium'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{caseItem.diseaseName || caseItem.diseaseType}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-primary">
                              PKR {caseItem.estimatedTotalCost.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="relative inline-block" data-case-menu>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowCaseMenu(showCaseMenu === caseItem._id ? null : caseItem._id);
                                  }}
                                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                                {showCaseMenu === caseItem._id && (
                                  <div 
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-soft z-10"
                                    data-case-menu
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="py-1">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const caseId = caseItem._id;
                                          setShowCaseMenu(null);
                                          // Use setTimeout to ensure menu closes before navigation
                                          setTimeout(() => {
                                            router.push(`/superadmin/pages/case-details/${caseId}`);
                                          }, 0);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-secondary transition-colors"
                                      >
                                        View Detail
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Cases Table - Pending cases (also in table format) */}
          {statusFilter === 'pending' && (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading cases...</p>
                </div>
              ) : cases.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No pending cases found</p>
                </div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-primary/20 bg-secondary/30">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">SNO</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Priority</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Disease</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Need Amount</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.map((caseItem, index) => (
                          <motion.tr
                            key={caseItem._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-soft hover:bg-secondary/20 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{caseItem.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{caseItem.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{caseItem.area}, {caseItem.district}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(caseItem.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(caseItem.priority || 'Medium')}`}>
                                {caseItem.priority || 'Medium'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{caseItem.diseaseName || caseItem.diseaseType}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-primary">
                              PKR {caseItem.estimatedTotalCost.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="relative inline-block" data-case-menu>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowCaseMenu(showCaseMenu === caseItem._id ? null : caseItem._id);
                                  }}
                                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                                {showCaseMenu === caseItem._id && (
                                  <div 
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-soft z-10"
                                    data-case-menu
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="py-1">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const caseId = caseItem._id;
                                          setShowCaseMenu(null);
                                          setTimeout(() => {
                                            router.push(`/superadmin/pages/case-details/${caseId}`);
                                          }, 0);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-secondary transition-colors"
                                      >
                                        View Detail
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

