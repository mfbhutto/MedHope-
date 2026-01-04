'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/medhope/components/Navbar';
import { getStoredUser } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface NeedyPerson {
  _id: string;
  name: string;
  email: string;
  cnic: string;
  caseNumber: string;
  district: string;
  area: string;
  address: string;
  phone: string;
  age: number;
  maritalStatus: 'single' | 'married';
  numberOfChildren?: number;
  firstChildAge?: number;
  lastChildAge?: number;
  salaryRange: string;
  houseOwnership: 'own' | 'rent';
  rentAmount?: number;
  houseSize: string;
  zakatEligible: boolean;
  diseaseType: 'chronic' | 'other';
  chronicDisease?: string;
  otherDisease?: string;
  manualDisease?: string;
  testNeeded: boolean;
  selectedTests?: string[];
  description: string;
  hospitalName: string;
  doctorName: string;
  amountNeeded: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'accepted' | 'rejected';
  totalDonations?: number;
  utilityBill?: string;
  document?: string;
}

export default function NeedyPersonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [needyPerson, setNeedyPerson] = useState<NeedyPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | ''>('');
  const [cardNumber, setCardNumber] = useState('');
  const [walletType, setWalletType] = useState<'easypaisa' | 'jazcash' | ''>('');
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getStoredUser();
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    // Allow donors and superadmins/admins to view cases
    // Donors will see limited info, admins will see all info
    if (currentUser.role !== 'donor' && currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      router.push('/medhope/pages/donorprofile');
      return;
    }

    setUser(currentUser);
    fetchNeedyPerson();
  }, [router, params]);

  const fetchNeedyPerson = async () => {
    if (!params?.id) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/needypersons/${params.id}`);
      setNeedyPerson(response.data.needyPerson);
    } catch (error: any) {
      console.error('Error fetching needy person:', error);
      toast.error('Failed to load needy person details');
      router.push('/medhope/pages/needypersons');
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || cardNumber.replace(/\s/g, '').length < 16)) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }

    if (paymentMethod === 'wallet') {
      if (!walletType) {
        toast.error('Please select a wallet type');
        return;
      }
      if (!mobileNumber || mobileNumber.length !== 11) {
        toast.error('Please enter a valid 11-digit mobile number');
        return;
      }
    }

    setDonating(true);
    try {
      const currentUser = getStoredUser();
      if (!currentUser || !currentUser.email) {
        toast.error('Please login to make a donation');
        return;
      }

      const amount = parseFloat(donationAmount);
      const paymentMethodValue = paymentMethod === 'card' 
        ? 'card'
        : walletType === 'easypaisa' 
          ? 'easypaisa' 
          : 'jazzcash';
      
      // Generate a mock transaction ID for practice (in real app, this comes from payment gateway)
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const donationData = {
        caseId: params.id as string,
        amount: amount,
        paymentMethod: paymentMethodValue,
        transactionId: transactionId,
        donorEmail: currentUser.email,
        isZakatDonation: needyPerson?.zakatEligible || false,
      };

      const response = await api.post('/donations', donationData);
      
      toast.success(`Donation of PKR ${amount.toLocaleString()} submitted successfully!`);
      setDonationAmount('');
      setPaymentMethod('');
      setCardNumber('');
      setWalletType('');
      setMobileNumber('');
      // Refresh needy person data to update total donations
      fetchNeedyPerson();
    } catch (error: any) {
      console.error('Donation error:', error);
      toast.error(error.response?.data?.message || 'Donation failed');
    } finally {
      setDonating(false);
    }
  };

  const getDiseaseName = (): string => {
    if (!needyPerson) return '';
    if (needyPerson.diseaseType === 'chronic') {
      return needyPerson.chronicDisease || 'Chronic Disease';
    } else {
      if (needyPerson.otherDisease === 'Other') {
        return needyPerson.manualDisease || 'Other Disease';
      }
      return needyPerson.otherDisease || 'Other Disease';
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
        <Navbar />
        <div className="flex items-center justify-center h-screen pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!needyPerson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
        <Navbar />
        <div className="section-container pt-32 pb-12">
          <div className="glass-card p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Needy person not found.</p>
            <Link href="/medhope/pages/needypersons" className="btn-primary inline-block">
              ← Back to Needy Persons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const remainingAmount = needyPerson.amountNeeded - (needyPerson.totalDonations || 0);
  const progressPercentage = ((needyPerson.totalDonations || 0) / needyPerson.amountNeeded) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <Navbar />
      <div className="section-container pt-32 pb-12">
        {/* Back Button */}
        <Link
          href="/medhope/pages/needypersons"
          className="inline-flex items-center text-primary hover:text-primary-dark mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Needy Persons
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Header */}
            <div className="glass-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Case #{needyPerson.caseNumber}
                  </h1>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    needyPerson.priority === 'High' ? 'bg-red-100 text-red-800' :
                    needyPerson.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {needyPerson.priority} Priority
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    needyPerson.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    needyPerson.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {needyPerson.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="glass-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">CNIC</p>
                  <p className="text-gray-900">{needyPerson.cnic}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Age</p>
                  <p className="text-gray-900">{needyPerson.age} years</p>
                </div>
                {/* Phone - Only visible to superadmin */}
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-900">{needyPerson.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900">{needyPerson.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Marital Status</p>
                  <p className="text-gray-900 capitalize">{needyPerson.maritalStatus}</p>
                </div>
                {needyPerson.maritalStatus === 'married' && needyPerson.numberOfChildren && needyPerson.numberOfChildren > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Number of Children</p>
                      <p className="text-gray-900">{needyPerson.numberOfChildren}</p>
                    </div>
                    {needyPerson.firstChildAge && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">First Child Age</p>
                        <p className="text-gray-900">{needyPerson.firstChildAge} years</p>
                      </div>
                    )}
                    {needyPerson.lastChildAge && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Last Child Age</p>
                        <p className="text-gray-900">{needyPerson.lastChildAge} years</p>
                      </div>
                    )}
                  </>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="text-gray-900">{needyPerson.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">District</p>
                  <p className="text-gray-900">{needyPerson.district}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Area</p>
                  <p className="text-gray-900">{needyPerson.area}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="glass-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Salary Range</p>
                  <p className="text-gray-900">{needyPerson.salaryRange}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">House Ownership</p>
                  <p className="text-gray-900 capitalize">{needyPerson.houseOwnership}</p>
                </div>
                {needyPerson.houseOwnership === 'rent' && needyPerson.rentAmount && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Rent Amount</p>
                    <p className="text-gray-900">PKR {needyPerson.rentAmount.toLocaleString()}/month</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">House Size</p>
                  <p className="text-gray-900">{needyPerson.houseSize}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Zakat Eligible</p>
                  <p className="text-gray-900">
                    {needyPerson.zakatEligible ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-600">No</span>
                    )}
                  </p>
                </div>
                {/* Utility Bill - Only visible to superadmin */}
                {(user?.role === 'admin' || user?.role === 'superadmin') && needyPerson.utilityBill && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-2">Utility Bill</p>
                    <div className="mt-2">
                      {(() => {
                        // Normalize path - handle both old format (without /) and new format (with /)
                        let imagePath = needyPerson.utilityBill;
                        
                        // Remove 'uploads/' prefix if present (old format)
                        if (imagePath.startsWith('uploads/')) {
                          imagePath = `/${imagePath}`;
                        } else if (!imagePath.startsWith('/')) {
                          imagePath = `/${imagePath}`;
                        }
                        
                        // Check if it's an image file
                        const isImage = imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        
                        if (isImage) {
                          return (
                            <a
                              href={imagePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative w-full max-w-md"
                            >
                              <div className="relative w-full h-64 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-gray-50">
                                <img
                                  src={imagePath}
                                  alt="Utility Bill"
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<p class="text-gray-500 text-center p-4">Image not found. <a href="' + imagePath + '" target="_blank" class="text-primary underline">Click to view</a></p>';
                                    }
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
                            </a>
                          );
                        } else {
                          return (
                            <a
                              href={imagePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark underline"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              View Utility Bill (PDF/Document)
                            </a>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Disease Information */}
            <div className="glass-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Disease Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Disease Type</p>
                  <p className="text-gray-900 capitalize font-semibold">{needyPerson.diseaseType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Disease Name</p>
                  <p className="text-lg text-gray-900 font-semibold">{getDiseaseName()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{needyPerson.description}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Hospital</p>
                    <p className="text-gray-900 font-semibold">{needyPerson.hospitalName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Doctor</p>
                    <p className="text-gray-900 font-semibold">{needyPerson.doctorName}</p>
                  </div>
                </div>
                {needyPerson.testNeeded && needyPerson.selectedTests && needyPerson.selectedTests.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Required Tests</p>
                    <div className="flex flex-wrap gap-2">
                      {needyPerson.selectedTests.map((test, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Prescription/Medical Document - Visible to all (donors and admins) */}
                {needyPerson.document && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Prescription/Medical Document</p>
                    <div className="mt-2">
                      {(() => {
                        // Normalize path - handle both old format (without /) and new format (with /)
                        let imagePath = needyPerson.document;
                        
                        // Remove 'uploads/' prefix if present (old format)
                        if (imagePath.startsWith('uploads/')) {
                          imagePath = `/${imagePath}`;
                        } else if (!imagePath.startsWith('/')) {
                          imagePath = `/${imagePath}`;
                        }
                        
                        // Check if it's an image file
                        const isImage = imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        
                        if (isImage) {
                          return (
                            <a
                              href={imagePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative w-full"
                            >
                              <div className="relative w-full max-w-2xl rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden bg-gray-50">
                                <img
                                  src={imagePath}
                                  alt="Prescription/Medical Document"
                                  className="w-full h-auto max-h-96 object-contain"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<p class="text-gray-500 text-center p-4">Image not found. <a href="' + imagePath + '" target="_blank" class="text-primary underline">Click to view</a></p>';
                                    }
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-center">Click to view full size</p>
                            </a>
                          );
                        } else {
                          return (
                            <a
                              href={imagePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark underline font-medium"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              View Prescription/Medical Document (PDF/Document)
                            </a>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Donation Sidebar - Right Side (1 column) */}
          <div className="lg:col-span-1">
            <div className="glass-card sticky top-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>
              
              {/* Amount Needed */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Total Amount Needed</p>
                <p className="text-3xl font-bold text-primary">
                  PKR {needyPerson.amountNeeded.toLocaleString()}
                </p>
              </div>

              {/* Progress Bar */}
              {needyPerson.totalDonations && needyPerson.totalDonations > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Raised: PKR {(needyPerson.totalDonations || 0).toLocaleString()}</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Remaining: PKR {remainingAmount.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Zakat Badge */}
              {needyPerson.zakatEligible && (
                <div className="mb-6">
                  <span className="bg-golden text-white text-sm font-semibold px-4 py-2 rounded-full inline-block">
                    ✓ Zakat Eligible
                  </span>
                </div>
              )}

              {/* Donation Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Donation Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    className="input-field w-full"
                  />
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('card');
                        setWalletType('');
                        setMobileNumber('');
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-300 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="1" y="4" width="22" height="16" rx="2" strokeWidth="2"/>
                          <path d="M1 10h22" strokeWidth="2"/>
                        </svg>
                        <span className="text-sm font-medium">Card</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('wallet');
                        setCardNumber('');
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-300 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                          <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
                        </svg>
                        <span className="text-sm font-medium">Mobile Wallet</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Card Payment Section */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardNumber(value.replace(/(.{4})/g, '$1 ').trim());
                        }}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="input-field w-full"
                      />
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                          <svg width="48" height="30" viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="30" rx="4" fill="#1A1F71"/>
                            <path d="M19.5 9.5h9v11h-9z" fill="white"/>
                            <circle cx="33.5" cy="15" r="3.5" fill="#EB001B"/>
                            <circle cx="38.5" cy="15" r="3.5" fill="#F79E1B"/>
                          </svg>
                          <span className="text-xs font-bold text-gray-800">Visa</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                          <svg width="48" height="30" viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="30" rx="4" fill="#EB001B"/>
                            <circle cx="18" cy="15" r="7" fill="#F79E1B" opacity="0.8"/>
                            <circle cx="30" cy="15" r="7" fill="#EB001B" opacity="0.8"/>
                          </svg>
                          <span className="text-xs font-bold text-gray-800">Mastercard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Wallet Section */}
                {paymentMethod === 'wallet' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Wallet <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => setWalletType('easypaisa')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            walletType === 'easypaisa'
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-300 hover:border-green-600/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 flex items-center justify-center">
                              <img
                                src="/Easypaisa-logo.png"
                                alt="Easypaisa"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">Easypaisa</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWalletType('jazcash')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            walletType === 'jazcash'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-600/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 flex items-center justify-center">
                              <img
                                src="/jazz-cash-new-logo-png_seeklogo-613046.png"
                                alt="JazzCash"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">JazzCash</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    {walletType && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {walletType === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                            setMobileNumber(value);
                          }}
                          placeholder={walletType === 'easypaisa' ? '03XX-XXXXXXX' : '03XX-XXXXXXX'}
                          className="input-field w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter 11-digit mobile number</p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleDonate}
                  disabled={
                    donating ||
                    !donationAmount ||
                    parseFloat(donationAmount) <= 0 ||
                    !paymentMethod ||
                    (paymentMethod === 'card' && (!cardNumber || cardNumber.replace(/\s/g, '').length < 16)) ||
                    (paymentMethod === 'wallet' && (!walletType || !mobileNumber || mobileNumber.length !== 11))
                  }
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {donating ? 'Processing...' : 'Donate Now'}
                </button>
              </div>

              {/* Quick Donation Amounts */}
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-3">Quick Donate</p>
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDonationAmount(amount.toString())}
                      className="text-sm border border-gray-300 hover:border-primary hover:text-primary rounded-lg py-2 px-3 transition-colors"
                    >
                      PKR {amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Case Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Case Summary</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-semibold">Case:</span> #{needyPerson.caseNumber}</p>
                  <p><span className="font-semibold">Priority:</span> {needyPerson.priority}</p>
                  <p><span className="font-semibold">Status:</span> <span className="capitalize">{needyPerson.status}</span></p>
                  <p><span className="font-semibold">Location:</span> {needyPerson.area}, {needyPerson.district}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




