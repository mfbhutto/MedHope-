'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminHeader from '../../../components/AdminHeader';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getStoredUser } from '@/lib/auth';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Hospital,
  Stethoscope,
  AlertCircle,
  Heart,
  UserCheck,
  Users,
  Search,
  X,
} from 'lucide-react';

interface Case {
  _id: string;
  caseNumber: string;
  name: string;
  email: string;
  phone: string;
  cnic?: string;
  address?: string;
  district: string;
  area: string;
  manualArea?: string;
  // Financial Information
  age?: number;
  maritalStatus?: 'single' | 'married';
  numberOfChildren?: number;
  firstChildAge?: number;
  lastChildAge?: number;
  salaryRange?: string;
  houseOwnership?: 'own' | 'rent';
  rentAmount?: number;
  houseSize?: string;
  utilityBill?: string;
  zakatEligible: boolean;
  // Disease Information
  diseaseType: string;
  diseaseName: string;
  chronicDisease?: string;
  otherDisease?: string;
  manualDisease?: string;
  testNeeded?: boolean;
  selectedTests?: string[];
  description: string;
  hospitalName: string;
  doctorName: string;
  amountNeeded: number;
  document?: string;
  estimatedTotalCost: number;
  priority: string;
  status: string;
  isZakatEligible: boolean;
  volunteerId?: string;
  volunteerApprovalStatus?: 'pending' | 'approved' | 'rejected';
  volunteerRejectionReasons?: string[];
  totalDonations?: number;
  createdAt: string;
  updatedAt?: string;
}

export default function CaseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningVolunteers, setAssigningVolunteers] = useState<any[]>([]);
  const [assigningVolunteersLoading, setAssigningVolunteersLoading] = useState(false);
  const [assigningCase, setAssigningCase] = useState(false);
  const [volunteerSearchQuery, setVolunteerSearchQuery] = useState('');

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (user && user.email && caseId) {
      fetchCaseDetails();
    }
  }, [user, caseId]);

  const fetchCaseDetails = async () => {
    if (!user || !user.email || !caseId) return;
    
    setLoading(true);
    try {
      // Fetch single case by ID
      const response = await api.get(`/admin/cases/${caseId}?adminEmail=${encodeURIComponent(user.email)}`);
      
      if (response.data.case) {
        setCaseData(response.data.case);
      } else {
        toast.error('Case not found');
        router.push('/superadmin/pages/dashboard');
      }
    } catch (error: any) {
      console.error('Error fetching case details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch case details');
      router.push('/superadmin/pages/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this case? It will be visible to donors.')) {
      return;
    }

    setProcessing(true);
    try {
      await api.post('/cases/approve', { caseId, action: 'approve', adminEmail: user?.email });
      toast.success('Case approved successfully!');
      router.push('/superadmin/pages/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve case');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this case? This action cannot be undone.')) {
      return;
    }

    setProcessing(true);
    try {
      await api.post('/cases/approve', { caseId, action: 'reject', adminEmail: user?.email });
      toast.success('Case rejected');
      router.push('/superadmin/pages/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject case');
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignVolunteerClick = async () => {
    if (!user || !user.email) return;

    setShowAssignModal(true);
    setVolunteerSearchQuery('');

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
    if (!user || !user.email || !caseId) {
      return;
    }

    setAssigningCase(true);
    try {
      const response = await api.post(`/admin/cases/${caseId}/assign-volunteer`, {
        adminEmail: user.email,
        volunteerId: volunteerId,
      });
      toast.success('Case assigned to volunteer successfully');
      setShowAssignModal(false);
      
      // Refresh case data
      fetchCaseDetails();
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/superadmin/pages/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Error assigning case:', error);
      toast.error(error.response?.data?.message || 'Failed to assign case to volunteer');
    } finally {
      setAssigningCase(false);
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

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
        <AdminHeader />
        <div className="pt-32 pb-20 px-4">
          <div className="section-container max-w-7xl">
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading case details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <AdminHeader />
      
      <div className="pt-32 pb-20 px-4">
        <div className="section-container max-w-5xl">
          {/* Back Button */}
          <button
            onClick={() => router.push('/superadmin/pages/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          {/* Case Header */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="heading-lg mb-2">Case #{caseData.caseNumber}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(caseData.status)}`}>
                    {caseData.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(caseData.priority)}`}>
                    {caseData.priority} Priority
                  </span>
                  {caseData.isZakatEligible && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Zakat Eligible
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="glass-card p-6 mb-6">
            <h2 className="heading-md mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900">{caseData.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">CNIC</p>
                  <p className="font-semibold text-gray-900">{caseData.cnic || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{caseData.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-semibold text-gray-900">{caseData.phone}</p>
                </div>
              </div>
              {caseData.age && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-semibold text-gray-900">{caseData.age} years</p>
                  </div>
                </div>
              )}
              {caseData.maritalStatus && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Marital Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{caseData.maritalStatus}</p>
                  </div>
                </div>
              )}
              {caseData.maritalStatus === 'married' && caseData.numberOfChildren !== undefined && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Number of Children</p>
                    <p className="font-semibold text-gray-900">{caseData.numberOfChildren || 0}</p>
                    {caseData.firstChildAge && caseData.lastChildAge && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ages: {caseData.firstChildAge} - {caseData.lastChildAge} years
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">
                    {caseData.area}{caseData.manualArea ? ` (${caseData.manualArea})` : ''}, {caseData.district}
                  </p>
                </div>
              </div>
              {caseData.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Complete Address</p>
                    <p className="font-semibold text-gray-900">{caseData.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date Submitted</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(caseData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="glass-card p-6 mb-6">
            <h2 className="heading-md mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Financial Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {caseData.salaryRange && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                  <p className="font-semibold text-gray-900">{caseData.salaryRange}</p>
                </div>
              )}
              {caseData.houseOwnership && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">House Ownership</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {caseData.houseOwnership === 'own' ? 'Owned' : 'Rented'}
                    {caseData.houseOwnership === 'rent' && caseData.rentAmount && (
                      <span className="text-gray-600 ml-2">(PKR {caseData.rentAmount.toLocaleString()}/month)</span>
                    )}
                  </p>
                </div>
              )}
              {caseData.houseSize && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">House Size</p>
                  <p className="font-semibold text-gray-900">{caseData.houseSize}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Zakat Eligible</p>
                <p className="font-semibold text-gray-900">
                  {caseData.zakatEligible ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-600">No</span>
                  )}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Amount Needed</p>
                <p className="text-3xl font-bold text-primary">
                  PKR {caseData.estimatedTotalCost.toLocaleString()}
                </p>
              </div>
              {caseData.totalDonations !== undefined && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Donations Received</p>
                  <p className="text-xl font-bold text-green-600">
                    PKR {caseData.totalDonations.toLocaleString()}
                  </p>
                </div>
              )}
              {caseData.utilityBill && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-2">Utility Bill</p>
                  <a
                    href={caseData.utilityBill}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    View Utility Bill
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="glass-card p-6 mb-6">
            <h2 className="heading-md mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Medical Information
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Disease Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{caseData.diseaseType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Disease Name</p>
                  <p className="font-semibold text-gray-900">{caseData.diseaseName || 'N/A'}</p>
                </div>
              </div>
              {caseData.testNeeded !== undefined && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lab Tests Required</p>
                  <p className="font-semibold text-gray-900">
                    {caseData.testNeeded ? 'Yes' : 'No'}
                  </p>
                  {caseData.testNeeded && caseData.selectedTests && caseData.selectedTests.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Selected Tests:</p>
                      <div className="flex flex-wrap gap-2">
                        {caseData.selectedTests.map((test, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{caseData.description}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-3">
                  <Hospital className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Hospital Name</p>
                    <p className="font-semibold text-gray-900">{caseData.hospitalName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Doctor Name</p>
                    <p className="font-semibold text-gray-900">{caseData.doctorName}</p>
                  </div>
                </div>
              </div>
              {caseData.document && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Medical Document</p>
                  <a
                    href={caseData.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    View Medical Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {caseData.status === 'pending' && !caseData.volunteerId && (
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAssignVolunteerClick}
                  disabled={processing || assigningCase}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {assigningCase ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5" />
                      Assign Volunteer
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || assigningCase}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Case
                </button>
              </div>
            </div>
          )}

          {/* Volunteer Rejection Info */}
          {caseData.status === 'pending' && caseData.volunteerId && caseData.volunteerApprovalStatus === 'rejected' && (
            <div className="glass-card p-6 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-1">Volunteer Rejected This Case</h3>
                    <p className="text-sm text-red-700 mb-3">
                      The assigned volunteer has rejected this case. Please review the rejection reasons below and take appropriate action.
                    </p>
                    {caseData.volunteerRejectionReasons && caseData.volunteerRejectionReasons.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-2">Rejection Reasons:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {caseData.volunteerRejectionReasons.map((reason, index) => (
                            <li key={index} className="text-sm text-red-700">{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons for Verified by Volunteer Cases - Approved */}
          {caseData.status === 'pending' && caseData.volunteerId && caseData.volunteerApprovalStatus === 'approved' && (
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Approve Case
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Case
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons for Volunteer-Rejected Cases - Admin can still approve or reject */}
          {caseData.status === 'pending' && caseData.volunteerId && caseData.volunteerApprovalStatus === 'rejected' && (
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Approve Case
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Case
                </button>
              </div>
            </div>
          )}

          {/* Status Message for Approved/Rejected Cases */}
          {caseData.status !== 'pending' && (
            <div className="glass-card p-6">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                caseData.status === 'accepted' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {caseData.status === 'accepted' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className={`font-semibold ${
                    caseData.status === 'accepted' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Case {caseData.status === 'accepted' ? 'Approved' : 'Rejected'}
                  </p>
                  <p className={`text-sm ${
                    caseData.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    This case has been {caseData.status === 'accepted' ? 'approved and is visible to donors' : 'rejected'}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Volunteer Modal */}
      {showAssignModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAssignModal(false);
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
                        disabled={assigningCase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1 truncate">{volunteer.name}</h4>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  <span className="truncate">{volunteer.email}</span>
                                </div>
                                {volunteer.phone && (
                                  <div className="flex items-center gap-1 sm:ml-4">
                                    <Phone className="w-4 h-4" />
                                    <span>{volunteer.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {assigningCase && (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin ml-4"></div>
                          )}
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

