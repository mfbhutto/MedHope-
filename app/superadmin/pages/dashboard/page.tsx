'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminHeader from '../../components/AdminHeader';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getStoredUser } from '@/lib/auth';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
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
  MoreVertical,
  UserCheck,
  X,
  UserPlus,
  User,
  Search,
  Mail,
  Phone
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
  volunteerId?: string;
  volunteerApprovalStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allCases, setAllCases] = useState<Case[]>([]); // Store all cases
  const [cases, setCases] = useState<Case[]>([]); // Filtered cases for display
  const [donors, setDonors] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Initial loading
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all' | 'donors' | 'volunteers' | 'verified-by-volunteer'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [togglingDonor, setTogglingDonor] = useState<string | null>(null);
  const [togglingVolunteer, setTogglingVolunteer] = useState<string | null>(null);
  const [showDonorMenu, setShowDonorMenu] = useState<string | null>(null);
  const [showVolunteerMenu, setShowVolunteerMenu] = useState<string | null>(null);
  const [showCaseMenu, setShowCaseMenu] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [assigningVolunteers, setAssigningVolunteers] = useState<any[]>([]);
  const [assigningVolunteersLoading, setAssigningVolunteersLoading] = useState(false);
  const [assigningCase, setAssigningCase] = useState<string | null>(null);
  const [volunteerSearchQuery, setVolunteerSearchQuery] = useState('');
  const [casesByStatusView, setCasesByStatusView] = useState<'weekly' | 'monthly'>('weekly');
  const menuRef = useRef<HTMLDivElement>(null);
  const volunteerMenuRef = useRef<HTMLDivElement>(null);
  const caseMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check donor menu
      if (showDonorMenu && menuRef.current && !menuRef.current.contains(target)) {
        setShowDonorMenu(null);
      }
      
      // Check volunteer menu
      if (showVolunteerMenu && volunteerMenuRef.current && !volunteerMenuRef.current.contains(target)) {
        setShowVolunteerMenu(null);
      }
      
      // Check case menu - check if click is outside any case menu
      if (showCaseMenu) {
        const isInsideCaseMenu = target.closest('[data-case-menu]') !== null;
        if (!isInsideCaseMenu) {
          setShowCaseMenu(null);
        }
      }
    };

    if (showDonorMenu || showVolunteerMenu || showCaseMenu) {
      // Use a slight delay to ensure onClick handlers fire first
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showDonorMenu, showVolunteerMenu, showCaseMenu]);

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

  const fetchVolunteers = useCallback(async () => {
    if (!user || !user.email) {
      return;
    }
    
    setVolunteersLoading(true);
    try {
      const response = await api.get(`/admin/volunteers?adminEmail=${encodeURIComponent(user.email)}`);
      setVolunteers(response.data.volunteers || []);
    } catch (error: any) {
      console.error('Error fetching volunteers:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch volunteers');
        setVolunteers([]);
      }
    } finally {
      setVolunteersLoading(false);
    }
  }, [user, router]);

  // Fetch all cases once when user is available
  useEffect(() => {
    if (user && user.email && allCases.length === 0 && statusFilter !== 'donors' && statusFilter !== 'volunteers') {
      fetchAllCases();
    }
  }, [user, fetchAllCases, allCases.length, statusFilter]);
  
  // Fetch donors for chart data when user is available (fetch once)
  useEffect(() => {
    if (user && user.email && donors.length === 0) {
      fetchDonors();
    }
  }, [user, donors.length, fetchDonors]);

  // Filter cases when status filter changes (no API call)
  useEffect(() => {
    if (allCases.length > 0 && statusFilter !== 'donors' && statusFilter !== 'volunteers') {
      if (statusFilter === 'all') {
        setCases(allCases);
      } else if (statusFilter === 'pending') {
        // Pending cases: status is 'pending' AND no volunteerId (not assigned yet)
        setCases(allCases.filter(c => c.status === 'pending' && !c.volunteerId));
      } else if (statusFilter === 'verified-by-volunteer') {
        // Verified by volunteer: cases where volunteerApprovalStatus is 'approved' or 'rejected'
        setCases(allCases.filter(c => 
          c.volunteerApprovalStatus === 'approved' || c.volunteerApprovalStatus === 'rejected'
        ));
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

  // Fetch volunteers when volunteers tab is selected
  useEffect(() => {
    if (user && user.email && statusFilter === 'volunteers') {
      fetchVolunteers();
    }
  }, [statusFilter, user, fetchVolunteers]);

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

  const handleToggleVolunteerStatus = async (volunteerId: string, currentStatus: boolean) => {
    if (!user || !user.email) return;

    setTogglingVolunteer(volunteerId);
    try {
      const newStatus = !currentStatus;
      await api.post(`/admin/volunteers/${volunteerId}/toggle-status`, {
        adminEmail: user.email,
        isActive: newStatus,
      });
      toast.success(`Volunteer ${newStatus ? 'activated' : 'deactivated'} successfully`);
      // Update the volunteer in the list without refetching
      setVolunteers(prevVolunteers => 
        prevVolunteers.map(volunteer => 
          volunteer._id === volunteerId ? { ...volunteer, isActive: newStatus } : volunteer
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update volunteer status');
    } finally {
      setTogglingVolunteer(null);
      setShowVolunteerMenu(null);
    }
  };

  const handleAssignVolunteerClick = async (caseId: string) => {
    if (!user || !user.email) return;

    setSelectedCaseId(caseId);
    setShowAssignModal(true);
    setShowCaseMenu(null);
    setVolunteerSearchQuery(''); // Reset search when opening modal

    // Fetch active volunteers
    setAssigningVolunteersLoading(true);
    try {
      const response = await api.get(`/admin/volunteers?adminEmail=${encodeURIComponent(user.email)}`);
      const allVolunteers = response.data.volunteers || [];
      // Filter only active volunteers
      const activeVolunteers = allVolunteers.filter((v: any) => v.isActive === true);
      setAssigningVolunteers(activeVolunteers);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch volunteers');
      setAssigningVolunteers([]);
    } finally {
      setAssigningVolunteersLoading(false);
    }
  };

  const handleAssignCaseToVolunteer = async (volunteerId: string) => {
    if (!user || !user.email || !selectedCaseId) {
      console.error('Missing required data:', { user: !!user, email: user?.email, selectedCaseId });
      return;
    }

    console.log('Assigning case to volunteer - Frontend:', {
      caseId: selectedCaseId,
      volunteerId: volunteerId,
      adminEmail: user.email
    });

    setAssigningCase(selectedCaseId);
    try {
      const response = await api.post(`/admin/cases/${selectedCaseId}/assign-volunteer`, {
        adminEmail: user.email,
        volunteerId: volunteerId,
      });
      console.log('Assignment response:', response.data);
      toast.success('Case assigned to volunteer successfully');
      setShowAssignModal(false);
      setSelectedCaseId(null);
      
      // Refresh cases
      fetchAllCases();
    } catch (error: any) {
      console.error('Error assigning case:', error);
      toast.error(error.response?.data?.message || 'Failed to assign case to volunteer');
    } finally {
      setAssigningCase(null);
    }
  };

  if (!user) {
    return null;
  }

  // Calculate counts from allCases (always available, no filtering needed)
  const pendingCount = allCases.filter(c => c.status === 'pending' && !c.volunteerId).length;
  const acceptedCount = allCases.filter(c => c.status === 'accepted').length;
  const rejectedCount = allCases.filter(c => c.status === 'rejected').length;
  const verifiedByVolunteerCount = allCases.filter(c => 
    c.volunteerApprovalStatus === 'approved' || c.volunteerApprovalStatus === 'rejected'
  ).length;
  const totalCount = allCases.length;
  
  // Prepare chart data - Cases over last 7 days (Line Chart)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  const last7Days = getLast7Days();
  const casesOverTimeData = last7Days.map((day, index) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (6 - index));
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const casesOnDay = allCases.filter((c: Case) => {
      const caseDate = new Date(c.createdAt);
      return caseDate >= dayStart && caseDate <= dayEnd;
    }).length;
    
    return {
      date: day,
      Cases: casesOnDay,
    };
  });

  // Prepare stacked area chart data - Cases by status over weeks
  const getLast8Weeks = () => {
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 7; i >= 0; i--) {
      // Calculate the date for this week (i weeks ago)
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - (i * 7));
      
      // Get the Monday of that week (day 0 = Sunday, so Monday = 1)
      const day = weekDate.getDay();
      const diff = weekDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(weekDate);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(monday);
      const weekEnd = new Date(monday);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Format: "Jan 6" or "Jan 13" - show the Monday date
      const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weeks.push({ label: weekLabel, start: weekStart, end: weekEnd });
    }
    return weeks;
  };

  const last8Weeks = getLast8Weeks();
  const casesByWeekData = last8Weeks.map((week) => {
    const casesInWeek = allCases.filter((c: Case) => {
      const caseDate = new Date(c.createdAt);
      return caseDate >= week.start && caseDate <= week.end;
    });
    
    return {
      week: week.label,
      'Pending': casesInWeek.filter((c: Case) => c.status === 'pending' && !c.volunteerId).length,
      'Verified': casesInWeek.filter((c: Case) => c.volunteerApprovalStatus === 'approved' || c.volunteerApprovalStatus === 'rejected').length,
      'Approved': casesInWeek.filter((c: Case) => c.status === 'accepted').length,
      'Rejected': casesInWeek.filter((c: Case) => c.status === 'rejected').length,
    };
  });

  // Prepare stacked area chart data - Cases by status over months
  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    return months;
  };

  const last6Months = getLast6Months();
  const casesByMonthData = last6Months.map((month, index) => {
    const targetMonth = new Date();
    targetMonth.setMonth(targetMonth.getMonth() - (5 - index));
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const casesInMonth = allCases.filter((c: Case) => {
      const caseDate = new Date(c.createdAt);
      return caseDate >= monthStart && caseDate <= monthEnd;
    });
    
    return {
      month: month,
      'Pending': casesInMonth.filter((c: Case) => c.status === 'pending' && !c.volunteerId).length,
      'Verified': casesInMonth.filter((c: Case) => c.volunteerApprovalStatus === 'approved' || c.volunteerApprovalStatus === 'rejected').length,
      'Approved': casesInMonth.filter((c: Case) => c.status === 'accepted').length,
      'Rejected': casesInMonth.filter((c: Case) => c.status === 'rejected').length,
    };
  });

  // Use the selected view data
  const casesByStatusData = casesByStatusView === 'weekly' ? casesByWeekData : casesByMonthData;
  const casesByStatusDataKey = casesByStatusView === 'weekly' ? 'week' : 'month';

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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Cases Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Cases Submitted - Timeline</h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={casesOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={11}
                    fontWeight={500}
                    tick={{ fill: '#4b5563' }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={11}
                    fontWeight={500}
                    tick={{ fill: '#4b5563' }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ color: '#111827', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
                    itemStyle={{ color: '#374151', fontSize: '12px', padding: '2px 0' }}
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Cases" 
                    stroke="#6366f1" 
                    strokeWidth={2.5}
                    fill="url(#colorCases)"
                    dot={{ fill: '#6366f1', r: 3.5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Cases by Status Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Cases by Status - Timeline</h3>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setCasesByStatusView('weekly')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      casesByStatusView === 'weekly'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setCasesByStatusView('monthly')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      casesByStatusView === 'monthly'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={casesByStatusData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#fb923c" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis 
                    dataKey={casesByStatusDataKey} 
                    stroke="#6b7280"
                    fontSize={11}
                    fontWeight={500}
                    tick={{ fill: '#4b5563' }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={11}
                    fontWeight={500}
                    tick={{ fill: '#4b5563' }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ color: '#111827', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}
                    itemStyle={{ color: '#374151', fontSize: '12px', padding: '2px 0' }}
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', paddingBottom: '10px' }}
                    iconType="circle"
                    iconSize={8}
                    align="right"
                    verticalAlign="top"
                    formatter={(value) => <span style={{ color: '#374151', fontSize: '12px', fontWeight: 500 }}>{value}</span>}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Pending" 
                    stackId="1" 
                    stroke="#fb923c" 
                    strokeWidth={2}
                    fill="url(#colorPending)"
                    dot={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Verified" 
                    stackId="1" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fill="url(#colorVerified)"
                    dot={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Approved" 
                    stackId="1" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    fill="url(#colorApproved)"
                    dot={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Rejected" 
                    stackId="1" 
                    stroke="#f87171" 
                    strokeWidth={2}
                    fill="url(#colorRejected)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { value: 'all', label: 'All', icon: Eye },
              { value: 'pending', label: 'Pending', icon: Clock },
              { value: 'accepted', label: 'Approved', icon: CheckCircle },
              { value: 'rejected', label: 'Rejected', icon: XCircle },
              { value: 'verified-by-volunteer', label: 'Verified by volunteer', icon: Shield },
              { value: 'donors', label: 'Donors', icon: Users },
              { value: 'volunteers', label: 'Volunteers', icon: UserCheck },
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

          {/* Volunteers Table */}
          {statusFilter === 'volunteers' && (
            <>
              {volunteersLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading volunteers...</p>
                </div>
              ) : volunteers.length > 0 ? (
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
                        {volunteers.map((volunteer, index) => (
                          <motion.tr
                            key={volunteer._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-soft hover:bg-secondary/20 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{volunteer.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{volunteer.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{volunteer.phone || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleVolunteerStatus(volunteer._id, volunteer.isActive)}
                                disabled={togglingVolunteer === volunteer._id}
                                className={`relative inline-flex h-7 w-28 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                  volunteer.isActive ? 'bg-green-500' : 'bg-gray-300'
                                } ${togglingVolunteer === volunteer._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <span
                                  className={`absolute inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform z-10 ${
                                    volunteer.isActive ? 'translate-x-[5.5rem]' : 'translate-x-1'
                                  }`}
                                />
                                <span className={`absolute left-2 text-xs font-semibold text-white ${
                                  volunteer.isActive ? 'opacity-100' : 'opacity-0'
                                }`}>
                                  Active
                                </span>
                                <span className={`absolute right-2 text-xs font-semibold text-gray-600 ${
                                  !volunteer.isActive ? 'opacity-100' : 'opacity-0'
                                }`}>
                                  Disable
                                </span>
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="relative inline-block" ref={volunteerMenuRef}>
                                <button
                                  onClick={() => setShowVolunteerMenu(showVolunteerMenu === volunteer._id ? null : volunteer._id)}
                                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                                {showVolunteerMenu === volunteer._id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-soft z-10">
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          // View volunteer details - placeholder
                                          toast('View volunteer details - coming soon');
                                          setShowVolunteerMenu(null);
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
              ) : (
                <div className="glass-card p-12 text-center">
                  <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No volunteers found</p>
                  <p className="text-gray-500 text-sm mt-2">Volunteers will appear here once they register</p>
                </div>
              )}
            </>
          )}

          {/* Cases Table - Show for approved, rejected, and all */}
          {statusFilter !== 'donors' && statusFilter !== 'pending' && statusFilter !== 'volunteers' && (
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
                                      {statusFilter === 'pending' && (
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAssignVolunteerClick(caseItem._id);
                                          }}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-secondary transition-colors"
                                        >
                                          Assign Volunteer
                                        </button>
                                      )}
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

      {/* Assign Volunteer Modal */}
      {showAssignModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAssignModal(false);
            setSelectedCaseId(null);
            setAssigningVolunteers([]);
            setVolunteerSearchQuery('');
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-soft bg-gradient-to-r from-primary/5 to-purple-500/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-primary/20 rounded-2xl flex items-center justify-center">
                  <UserCheck className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Assign Volunteer</h2>
                  <p className="text-gray-600 text-sm">Select a volunteer to assign this case for verification</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCaseId(null);
                  setAssigningVolunteers([]);
                  setVolunteerSearchQuery('');
                }}
                className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            {assigningVolunteers.length > 0 && !assigningVolunteersLoading && (
              <div className="p-6 pt-4 border-b border-gray-soft bg-white/50">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search volunteers by name, email, or phone..."
                    value={volunteerSearchQuery}
                    onChange={(e) => setVolunteerSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {/* Volunteers List */}
            <div className="flex-1 overflow-y-auto p-6">
              {assigningVolunteersLoading ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading volunteers...</p>
                </div>
              ) : assigningVolunteers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-700 text-lg font-semibold mb-2">No active volunteers available</p>
                  <p className="text-gray-500 text-sm">Please activate volunteers from the Volunteers tab first</p>
                </div>
              ) : (() => {
                // Filter volunteers based on search query
                const filteredVolunteers = assigningVolunteers.filter((volunteer) => {
                  const query = volunteerSearchQuery.toLowerCase();
                  return (
                    volunteer.name.toLowerCase().includes(query) ||
                    volunteer.email.toLowerCase().includes(query) ||
                    (volunteer.phone && volunteer.phone.includes(query))
                  );
                });

                return filteredVolunteers.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No volunteers found</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search query</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                      {filteredVolunteers.length} {filteredVolunteers.length === 1 ? 'volunteer' : 'volunteers'} found
                    </p>
                    {filteredVolunteers.map((volunteer) => (
                      <motion.button
                        key={volunteer._id}
                        onClick={() => handleAssignCaseToVolunteer(volunteer._id)}
                        disabled={assigningCase === selectedCaseId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full p-5 border-2 border-gray-soft rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-primary/5 hover:border-purple-300 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                              <User className="w-7 h-7 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-base mb-1 group-hover:text-purple-700 transition-colors">
                                {volunteer.name}
                              </p>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <p className="text-sm text-gray-600 truncate">{volunteer.email}</p>
                                </div>
                                {volunteer.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm text-gray-500">{volunteer.phone}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {assigningCase === selectedCaseId ? (
                              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md group-hover:shadow-lg">
                                <UserPlus className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

