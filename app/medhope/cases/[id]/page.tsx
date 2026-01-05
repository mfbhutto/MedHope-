'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/app/medhope/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getStoredUser } from '@/lib/auth';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Hospital,
  Stethoscope,
  Heart,
  AlertCircle,
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

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser || currentUser.role !== 'accepter') {
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
      // Fetch single case by ID for the needy person
      const response = await api.get(`/cases/${caseId}?email=${encodeURIComponent(user.email)}`);
      
      if (response.data.case) {
        setCaseData(response.data.case);
      } else {
        toast.error('Case not found');
        router.push('/medhope/pages/needyprofile');
      }
    } catch (error: any) {
      console.error('Error fetching case details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch case details');
      router.push('/medhope/pages/needyprofile');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      accepted: 'bg-green-100 text-green-700 border-green-200',
      verified: 'bg-green-100 text-green-700 border-green-200',
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
        <Navbar />
        <div className="section-container pt-32 pb-20">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case details...</p>
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
      <Navbar />
      
      <div className="section-container pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push('/medhope/pages/needyprofile')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
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
              {caseData.totalDonations && caseData.totalDonations > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-primary">PKR {caseData.totalDonations.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="glass-card p-6 mb-6">
            <h2 className="heading-md mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Medical Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disease Type</p>
                <p className="font-semibold text-gray-900 capitalize">{caseData.diseaseType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Disease Name</p>
                <p className="font-semibold text-gray-900">{caseData.diseaseName}</p>
              </div>
              {caseData.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{caseData.description}</p>
                </div>
              )}
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
              {caseData.testNeeded && caseData.selectedTests && caseData.selectedTests.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Required Lab Tests</p>
                  <div className="flex flex-wrap gap-2">
                    {caseData.selectedTests.map((test, index) => (
                      <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {caseData.document && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Medical Document</p>
                  {(() => {
                    const docPath = caseData.document;
                    const isCloudinaryUrl = docPath.startsWith('http://') || docPath.startsWith('https://');
                    const isImage = docPath.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                      (isCloudinaryUrl && (docPath.includes('image/upload') || !docPath.includes('.pdf')));
                    
                    if (isImage) {
                      return (
                        <div>
                          <img
                            src={docPath}
                            alt="Medical Document"
                            className="max-w-full max-h-96 rounded-lg border border-gray-200 shadow-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <a
                            href={docPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-semibold inline-flex items-center gap-2 mt-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Full Size
                          </a>
                        </div>
                      );
                    }
                    return (
                      <a
                        href={docPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Medical Document
                      </a>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="glass-card p-6 mb-6">
            <h2 className="heading-md mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Financial Information
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount Needed</p>
                  <p className="text-2xl font-bold text-primary">PKR {caseData.amountNeeded.toLocaleString()}</p>
                </div>
                {caseData.totalDonations !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount Received</p>
                    <p className="text-2xl font-bold text-green-600">PKR {caseData.totalDonations.toLocaleString()}</p>
                    {caseData.amountNeeded > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Remaining: PKR {(caseData.amountNeeded - caseData.totalDonations).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {caseData.salaryRange && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                  <p className="font-semibold text-gray-900">{caseData.salaryRange}</p>
                </div>
              )}
              {caseData.houseOwnership && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">House Ownership</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {caseData.houseOwnership === 'own' ? 'Owned' : 'Rented'}
                      {caseData.houseOwnership === 'rent' && caseData.rentAmount && (
                        <span className="text-gray-600 ml-2">(PKR {caseData.rentAmount.toLocaleString()}/month)</span>
                      )}
                    </p>
                  </div>
                  {caseData.houseSize && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">House Size</p>
                      <p className="font-semibold text-gray-900">{caseData.houseSize}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Case Status Information */}
          <div className="glass-card p-6 mb-6">
            <h2 className="heading-md mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Case Timeline
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Date Submitted</p>
                <p className="font-semibold text-gray-900">
                  {new Date(caseData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {caseData.updatedAt && caseData.updatedAt !== caseData.createdAt && (
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(caseData.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="font-semibold text-gray-900 capitalize">{caseData.status}</p>
                {caseData.status === 'pending' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Your case is under review. You will be notified once it's been processed.
                  </p>
                )}
                {(caseData.status === 'accepted' || caseData.status === 'verified') && (
                  <p className="text-xs text-green-600 mt-1">
                    Your case has been approved and is now visible to donors.
                  </p>
                )}
                {caseData.status === 'rejected' && (
                  <p className="text-xs text-red-600 mt-1">
                    Your case has been rejected. Please contact support for more information.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

