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

  useEffect(() => {
    // Check if user is logged in and is a donor
    const currentUser = getStoredUser();
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    if (currentUser.role !== 'donor') {
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

    setDonating(true);
    try {
      // TODO: Implement donation API
      toast.success(`Donation of PKR ${parseFloat(donationAmount).toLocaleString()} submitted successfully!`);
      setDonationAmount('');
      // Refresh needy person data to update total donations
      fetchNeedyPerson();
    } catch (error: any) {
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
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-gray-900">{needyPerson.phone}</p>
                </div>
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
                {needyPerson.utilityBill && (
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
                <button
                  onClick={handleDonate}
                  disabled={donating || !donationAmount || parseFloat(donationAmount) <= 0}
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




